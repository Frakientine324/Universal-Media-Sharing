import {
  CreatePostBody,
  CreatePostResponse,
  DeletePostParams,
  GetPostParams,
  GetPostResponse,
  ListMyPostsResponse,
  ListPostsResponse,
} from '@workspace/api-zod';
import { db, objectUploadsTable, postsTable, usersTable } from '@workspace/db';
import { and, desc, eq, gt, isNull } from 'drizzle-orm';
import { Router, type IRouter } from 'express';

import { ObjectPermission } from '../lib/objectAcl';
import { isAllowedMediaType } from '../lib/media';
import { ObjectNotFoundError, ObjectStorageService } from '../lib/objectStorage';

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

function toPost(row: {
  id: string;
  caption: string;
  objectPath: string;
  mediaType: 'image' | 'video';
  fileName: string;
  authorId: string;
  authorFirstName: string | null;
  authorLastName: string | null;
  authorEmail: string | null;
  authorImage: string | null;
  createdAt: Date;
}) {
  const name = [row.authorFirstName, row.authorLastName]
    .filter(Boolean)
    .join(' ')
    .trim();
  return {
    id: row.id,
    caption: row.caption,
    objectPath: row.objectPath,
    mediaType: row.mediaType,
    fileName: row.fileName,
    authorId: row.authorId,
    authorName: name || row.authorEmail?.split('@')[0] || 'Creator',
    authorImage: row.authorImage,
    createdAt: row.createdAt.toISOString(),
  };
}

const postSelection = {
  id: postsTable.id,
  caption: postsTable.caption,
  objectPath: postsTable.objectPath,
  mediaType: postsTable.mediaType,
  fileName: postsTable.fileName,
  authorId: postsTable.authorId,
  authorFirstName: usersTable.firstName,
  authorLastName: usersTable.lastName,
  authorEmail: usersTable.email,
  authorImage: usersTable.profileImageUrl,
  createdAt: postsTable.createdAt,
};

router.get('/posts', async (_req, res): Promise<void> => {
  const rows = await db
    .select(postSelection)
    .from(postsTable)
    .innerJoin(usersTable, eq(postsTable.authorId, usersTable.id))
    .orderBy(desc(postsTable.createdAt));
  res.json(ListPostsResponse.parse(rows.map(toPost)));
});

router.get('/posts/mine', async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Sign in to view your posts' });
    return;
  }

  const rows = await db
    .select(postSelection)
    .from(postsTable)
    .innerJoin(usersTable, eq(postsTable.authorId, usersTable.id))
    .where(eq(postsTable.authorId, req.user.id))
    .orderBy(desc(postsTable.createdAt));
  res.json(ListMyPostsResponse.parse(rows.map(toPost)));
});

router.get('/posts/:id', async (req, res): Promise<void> => {
  const params = GetPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: 'Invalid post id' });
    return;
  }

  const [row] = await db
    .select(postSelection)
    .from(postsTable)
    .innerJoin(usersTable, eq(postsTable.authorId, usersTable.id))
    .where(eq(postsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }
  res.json(GetPostResponse.parse(toPost(row)));
});

router.post('/posts', async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Sign in to publish a post' });
    return;
  }

  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid post data' });
    return;
  }
  const input = parsed.data;
  if (!input.objectPath.startsWith('/objects/uploads/')) {
    res.status(400).json({ error: 'Invalid uploaded media path' });
    return;
  }

  const [upload] = await db
    .select()
    .from(objectUploadsTable)
    .where(
      and(
        eq(objectUploadsTable.objectPath, input.objectPath),
        eq(objectUploadsTable.ownerId, req.user.id),
        isNull(objectUploadsTable.postId),
        gt(objectUploadsTable.expiresAt, new Date()),
      ),
    );
  if (!upload) {
    res.status(400).json({ error: 'This upload is expired or already used' });
    return;
  }

  let objectFile;
  try {
    objectFile = await objectStorageService.getObjectEntityFile(input.objectPath);
    const [metadata] = await objectFile.getMetadata();
    const actualType = String(metadata.contentType || '').toLowerCase();
    const expectedType = input.mediaType === 'image' ? 'image/' : 'video/';
    if (
      actualType !== upload.contentType.toLowerCase() ||
      !isAllowedMediaType(actualType) ||
      !actualType.startsWith(expectedType) ||
      Number(metadata.size) !== upload.fileSize
    ) {
      res.status(400).json({ error: 'Uploaded media does not match its upload details' });
      return;
    }
    await objectStorageService.trySetObjectEntityAclPolicy(input.objectPath, {
      owner: req.user.id,
      visibility: 'public',
    });
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(400).json({ error: 'Upload the media file before publishing' });
      return;
    }
    req.log.error({ err: error }, 'Failed to validate uploaded media');
    res.status(500).json({ error: 'Could not validate uploaded media' });
    return;
  }

  try {
    const post = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(postsTable)
        .values({
          caption: input.caption,
          objectPath: input.objectPath,
          mediaType: input.mediaType,
          fileName: upload.fileName,
          authorId: req.user.id,
        })
        .returning();
      if (!created) throw new Error('Post creation did not return a record');

      const [claimedUpload] = await tx
        .update(objectUploadsTable)
        .set({ postId: created.id })
        .where(
          and(
            eq(objectUploadsTable.objectPath, upload.objectPath),
            eq(objectUploadsTable.ownerId, req.user.id),
            isNull(objectUploadsTable.postId),
            gt(objectUploadsTable.expiresAt, new Date()),
          ),
        )
        .returning({ objectPath: objectUploadsTable.objectPath });
      if (!claimedUpload) throw new Error('Upload was already published');
      return created;
    });

    res.status(201).json(
      CreatePostResponse.parse(
        toPost({
          ...post,
          authorFirstName: req.user.firstName,
          authorLastName: req.user.lastName,
          authorEmail: req.user.email,
          authorImage: req.user.profileImageUrl,
        }),
      ),
    );
  } catch (error) {
    req.log.error({ err: error }, 'Failed to create post');
    res.status(409).json({ error: 'This media could not be published' });
  }
});

router.delete('/posts/:id', async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: 'Sign in to delete a post' });
    return;
  }

  const params = DeletePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: 'Invalid post id' });
    return;
  }

  const [post] = await db
    .select()
    .from(postsTable)
    .where(
      and(
        eq(postsTable.id, params.data.id),
        eq(postsTable.authorId, req.user.id),
      ),
    );
  if (!post) {
    res.status(404).json({ error: 'Post not found' });
    return;
  }

  try {
    const file = await objectStorageService.getObjectEntityFile(post.objectPath);
    await file.delete({ ignoreNotFound: true });
    await db.delete(postsTable).where(eq(postsTable.id, post.id));
    await db
      .delete(objectUploadsTable)
      .where(eq(objectUploadsTable.objectPath, post.objectPath));
    res.sendStatus(204);
  } catch (error) {
    req.log.error({ err: error, postId: post.id }, 'Failed to delete post');
    res.status(500).json({ error: 'Could not delete post media' });
  }
});

export default router;

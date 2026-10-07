import { getGetPostQueryKey, useGetPost } from '@workspace/api-client-react';
import { useParams } from 'wouter';
import { BackToGallery, CopyLinkButton, ErrorState, Media } from '@/components/media-board';

export function PostDetailPage() {
  const params = useParams<{ id: string }>();
  const postId = params.id || '';
  const postQuery = useGetPost(postId, { query: { enabled: !!postId, queryKey: getGetPostQueryKey(postId) } });
  if (postQuery.isLoading) return <main className="mx-auto min-h-[75vh] max-w-[1150px] px-5 py-12 sm:px-8"><div className="h-5 w-36 animate-pulse rounded bg-[hsl(var(--muted))]" /><div className="mt-8 aspect-[4/3] animate-pulse rounded-[28px] bg-[hsl(var(--muted))]" /></main>;
  if (postQuery.isError || !postQuery.data) return <main className="mx-auto min-h-[70vh] max-w-[1000px] px-5 py-12 sm:px-8"><BackToGallery /><div className="mt-10"><ErrorState retry={() => void postQuery.refetch()} /></div></main>;
  const post = postQuery.data;
  return <main className="page-enter mx-auto min-h-[78vh] max-w-[1150px] px-5 py-9 sm:px-8 sm:py-12">
    <BackToGallery />
    <article className="mt-7 grid overflow-hidden rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_18px_50px_-38px_hsl(172_24%_17%/.55)] lg:grid-cols-[1.35fr_.65fr]">
      <Media post={post} className="aspect-[4/3] lg:aspect-auto lg:min-h-[610px]" />
      <div className="flex flex-col p-6 sm:p-8 lg:p-9">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[hsl(var(--secondary))] text-sm font-bold text-[hsl(var(--primary))]">{post.authorImage ? <img src={post.authorImage} alt="" className="h-full w-full object-cover" /> : (post.authorName || 'C').slice(0, 1)}</span>
          <div className="min-w-0"><p className="truncate text-sm font-bold" data-testid="text-detail-author">{post.authorName || 'A creator'}</p><time dateTime={post.createdAt} className="mt-1 block font-mono text-[10px] uppercase tracking-[.08em] text-[hsl(var(--muted-foreground))]" data-testid="text-detail-date">{new Date(post.createdAt).toLocaleString(undefined, { dateStyle: 'long' })}</time></div>
        </div>
        <div className="my-7 h-px bg-[hsl(var(--border))]" />
        <p className="font-mono text-[10px] uppercase tracking-[.18em] text-[hsl(var(--accent))]">{post.mediaType === 'video' ? 'A moving moment' : 'A moment in a frame'}</p>
        <h1 className="mt-4 break-words font-serif text-[clamp(2rem,4vw,3rem)] font-semibold leading-[1.05] tracking-[-.055em]" data-testid="text-detail-caption">{post.caption || post.fileName}</h1>
        <div className="mt-auto pt-10"><CopyLinkButton postId={post.id} /><p className="mt-4 font-mono text-[9px] uppercase tracking-[.14em] text-[hsl(var(--muted-foreground))]">An open gallery, shared everywhere.</p></div>
      </div>
    </article>
  </main>;
}

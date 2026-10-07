import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, Camera, Check, ChevronLeft, CirclePlay, Copy, ImagePlus, LoaderCircle, LogIn, Plus, Share2, Trash2, Video } from 'lucide-react';
import type { Post } from '@workspace/api-client-react';
import { useAuth } from '@workspace/replit-auth-web';

export const mediaUrl = (objectPath: string) => `/api/storage${objectPath}`;

export function Header({ onCreate }: { onCreate: () => void }) {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.94)] backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3" data-testid="link-home">
          <span className="grid h-10 w-10 rotate-[-5deg] place-items-center rounded-[14px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] transition-transform group-hover:rotate-0"><Camera size={20} strokeWidth={2.3} /></span>
          <span className="font-serif text-[23px] font-bold tracking-[-.04em]">media<span className="text-[hsl(var(--accent))]">board</span></span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          <Link href="/" className="text-sm font-semibold text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))]" data-testid="link-gallery">The gallery</Link>
          <Link href="/my-posts" className="text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]" data-testid="link-my-posts">My posts</Link>
          {isAuthenticated ? <button onClick={logout} className="text-sm font-semibold text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]" data-testid="button-logout">Log out</button> : null}
        </nav>
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? <span className="hidden max-w-[130px] truncate text-sm font-semibold text-[hsl(var(--muted-foreground))] lg:block" data-testid="text-username">{user.firstName || user.email || 'Creator'}</span> : null}
          <button onClick={onCreate} className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition-transform hover:-translate-y-0.5" data-testid="button-create-post"><Plus size={17} /> <span className="hidden sm:inline">Share a moment</span><span className="sm:hidden">Post</span></button>
          {!isAuthenticated && <button onClick={login} aria-label="Sign in" className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--card))] md:hidden" data-testid="button-sign-in-mobile"><LogIn size={18} /></button>}
        </div>
      </div>
      <div className="flex border-t border-[hsl(var(--border)/.65)] px-5 py-2 md:hidden">
        <Link href="/" className="flex-1 py-1 text-center text-xs font-bold tracking-wide text-[hsl(var(--primary))]" data-testid="mobile-link-gallery">Gallery</Link>
        <Link href="/my-posts" className="flex-1 py-1 text-center text-xs font-bold tracking-wide text-[hsl(var(--muted-foreground))]" data-testid="mobile-link-my-posts">My posts</Link>
      </div>
    </header>
  );
}

export function Media({ post, className = '' }: { post: Post; className?: string }) {
  const source = mediaUrl(post.objectPath);
  return <div className={`media-frame overflow-hidden ${className}`}>{post.mediaType === 'video' ? <video src={source} controls playsInline preload="metadata" aria-label={post.caption || post.fileName} /> : <img src={source} alt={post.caption || post.fileName} loading="lazy" />}</div>;
}

export function PostCard({ post, compact = false }: { post: Post; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const href = `/post/${encodeURIComponent(post.id)}`;
  const share = async () => {
    const url = `${window.location.origin}${href}`;
    if (navigator.share) {
      try { await navigator.share({ title: post.caption || 'A moment on Media Board', url }); } catch { /* share sheet dismissed */ }
      return;
    }
    try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { window.prompt('Copy this link', url); }
  };
  return <article className="group overflow-hidden rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_7px_26px_-20px_hsl(172_24%_17%/.35)] transition-transform duration-300 hover:-translate-y-1" data-testid={`card-post-${post.id}`}>
    <Link href={href} className="relative block aspect-[4/3] overflow-hidden" aria-label={`Open post by ${post.authorName}`} data-testid={`link-post-${post.id}`}>
      {post.mediaType === 'video' ? <video src={mediaUrl(post.objectPath)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" muted playsInline preload="metadata" /> : <img src={mediaUrl(post.objectPath)} alt={post.caption || post.fileName} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.025]" />}
      {post.mediaType === 'video' && <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--foreground)/.78)] text-[hsl(var(--background))]"><CirclePlay size={20} /></span>}
    </Link>
    <div className="px-4 pb-4 pt-3.5 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center overflow-hidden rounded-full bg-[hsl(var(--secondary))] text-[10px] font-bold uppercase text-[hsl(var(--primary))]">{post.authorImage ? <img src={post.authorImage} alt="" className="h-full w-full object-cover" /> : (post.authorName || 'C').slice(0, 1)}</span>
            <span className="truncate text-xs font-bold text-[hsl(var(--foreground))]" data-testid={`text-author-${post.id}`}>{post.authorName || 'A creator'}</span>
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">·</span>
            <time className="truncate font-mono text-[10px] text-[hsl(var(--muted-foreground))]" dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</time>
          </div>
          {!compact && post.caption && <p className="line-clamp-2 text-[14px] leading-[1.5] text-[hsl(var(--foreground))]" data-testid={`text-caption-${post.id}`}>{post.caption}</p>}
          {compact && <p className="truncate text-sm text-[hsl(var(--muted-foreground))]">{post.caption || post.fileName}</p>}
        </div>
        <button onClick={share} aria-label="Share post" className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]" data-testid={`button-share-${post.id}`}>{copied ? <Check size={16} /> : <Share2 size={16} />}</button>
      </div>
    </div>
  </article>;
}

export function PostGrid({ posts, compact = false }: { posts: Post[]; compact?: boolean }) {
  if (!posts.length) return <EmptyState />;
  return <div className="stagger grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="grid-posts">{posts.map(post => <PostCard key={post.id} post={post} compact={compact} />)}</div>;
}

export function EmptyState({ children }: { children?: ReactNode }) {
  return <div className="mx-auto flex max-w-xl flex-col items-center py-20 text-center" data-testid="empty-posts">
    <div className="relative mb-7 grid h-24 w-24 rotate-[-4deg] place-items-center rounded-[30px] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><ImagePlus size={37} /><span className="absolute -right-2 -top-2 grid h-8 w-8 rotate-[9deg] place-items-center rounded-full bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"><Plus size={17} /></span></div>
    <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">A little room for wonder</p>
    <h2 className="font-serif text-3xl font-semibold tracking-[-.04em]">The first moment is yours.</h2>
    <p className="mt-3 max-w-sm text-sm leading-6 text-[hsl(var(--muted-foreground))]">{children || 'This gallery is still taking shape. Share a photo or video and give it a beginning.'}</p>
  </div>;
}

export function LoadingGrid() {
  return <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading posts" data-testid="loading-posts">{[0,1,2].map(item => <div className="overflow-hidden rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))]" key={item}><div className="aspect-[4/3] animate-pulse bg-[hsl(var(--muted))]" /><div className="space-y-3 p-5"><div className="h-3 w-2/5 animate-pulse rounded-full bg-[hsl(var(--muted))]" /><div className="h-4 w-4/5 animate-pulse rounded-full bg-[hsl(var(--muted))]" /></div></div>)}</div>;
}

export function ErrorState({ retry }: { retry: () => void }) {
  return <div className="rounded-2xl border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.06)] p-8 text-center" role="alert" data-testid="error-posts"><p className="font-serif text-2xl">That didn’t load.</p><p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">The gallery will be here when the connection is ready.</p><button onClick={retry} className="mt-5 rounded-full bg-[hsl(var(--foreground))] px-5 py-2.5 text-sm font-bold text-[hsl(var(--background))]" data-testid="button-retry">Try again</button></div>;
}

type UploadReply = { uploadURL: string; objectPath: string };
export function CreatePostDialog({ open, onClose, onSignIn, requestUpload, createPost, busy }: {
  open: boolean; onClose: () => void; onSignIn: () => void;
  requestUpload: (args: { data: { name: string; size: number; contentType: string } }) => Promise<UploadReply>;
  createPost: (args: { data: { caption: string; objectPath: string; mediaType: 'image' | 'video'; fileName: string } }) => Promise<unknown>;
  busy: boolean;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [open, onClose]);
  if (!open) return null;
  const selectFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0];
    if (!next) return;
    if (!next.type.startsWith('image/') && !next.type.startsWith('video/')) { setError('Choose an image or video file.'); return; }
    if (next.size > 262144000) { setError('This file is over the 250 MB limit.'); return; }
    setError(''); setFile(next);
  };
  const publish = async () => {
    if (!isAuthenticated) { onSignIn(); return; }
    if (!file) { setError('Add a photo or video to continue.'); return; }
    if (!file.type) { setError('This file is missing its media type. Try another file.'); return; }
    setError('');
    try {
      const upload = await requestUpload({ data: { name: file.name, size: file.size, contentType: file.type } });
      const put = await fetch(upload.uploadURL, { method: 'PUT', headers: { 'Content-Type': file.type }, body: file });
      if (!put.ok) throw new Error('The upload did not finish. Please try again.');
      await createPost({ data: { caption: caption.trim(), objectPath: upload.objectPath, mediaType: file.type.startsWith('video/') ? 'video' : 'image', fileName: file.name } });
      setCaption(''); setFile(null); onClose();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not publish this moment. Please try again.'); }
  };
  const authNeeded = !isLoading && !isAuthenticated;
  return <div className="fixed inset-0 z-[60] flex items-end justify-center bg-[hsl(172_24%_12%/.54)] p-0 backdrop-blur-[3px] sm:items-center sm:p-5" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="create-title" className="page-enter w-full max-w-[540px] rounded-t-[28px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 pb-7 pt-6 shadow-2xl sm:rounded-[28px] sm:px-8">
      <div className="mb-6 flex items-start justify-between"><div><p className="font-mono text-[10px] font-medium uppercase tracking-[.19em] text-[hsl(var(--primary))]">Make it public</p><h2 id="create-title" className="mt-1 font-serif text-3xl font-semibold tracking-[-.045em]">Share a moment</h2></div><button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full bg-[hsl(var(--muted))] text-xl" aria-label="Close upload" data-testid="button-close-upload">×</button></div>
      {!isAuthenticated && <div className="mb-4 rounded-xl bg-[hsl(var(--secondary)/.8)] p-4 text-sm leading-6 text-[hsl(var(--foreground))]"><strong>Everyone can browse.</strong> Sign in when you’re ready to add your own work.{authNeeded && <button onClick={onSignIn} className="ml-2 inline-flex items-center gap-1 font-bold text-[hsl(var(--primary))]" data-testid="button-sign-in-upload">Sign in <ArrowUpRight size={14} /></button>}</div>}
      <button onClick={() => input.current?.click()} className={`flex w-full flex-col items-center justify-center rounded-[20px] border border-dashed px-5 text-center transition-colors ${file ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.06)] py-6' : 'border-[hsl(var(--border))] bg-[hsl(var(--background))] py-9 hover:border-[hsl(var(--primary))]'}`} data-testid="button-choose-file">
        <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">{file?.type.startsWith('video/') ? <Video size={23} /> : <ImagePlus size={23} />}</span>
        <span className="max-w-full truncate text-sm font-bold">{file ? file.name : 'Choose a photo or video'}</span>
        <span className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">{file ? `${(file.size / 1024 / 1024).toFixed(1)} MB · Tap to change` : 'JPG, PNG, GIF, MP4 · Up to 250 MB'}</span>
      </button>
      <input ref={input} type="file" accept="image/*,video/*" className="sr-only" onChange={selectFile} data-testid="input-media-file" />
      <label className="mt-5 block text-xs font-bold uppercase tracking-[.11em] text-[hsl(var(--muted-foreground))]" htmlFor="post-caption">A few words <span className="font-normal normal-case tracking-normal">(optional)</span></label>
      <textarea id="post-caption" value={caption} onChange={event => setCaption(event.target.value)} maxLength={2200} rows={3} placeholder="What’s the story behind this one?" className="mt-2 w-full resize-none rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-4 py-3 text-sm leading-6 outline-none placeholder:text-[hsl(var(--muted-foreground)/.75)] focus:border-[hsl(var(--primary))]" data-testid="input-caption" />
      <div className="mt-4 flex items-center justify-between gap-3"><p className="text-xs text-[hsl(var(--muted-foreground))]" role="status" data-testid="status-upload">{busy ? <span className="inline-flex items-center gap-2"><LoaderCircle className="animate-spin" size={14} /> Uploading your moment…</span> : error && <span className="text-[hsl(var(--destructive))]">{error}</span>}</p><button onClick={publish} disabled={busy || isLoading} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] disabled:cursor-not-allowed disabled:opacity-55" data-testid="button-publish">{busy ? 'Publishing' : <>Publish <ArrowUpRight size={16} /></>}</button></div>
    </section>
  </div>;
}

export function CreatorPostCard({ post, onDelete, deleting }: { post: Post; onDelete: () => void; deleting: boolean }) {
  return <div className="relative"><PostCard post={post} compact /><button onClick={onDelete} disabled={deleting} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-[hsl(var(--card)/.94)] text-[hsl(var(--destructive))] shadow-sm hover:bg-[hsl(var(--destructive))] hover:text-white disabled:opacity-60" aria-label={`Delete ${post.fileName}`} data-testid={`button-delete-${post.id}`}>{deleting ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}</button></div>;
}

export function BackToGallery() { return <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[hsl(var(--primary))] hover:underline" data-testid="link-back-gallery"><ChevronLeft size={16} /> Back to the gallery</Link>; }
export function CopyLinkButton({ postId }: { postId: string }) {
  const [copied, setCopied] = useState(false);
  return <button onClick={async () => {
    const url = `${window.location.origin}/post/${encodeURIComponent(postId)}`;
    if (navigator.share) { try { await navigator.share({ title: 'A moment on Media Board', url }); } catch { /* dismissed */ } }
    else { try { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { window.prompt('Copy this link', url); } }
  }} className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-4 py-2.5 text-sm font-bold hover:bg-[hsl(var(--secondary))]" data-testid="button-share-detail">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Link copied' : 'Share this moment'}</button>;
}

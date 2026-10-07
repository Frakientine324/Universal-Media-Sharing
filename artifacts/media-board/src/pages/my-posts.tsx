import { useQueryClient } from '@tanstack/react-query';
import { getListMyPostsQueryKey, getListPostsQueryKey, useDeletePost, useListMyPosts } from '@workspace/api-client-react';
import { useAuth } from '@workspace/replit-auth-web';
import { ArrowUpRight, LogIn } from 'lucide-react';
import { useState } from 'react';
import { CreatorPostCard, EmptyState, ErrorState, LoadingGrid } from '@/components/media-board';

function CreatorPosts({ onCreate }: { onCreate: () => void }) {
  const query = useListMyPosts();
  const deletion = useDeletePost();
  const cache = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState(false);
  const remove = (id: string) => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    setDeleteError(false);
    setDeletingId(id);
    deletion.mutate({ id }, {
      onSuccess: () => {
        void cache.invalidateQueries({ queryKey: getListMyPostsQueryKey() });
        void cache.invalidateQueries({ queryKey: getListPostsQueryKey() });
        setDeletingId(null);
      },
      onError: () => { setDeletingId(null); setDeleteError(true); },
    });
  };
  if (query.isLoading) return <LoadingGrid />;
  if (query.isError) return <ErrorState retry={() => void query.refetch()} />;
  const posts = query.data || [];
  if (!posts.length) return <div className="text-center"><EmptyState>Your own corner of the gallery is ready. Add a photo or video to start your collection.</EmptyState><button onClick={onCreate} className="mt-[-20px] rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-first-post">Share your first moment</button></div>;
  return <div>{deleteError && <p role="alert" className="mb-5 rounded-xl border border-[hsl(var(--destructive)/.3)] bg-[hsl(var(--destructive)/.06)] px-4 py-3 text-sm text-[hsl(var(--destructive))]" data-testid="status-delete-error">That post couldn’t be removed. Please try again.</p>}<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" data-testid="grid-my-posts">{posts.map(post => <CreatorPostCard key={post.id} post={post} onDelete={() => remove(post.id)} deleting={deletingId === post.id} />)}</div></div>;
}

export function MyPostsPage({ onCreate }: { onCreate: () => void }) {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  if (isLoading) return <main className="mx-auto min-h-[70vh] max-w-[1320px] px-5 py-14 sm:px-8"><div className="mb-10 h-12 w-64 animate-pulse rounded-xl bg-[hsl(var(--muted))]" /><LoadingGrid /></main>;
  if (!isAuthenticated) return <main className="page-enter mx-auto flex min-h-[76vh] max-w-[1320px] items-center justify-center px-5 py-16 sm:px-8">
    <section className="max-w-lg text-center"><div className="mx-auto mb-7 grid h-20 w-20 rotate-[-5deg] place-items-center rounded-[26px] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><LogIn size={31} /></div><p className="mb-3 font-mono text-[10px] uppercase tracking-[.19em] text-[hsl(var(--accent))]">Your own little corner</p><h1 className="font-serif text-5xl font-semibold tracking-[-.06em]">Keep your moments close.</h1><p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-[hsl(var(--muted-foreground))]">Sign in to see the photos and videos you’ve shared with the gallery.</p><button onClick={login} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-6 py-3.5 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-sign-in-my-posts">Sign in to continue <ArrowUpRight size={17} /></button><p className="mt-5 text-xs text-[hsl(var(--muted-foreground))]">The public gallery stays open to everyone.</p></section>
  </main>;
  return <main className="page-enter mx-auto min-h-[75vh] max-w-[1320px] px-5 py-12 sm:px-8 sm:py-16">
    <div className="mb-9 flex flex-col justify-between gap-5 sm:mb-12 sm:flex-row sm:items-end">
      <div><p className="mb-3 font-mono text-[10px] uppercase tracking-[.2em] text-[hsl(var(--accent))]">Made by you</p><h1 className="font-serif text-[clamp(3rem,6vw,5rem)] font-semibold leading-[.93] tracking-[-.065em]">Your moments<span className="text-[hsl(var(--primary))]">.</span></h1><p className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">A small collection by {user?.firstName || 'you'}.</p></div>
      <button onClick={onCreate} className="inline-flex w-fit items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))]" data-testid="button-create-from-my-posts"><span>Share a moment</span><ArrowUpRight size={16} /></button>
    </div>
    <CreatorPosts onCreate={onCreate} />
  </main>;
}

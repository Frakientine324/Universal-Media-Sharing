import { type ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CreatePostDialog, Header } from '@/components/media-board';
import { getListMyPostsQueryKey, getListPostsQueryKey, useCreatePost, useRequestUploadUrl } from '@workspace/api-client-react';
import { useAuth } from '@workspace/replit-auth-web';
import { HomePage } from '@/pages/home';
import { MyPostsPage } from '@/pages/my-posts';
import { PostDetailPage } from '@/pages/post-detail';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Site() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { login } = useAuth();
  const cache = useQueryClient();
  const uploadUrl = useRequestUploadUrl();
  const createPost = useCreatePost();
  const busy = uploadUrl.isPending || createPost.isPending;
  const close = () => setUploadOpen(false);
  const requireSignIn = () => { close(); login(); };
  const publish = async (args: Parameters<typeof createPost.mutateAsync>[0]) => {
    const result = await createPost.mutateAsync(args);
    await Promise.all([
      cache.invalidateQueries({ queryKey: getListPostsQueryKey() }),
      cache.invalidateQueries({ queryKey: getListMyPostsQueryKey() }),
    ]);
    return result;
  };
  return <div className="grain min-h-[100dvh] bg-[hsl(var(--background))]">
    <Header onCreate={() => setUploadOpen(true)} />
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={() => <HomePage onCreate={() => setUploadOpen(true)} />} />
        <Route path="/post/:id" component={PostDetailPage} />
        <Route path="/my-posts" component={() => <MyPostsPage onCreate={() => setUploadOpen(true)} />} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
    <CreatePostDialog open={uploadOpen} onClose={close} onSignIn={requireSignIn}
      requestUpload={(args) => uploadUrl.mutateAsync(args)}
      createPost={publish}
      busy={busy}
    />
  </div>;
}

function App() {
  return <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Site />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  </QueryClientProvider>;
}

export default App;

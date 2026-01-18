import {
  createRootRouteWithContext,
  Outlet,
  useRouter,
} from '@tanstack/react-router';
import { AuthProvider } from '../providers/AuthProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';
import type { RouterContext } from '../lib/routerContext';

function RootComponent() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Update router context when auth changes; merge to preserve queryClient
    router.update({
      context: {
        ...router.options.context,
        auth: {
          user: auth.user,
          loading: auth.loading,
        },
      },
    });
    // Invalidate router to re-evaluate route guards
    router.invalidate();
  }, [auth.user, auth.loading, router]);

  return <Outlet />;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <QueryProvider>
      <AuthProvider>
        <RootComponent />
      </AuthProvider>
    </QueryProvider>
  ),
});

import { createRootRoute, Outlet, useRouter } from '@tanstack/react-router';
import { AuthProvider } from '../providers/AuthProvider';
import { QueryProvider } from '../providers/QueryProvider';
import { useAuth } from '../contexts/AuthContext';
import { useEffect } from 'react';

function RootComponent() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Update router context when auth changes
    router.update({
      context: {
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

export const Route = createRootRoute({
  component: () => (
    <QueryProvider>
      <AuthProvider>
        <RootComponent />
      </AuthProvider>
    </QueryProvider>
  ),
});

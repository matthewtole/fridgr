import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { Header } from '../components/Header/Header';
import { css } from '../../styled-system/css';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context, location }) => {
    const auth = (context as { auth?: { user: unknown; loading: boolean } })
      .auth;

    if (!auth) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }

    if (auth.loading) {
      // Wait for auth to load - return undefined to allow route to load
      // The component will handle showing loading state
      return;
    }

    if (!auth.user) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return (
    <div
      className={css({
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Header />
      <main
        className={css({
          flex: 1,
        })}
      >
        <Outlet />
      </main>
    </div>
  );
}

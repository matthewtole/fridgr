import type { QueryClient } from '@tanstack/react-query';

export interface RouterContext {
  queryClient: QueryClient;
  auth: {
    user: unknown;
    loading: boolean;
  };
}

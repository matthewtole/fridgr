import { useQuery } from '@tanstack/react-query';
import { locationsQueryOptions } from '../lib/queries/locations';

export function useLocations() {
  return useQuery(locationsQueryOptions());
}

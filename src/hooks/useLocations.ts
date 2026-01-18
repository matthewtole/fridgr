import { useQuery } from '@tanstack/react-query';
import { fetchLocations } from '../lib/queries/locations';

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
    staleTime: 5 * 60 * 1000, // 5 minutes - locations don't change often
  });
}

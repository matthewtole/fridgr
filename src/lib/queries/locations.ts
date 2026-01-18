import { queryOptions } from '@tanstack/react-query';
import { supabase } from '../supabase';
import type { Database } from '../../types/database';

type Location = Database['public']['Tables']['locations']['Row'];

export const locationKeys = {
  all: ['locations'] as const,
};

export function locationsQueryOptions() {
  return queryOptions({
    queryKey: locationKeys.all,
    queryFn: fetchLocations,
    staleTime: 5 * 60 * 1000, // 5 minutes - locations don't change often
  });
}

export async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch locations: ${error.message}`);
  }

  return data || [];
}

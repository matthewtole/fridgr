import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  inventoryQueryOptions,
  inventoryItemQueryOptions,
  inventoryKeys,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  parseInventoryText,
  createInventoryItemsBatch,
} from '../lib/queries/inventory';
import type { Database } from '../types/database';

type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert'];
type InventoryItemUpdate =
  Database['public']['Tables']['inventory_items']['Update'];

export function useInventoryItems(locationId?: number) {
  return useQuery(inventoryQueryOptions(locationId));
}

export function useInventoryItem(id: number) {
  return useQuery({
    ...inventoryItemQueryOptions(id),
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: InventoryItemInsert & { productName?: string; barcode?: string }
    ) => createInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryItemUpdate }) =>
      updateInventoryItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
  });
}

export function useParseInventoryText() {
  return useMutation({
    mutationFn: (text: string) => parseInventoryText(text),
  });
}

export function useCreateInventoryItemsBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      items: Array<InventoryItemInsert & { productName?: string }>
    ) => createInventoryItemsBatch(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
  });
}

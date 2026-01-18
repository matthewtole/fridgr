import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchInventoryItems,
  fetchInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  type InventoryItemWithRelations,
} from '../lib/queries/inventory'
import type { Database } from '../types/database'

type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert']
type InventoryItemUpdate =
  Database['public']['Tables']['inventory_items']['Update']

export function useInventoryItems(locationId?: number) {
  return useQuery<InventoryItemWithRelations[]>({
    queryKey: ['inventory-items', locationId],
    queryFn: () => fetchInventoryItems(locationId),
  })
}

export function useInventoryItem(id: number) {
  return useQuery<InventoryItemWithRelations | null>({
    queryKey: ['inventory-item', id],
    queryFn: () => fetchInventoryItem(id),
    enabled: !!id,
  })
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InventoryItemInsert) => createInventoryItem(data),
    onSuccess: () => {
      // Invalidate and refetch inventory items
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
    },
  })
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryItemUpdate }) =>
      updateInventoryItem(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both the list and the specific item
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
      queryClient.invalidateQueries({
        queryKey: ['inventory-item', variables.id],
      })
    },
  })
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteInventoryItem(id),
    onSuccess: () => {
      // Invalidate and refetch inventory items
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] })
    },
  })
}

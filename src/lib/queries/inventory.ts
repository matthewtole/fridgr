import { supabase } from '../supabase'
import type { Database } from '../../types/database'

type InventoryItem = Database['public']['Tables']['inventory_items']['Row']
type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert']
type InventoryItemUpdate =
  Database['public']['Tables']['inventory_items']['Update']

export interface InventoryItemWithRelations extends InventoryItem {
  products: {
    name: string | null
    category: string | null
  } | null
  locations: {
    name: string
    display_order: number
  } | null
}

export async function fetchInventoryItems(
  locationId?: number
): Promise<InventoryItemWithRelations[]> {
  let query = supabase
    .from('inventory_items')
    .select(
      `
      *,
      products(name, category),
      locations(name, display_order)
    `
    )
    .order('created_at', { ascending: false })

  if (locationId) {
    query = query.eq('location_id', locationId)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch inventory items: ${error.message}`)
  }

  return (data as InventoryItemWithRelations[]) || []
}

export async function fetchInventoryItem(
  id: number
): Promise<InventoryItemWithRelations | null> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select(
      `
      *,
      products(name, category),
      locations(name, display_order)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    throw new Error(`Failed to fetch inventory item: ${error.message}`)
  }

  return data as InventoryItemWithRelations
}

export async function createInventoryItem(
  data: InventoryItemInsert & { productName?: string }
): Promise<InventoryItem> {
  let productId = data.product_id
  const { productName, ...rest } = data

  // If product name is provided but no product_id, create a product entry
  if (productName && !productId) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: productName,
      })
      .select()
      .single()

    if (productError) {
      throw new Error(`Failed to create product: ${productError.message}`)
    }

    productId = product.id
  }

  // Create final data without productName
  const finalData: InventoryItemInsert = {
    ...rest,
    product_id: productId || null,
  }

  const { data: item, error } = await supabase
    .from('inventory_items')
    .insert(finalData)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create inventory item: ${error.message}`)
  }

  return item
}

export async function updateInventoryItem(
  id: number,
  data: InventoryItemUpdate
): Promise<InventoryItem> {
  const { data: item, error } = await supabase
    .from('inventory_items')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update inventory item: ${error.message}`)
  }

  return item
}

export async function deleteInventoryItem(id: number): Promise<void> {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete inventory item: ${error.message}`)
  }
}

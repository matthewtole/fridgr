import { supabase } from '../supabase';
import type { Database } from '../../types/database';

type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];
type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert'];
type InventoryItemUpdate =
  Database['public']['Tables']['inventory_items']['Update'];

export interface InventoryItemWithRelations extends InventoryItem {
  products: {
    name: string | null;
    category: string | null;
  } | null;
  locations: {
    name: string;
    display_order: number;
  } | null;
}

export interface ParsedInventoryItem {
  productName: string;
  quantity: number;
  quantityType: 'units' | 'volume' | 'percentage' | 'weight';
  locationName: string;
  expirationDate?: string;
  openedStatus: boolean;
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
    .order('created_at', { ascending: false });

  if (locationId) {
    query = query.eq('location_id', locationId);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch inventory items: ${error.message}`);
  }

  return (data as InventoryItemWithRelations[]) || [];
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
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw new Error(`Failed to fetch inventory item: ${error.message}`);
  }

  return data as InventoryItemWithRelations;
}

export async function createInventoryItem(
  data: InventoryItemInsert & { productName?: string; barcode?: string }
): Promise<InventoryItem> {
  let productId = data.product_id;
  const { productName, barcode, ...rest } = data;

  // If product name is provided but no product_id, create a product entry
  if (productName && !productId) {
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: productName,
      })
      .select()
      .single();

    if (productError) {
      throw new Error(`Failed to create product: ${productError.message}`);
    }

    productId = product.id;

    // If barcode was also provided (e.g. from scan-not-found), link it for future lookups
    if (barcode && barcode.trim()) {
      const { error: bcError } = await supabase
        .from('product_barcodes')
        .insert({ barcode: barcode.trim(), product_id: product.id });
      if (bcError) {
        // Best-effort: barcode may already exist; still create the inventory item
        console.warn('Could not link barcode to product:', bcError.message);
      }
    }
  }

  // Create final data without productName or barcode
  const finalData: InventoryItemInsert = {
    ...rest,
    product_id: productId || null,
  };

  const { data: item, error } = await supabase
    .from('inventory_items')
    .insert(finalData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create inventory item: ${error.message}`);
  }

  return item;
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
    .single();

  if (error) {
    throw new Error(`Failed to update inventory item: ${error.message}`);
  }

  return item;
}

export async function deleteInventoryItem(id: number): Promise<void> {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete inventory item: ${error.message}`);
  }
}

export async function parseInventoryText(
  text: string
): Promise<ParsedInventoryItem[]> {
  const { data, error } = await supabase.functions.invoke(
    'parse-inventory-text',
    {
      body: { text },
    }
  );

  if (error) {
    throw new Error(`Failed to parse inventory text: ${error.message}`);
  }

  if (!data || !Array.isArray(data)) {
    throw new Error('Invalid response from parse-inventory-text function');
  }

  return data as ParsedInventoryItem[];
}

export async function createInventoryItemsBatch(
  items: Array<InventoryItemInsert & { productName?: string }>
): Promise<InventoryItem[]> {
  // First, create all products and collect their IDs
  const productMap = new Map<string, number>();
  const itemsWithProductIds: Array<
    InventoryItemInsert & { productName?: string }
  > = [];

  // Process items to create products first
  for (const item of items) {
    const { productName, ...rest } = item;
    let productId = item.product_id;

    // If product name is provided but no product_id, create or reuse product
    if (productName && !productId) {
      // Check if we've already created this product in this batch
      if (productMap.has(productName)) {
        productId = productMap.get(productName)!;
      } else {
        // Check if product already exists in database
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id')
          .eq('name', productName)
          .single();

        if (existingProduct) {
          productId = existingProduct.id;
          productMap.set(productName, productId);
        } else {
          // Create new product
          const { data: newProduct, error: productError } = await supabase
            .from('products')
            .insert({
              name: productName,
            })
            .select()
            .single();

          if (productError) {
            throw new Error(
              `Failed to create product "${productName}": ${productError.message}`
            );
          }

          productId = newProduct.id;
          productMap.set(productName, productId);
        }
      }
    }

    itemsWithProductIds.push({
      ...rest,
      product_id: productId || null,
    });
  }

  // Now create all inventory items
  const { data: createdItems, error } = await supabase
    .from('inventory_items')
    .insert(itemsWithProductIds)
    .select();

  if (error) {
    throw new Error(`Failed to create inventory items: ${error.message}`);
  }

  return createdItems || [];
}

import { supabase } from '../supabase';

export interface ProductLookupResult {
  id: number;
  name: string;
  category: string | null;
  image_url: string | null;
}

/**
 * Look up a product by barcode: first in the local DB (product_barcodes -> products),
 * then via the lookup-product edge function (Open Food Facts). Returns null if not found.
 */
export async function lookupProductByBarcode(
  barcode: string
): Promise<ProductLookupResult | null> {
  const trimmed = barcode.trim();
  if (!trimmed) return null;

  // 1. Check product_barcodes -> products
  const { data: pb, error: pbError } = await supabase
    .from('product_barcodes')
    .select('product_id, products(id, name, category, image_url)')
    .eq('barcode', trimmed)
    .maybeSingle();

  if (pbError) {
    throw new Error(`Failed to lookup barcode in database: ${pbError.message}`);
  }

  if (pb?.products) {
    const p = pb.products as {
      id: number;
      name: string;
      category: string | null;
      image_url: string | null;
    };
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      image_url: p.image_url,
    };
  }

  // 2. Call edge function (Open Food Facts)
  const { data: fnData, error: fnError } = await supabase.functions.invoke(
    'lookup-product',
    { body: { barcode: trimmed } }
  );

  if (fnError) {
    throw new Error(`Failed to lookup product: ${fnError.message}`);
  }

  if (fnData?.product) {
    return fnData.product as ProductLookupResult;
  }

  return null;
}

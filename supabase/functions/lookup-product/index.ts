import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface RequestBody {
  barcode: string
}

interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}

interface ProductResponse {
  product: {
    id: number
    name: string
    category: string | null
    image_url: string | null
  } | null
}

function validateRequestBody(body: unknown): body is RequestBody {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  return typeof b.barcode === 'string' && b.barcode.trim().length > 0
}

// Open Food Facts product type (subset we use)
interface OFFProduct {
  product_name?: string
  product_name_en?: string
  categories?: string
  image_url?: string
  image_front_small_url?: string
  image_front_url?: string
}

async function fetchFromOpenFoodFacts(
  barcode: string
): Promise<OFFProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  if (data.status !== 1 || !data.product) return null
  return data.product as OFFProduct
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== 'POST') {
    const err: ErrorResponse = {
      error: 'Method Not Allowed',
      message: 'Only POST is allowed',
      statusCode: 405,
    }
    return new Response(JSON.stringify(err), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    let body: unknown
    try {
      body = await req.json()
    } catch {
      const err: ErrorResponse = {
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON',
        statusCode: 400,
      }
      return new Response(JSON.stringify(err), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!validateRequestBody(body)) {
      const err: ErrorResponse = {
        error: 'Validation Error',
        message: 'Invalid request body. Required: barcode (non-empty string)',
        statusCode: 400,
      }
      return new Response(JSON.stringify(err), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const off = await fetchFromOpenFoodFacts(body.barcode.trim())
    if (!off) {
      const resp: ProductResponse = { product: null }
      return new Response(JSON.stringify(resp), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const name = off.product_name || off.product_name_en || 'Unknown product'
    const category =
      typeof off.categories === 'string' && off.categories
        ? (off.categories.split(',')[0]?.trim() ?? null)
        : null
    const image_url =
      off.image_url || off.image_front_url || off.image_front_small_url || null

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set')
      const err: ErrorResponse = {
        error: 'Configuration Error',
        message: 'Server is not configured for database writes',
        statusCode: 500,
      }
      return new Response(JSON.stringify(err), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const { data: product, error: insertError } = await supabase
      .from('products')
      .insert({ name, category, image_url })
      .select('id, name, category, image_url')
      .single()

    if (insertError) {
      console.error('Failed to insert product:', insertError)
      const err: ErrorResponse = {
        error: 'Database Error',
        message: insertError.message,
        statusCode: 500,
      }
      return new Response(JSON.stringify(err), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { error: barcodeError } = await supabase
      .from('product_barcodes')
      .insert({ barcode: body.barcode.trim(), product_id: product.id })

    if (barcodeError) {
      console.error('Failed to insert product_barcode:', barcodeError)
      // Product was created; we still return it. The barcode link is best-effort.
    }

    const resp: ProductResponse = {
      product: {
        id: product.id,
        name: product.name,
        category: product.category,
        image_url: product.image_url,
      },
    }
    return new Response(JSON.stringify(resp), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    console.error('lookup-product error:', e)
    const err: ErrorResponse = {
      error: 'Internal Server Error',
      message: e instanceof Error ? e.message : 'Unknown error',
      statusCode: 500,
    }
    return new Response(JSON.stringify(err), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

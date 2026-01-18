// Rate limiting state (in-memory, resets on deployment)
// In production, consider using Supabase KV or Redis
interface RateLimitState {
  requests: number[]
  windowStart: number
}

let rateLimitState: RateLimitState = {
  requests: [],
  windowStart: Date.now(),
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = parseInt(
  Deno.env.get('RATE_LIMIT_MAX_REQUESTS') || '10',
  10
)

function checkRateLimit(): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()

  // Reset window if expired
  if (now - rateLimitState.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitState = {
      requests: [],
      windowStart: now,
    }
  }

  // Remove requests outside the current window
  rateLimitState.requests = rateLimitState.requests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS
  )

  // Check if limit exceeded
  if (rateLimitState.requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldestRequest = Math.min(...rateLimitState.requests)
    const retryAfter = Math.ceil(
      (RATE_LIMIT_WINDOW_MS - (now - oldestRequest)) / 1000
    )
    return { allowed: false, retryAfter }
  }

  // Add current request
  rateLimitState.requests.push(now)
  return { allowed: true }
}

interface RequestBody {
  text: string
}

interface ParsedInventoryItem {
  productName: string
  quantity: number
  quantityType: 'units' | 'volume' | 'percentage' | 'weight'
  locationName: string
  expirationDate?: string
  openedStatus: boolean
}

interface ErrorResponse {
  error: string
  message: string
  statusCode: number
}

function validateRequestBody(body: unknown): body is RequestBody {
  if (typeof body !== 'object' || body === null) {
    return false
  }

  const b = body as Record<string, unknown>

  return typeof b.text === 'string' && b.text.trim().length > 0
}

function createPrompt(text: string): string {
  return `You are a kitchen inventory assistant. Parse the following text input and extract all inventory items mentioned. For each item, extract as much information as possible.

Input text: "${text}"

For each item you identify, extract:
1. productName (required) - The name of the product/item
2. quantity (number, default: 1) - The quantity mentioned
3. quantityType (one of: "units", "volume", "weight", "percentage") - Infer from context:
   - "units" for discrete items (apples, cans, boxes)
   - "volume" for liquids (gallons, liters, cups, ml)
   - "weight" for items by mass (pounds, grams, kg)
   - "percentage" for partial containers
4. locationName (string) - Infer from context or use "pantry" as default:
   - Look for keywords: "frozen", "freezer" → "freezer"
   - "fridge", "refrigerator" → "fridge"
   - "pantry", "cabinet", "shelf" → "pantry"
   - Default to "pantry" if unclear
5. expirationDate (optional, YYYY-MM-DD format) - Only include if explicitly mentioned
6. openedStatus (boolean, default: false) - Set to true if item is mentioned as "opened", "open", or similar

Use context clues:
- "2 apples" → quantity: 2, quantityType: "units", productName: "apple"
- "1 gallon of milk" → quantity: 1, quantityType: "volume", productName: "milk"
- "frozen peas" → locationName: "freezer", productName: "peas"
- "opened jar of pickles" → openedStatus: true, productName: "pickles"

Return ONLY a valid JSON array of items in this exact format:
[
  {
    "productName": "string",
    "quantity": number,
    "quantityType": "units" | "volume" | "weight" | "percentage",
    "locationName": "string",
    "expirationDate": "YYYY-MM-DD" (optional),
    "openedStatus": boolean
  }
]

If no items can be identified, return an empty array: []

Respond ONLY with valid JSON, no additional text or explanation.`
}

async function callAnthropicAPI(
  prompt: string
): Promise<ParsedInventoryItem[]> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `Anthropic API error: ${response.status} ${response.statusText}`

    try {
      const errorData = JSON.parse(errorText)
      if (errorData.error?.message) {
        errorMessage = errorData.error.message
      }
    } catch {
      // Use default error message if parsing fails
    }

    throw new Error(errorMessage)
  }

  const data = await response.json()

  if (
    !data.content ||
    !Array.isArray(data.content) ||
    data.content.length === 0
  ) {
    throw new Error('Invalid response format from Anthropic API')
  }

  // Extract text content from the response
  const textContent = data.content
    .map((block: { type: string; text?: string }) => {
      if (block.type === 'text') {
        return block.text
      }
      return ''
    })
    .join('')
    .trim()

  // Try to extract JSON array from the response
  const jsonMatch = textContent.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    // Try to find any JSON object/array
    const fallbackMatch = textContent.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
    if (!fallbackMatch) {
      throw new Error('No JSON found in Anthropic API response')
    }
    // If it's a single object, wrap it in an array
    if (fallbackMatch[0].startsWith('{')) {
      try {
        const singleItem = JSON.parse(fallbackMatch[0])
        return [singleItem]
      } catch {
        throw new Error('Failed to parse single item from response')
      }
    }
  }

  let result: ParsedInventoryItem[]
  try {
    result = JSON.parse(jsonMatch ? jsonMatch[0] : '[]')
  } catch (error) {
    throw new Error(`Failed to parse JSON from Anthropic response: ${error}`)
  }

  // Validate and normalize the response
  if (!Array.isArray(result)) {
    throw new Error('Response is not an array')
  }

  // Validate each item
  const validatedItems: ParsedInventoryItem[] = []
  for (const item of result) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof item.productName !== 'string' ||
      item.productName.trim().length === 0
    ) {
      // Skip invalid items
      continue
    }

    const validatedItem: ParsedInventoryItem = {
      productName: item.productName.trim(),
      quantity:
        typeof item.quantity === 'number' && item.quantity > 0
          ? item.quantity
          : 1,
      quantityType: ['units', 'volume', 'weight', 'percentage'].includes(
        item.quantityType
      )
        ? item.quantityType
        : 'units',
      locationName:
        typeof item.locationName === 'string' &&
        item.locationName.trim().length > 0
          ? item.locationName.trim().toLowerCase()
          : 'pantry',
      openedStatus:
        typeof item.openedStatus === 'boolean' ? item.openedStatus : false,
    }

    // Validate expiration date format if provided
    if (item.expirationDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (
        typeof item.expirationDate === 'string' &&
        dateRegex.test(item.expirationDate)
      ) {
        validatedItem.expirationDate = item.expirationDate
      }
    }

    validatedItems.push(validatedItem)
  }

  return validatedItems
}

Deno.serve(async (req: Request): Promise<Response> => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    const errorResponse: ErrorResponse = {
      error: 'Method Not Allowed',
      message: 'Only POST requests are allowed',
      statusCode: 405,
    }
    return new Response(JSON.stringify(errorResponse), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Check rate limit
  const rateLimitCheck = checkRateLimit()
  if (!rateLimitCheck.allowed) {
    const errorResponse: ErrorResponse = {
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      statusCode: 429,
    }
    return new Response(JSON.stringify(errorResponse), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(rateLimitCheck.retryAfter || 60),
      },
    })
  }

  try {
    // Parse and validate request body
    let body: unknown
    try {
      body = await req.json()
    } catch {
      const errorResponse: ErrorResponse = {
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON',
        statusCode: 400,
      }
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (!validateRequestBody(body)) {
      const errorResponse: ErrorResponse = {
        error: 'Validation Error',
        message: 'Invalid request body. Required: text (string, non-empty)',
        statusCode: 400,
      }
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create prompt and call Anthropic API
    const prompt = createPrompt(body.text)
    const result = await callAnthropicAPI(prompt)

    // Return success response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // Log error for debugging
    console.error('Error in parse-inventory-text endpoint:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    // Determine status code based on error type
    let statusCode = 500
    if (errorMessage.includes('ANTHROPIC_API_KEY')) {
      statusCode = 500
    } else if (errorMessage.includes('API error')) {
      statusCode = 502 // Bad Gateway
    } else if (
      errorMessage.includes('Invalid') ||
      errorMessage.includes('Failed')
    ) {
      statusCode = 502 // Bad Gateway (API returned invalid data)
    }

    const errorResponse: ErrorResponse = {
      error: 'Internal Server Error',
      message: errorMessage,
      statusCode,
    }

    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

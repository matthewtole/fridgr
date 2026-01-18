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
  productName: string
  category?: string
  locationName: string
  openedStatus: boolean
}

interface ExpirationResponse {
  expirationDate: string // YYYY-MM-DD format
  daysUntilExpiration: number
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW'
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

  return (
    typeof b.productName === 'string' &&
    b.productName.trim().length > 0 &&
    typeof b.locationName === 'string' &&
    b.locationName.trim().length > 0 &&
    typeof b.openedStatus === 'boolean' &&
    (b.category === undefined || typeof b.category === 'string')
  )
}

function createPrompt(body: RequestBody): string {
  const { productName, category, locationName, openedStatus } = body

  return `You are a food safety expert. Estimate the expiration date for a food item based on the following information:

Product Name: ${productName}
${category ? `Category: ${category}` : ''}
Storage Location: ${locationName}
Opened Status: ${openedStatus ? 'Opened' : 'Unopened'}

Please provide your estimate in the following JSON format:
{
  "daysUntilExpiration": <number of days>,
  "confidenceLevel": "HIGH" | "MEDIUM" | "LOW"
}

Consider:
- Product type and typical shelf life
- Storage location (pantry items last longer than fridge items, freezer items last longest)
- Opened items generally expire faster than unopened items
- Be conservative with estimates for safety

Respond ONLY with valid JSON, no additional text.`
}

async function callAnthropicAPI(prompt: string): Promise<ExpirationResponse> {
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
      max_tokens: 1024,
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

  // Try to extract JSON from the response
  const jsonMatch = textContent.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in Anthropic API response')
  }

  let result: { daysUntilExpiration: number; confidenceLevel: string }
  try {
    result = JSON.parse(jsonMatch[0])
  } catch (error) {
    throw new Error(`Failed to parse JSON from Anthropic response: ${error}`)
  }

  // Validate and normalize the response
  if (
    typeof result.daysUntilExpiration !== 'number' ||
    result.daysUntilExpiration < 0
  ) {
    throw new Error('Invalid daysUntilExpiration in response')
  }

  const confidenceLevel = result.confidenceLevel?.toUpperCase()
  if (
    confidenceLevel !== 'HIGH' &&
    confidenceLevel !== 'MEDIUM' &&
    confidenceLevel !== 'LOW'
  ) {
    throw new Error('Invalid confidenceLevel in response')
  }

  // Calculate expiration date (days from now)
  const expirationDate = new Date()
  expirationDate.setDate(expirationDate.getDate() + result.daysUntilExpiration)

  return {
    expirationDate: expirationDate.toISOString().split('T')[0],
    daysUntilExpiration: result.daysUntilExpiration,
    confidenceLevel: confidenceLevel as 'HIGH' | 'MEDIUM' | 'LOW',
  }
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
        message:
          'Invalid request body. Required: productName (string), locationName (string), openedStatus (boolean). Optional: category (string)',
        statusCode: 400,
      }
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Create prompt and call Anthropic API
    const prompt = createPrompt(body)
    const result = await callAnthropicAPI(prompt)

    // Return success response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    // Log error for debugging
    console.error('Error in estimate-expiration endpoint:', error)

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

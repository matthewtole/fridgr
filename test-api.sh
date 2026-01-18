#!/bin/bash

# Simple test script for the expiration estimation API endpoint
# Make sure to set ANTHROPIC_API_KEY in .env and run `npm run supabase:start` first

BASE_URL="${1:-http://localhost:54321}"
ENDPOINT="$BASE_URL/functions/v1/estimate-expiration"

# Get Supabase anon key from environment or .env
if [ -z "$SUPABASE_ANON_KEY" ]; then
  if [ -f .env ]; then
    # Extract the value, handling quotes and whitespace
    SUPABASE_ANON_KEY=$(grep "^VITE_SUPABASE_ANON_KEY=" .env | cut -d= -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '"' | tr -d "'")
  fi
fi

# Trim any remaining whitespace
SUPABASE_ANON_KEY=$(echo "$SUPABASE_ANON_KEY" | xargs)

if [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ ERROR: SUPABASE_ANON_KEY not found"
  echo ""
  echo "Please set it in one of these ways:"
  echo "  1. Set environment variable: export SUPABASE_ANON_KEY=your-key"
  echo "  2. Add to .env: VITE_SUPABASE_ANON_KEY=your-key"
  echo ""
  echo "Get your anon key by running: npm run supabase:start"
  echo "Then copy the 'anon key' from the output."
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Testing API: $ENDPOINT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Using anon key: ${SUPABASE_ANON_KEY:0:20}..."
echo ""

# # Check if server is reachable (simple GET to base URL)
# echo "Step 1: Checking if server is reachable..."
# if ! curl -s -f -o /dev/null "$BASE_URL" 2>/dev/null; then
#   echo "❌ ERROR: Cannot reach server at $BASE_URL"
#   echo ""
#   echo "Possible issues:"
#   echo "  - Supabase is not running. Start it with: npm run supabase:start"
#   echo "  - Wrong port? Expected: 54321 (Supabase API port)"
#   echo "  - Server is running but not responding"
#   exit 1
# fi
# echo "✓ Server is reachable"
# echo ""

# Check if function file exists
echo "Step 2: Verifying function exists..."
FUNCTION_FILE="supabase/functions/estimate-expiration/index.ts"
if [ ! -f "$FUNCTION_FILE" ]; then
  echo "❌ ERROR: Function file not found at $FUNCTION_FILE"
  echo ""
  echo "The function file should exist at: $FUNCTION_FILE"
  exit 1
fi
echo "✓ Function file exists: $FUNCTION_FILE"
echo ""

# Test the API endpoint
echo "Step 3: Testing API endpoint..."
echo "Making POST request to: $ENDPOINT"
echo ""

# Make request and capture response
echo "Request details:"
echo "  URL: $ENDPOINT"
echo "  Method: POST"
echo "  Headers: Authorization: Bearer ${SUPABASE_ANON_KEY:0:20}..."
echo ""

# Make the request and capture both stderr (for connection info) and stdout (for response)
response=$(curl -s -w "\nHTTP_CODE:%{http_code}\nTIME:%{time_total}" \
  -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -d '{"productName": "Milk", "category": "dairy", "locationName": "fridge", "openedStatus": false}' \
  2>&1)

# Extract HTTP code and body
http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2 | tr -d ' ')
time_total=$(echo "$response" | grep "TIME:" | cut -d: -f2 | tr -d ' ')
body=$(echo "$response" | sed '/HTTP_CODE:/d' | sed '/TIME:/d')

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "RESPONSE DETAILS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "HTTP Status Code: $http_code"
echo "Response Time: ${time_total}s"
echo ""
echo "Response Body:"
echo "$body"
echo ""

# Check result
if [ -z "$http_code" ]; then
  echo "❌ FAILED: Could not determine HTTP status code"
  echo "This usually means the request failed completely."
  echo ""
  echo "Full response output:"
  echo "----------------------------------------"
  echo "$response"
  echo "----------------------------------------"
  echo ""
  echo "Possible issues:"
  echo "  - API endpoint not found (404) - Supabase Functions may not be running"
  echo "  - Connection refused - Server not running on this port"
  echo "  - Network error"
  echo "  - Missing or invalid Authorization header"
  echo ""
  echo "To debug, try running curl manually:"
  echo "  curl -v -X POST '$ENDPOINT' \\"
  echo "    -H 'Content-Type: application/json' \\"
  echo "    -H 'Authorization: Bearer $SUPABASE_ANON_KEY' \\"
  echo "    -d '{\"productName\": \"Milk\", \"category\": \"dairy\", \"locationName\": \"fridge\", \"openedStatus\": false}'"
  echo ""
  echo "Or check if the function exists:"
  echo "  supabase functions list"
  exit 1
elif [ "$http_code" = "200" ]; then
  echo "✓ SUCCESS: API returned 200 OK"
  echo ""
  # Try to validate JSON response
  if echo "$body" | grep -q "expirationDate\|daysUntilExpiration"; then
    echo "✓ Response appears to contain expected fields"
  else
    echo "⚠ WARNING: Response doesn't contain expected fields"
  fi
  exit 0
elif [ "$http_code" = "404" ]; then
  echo "❌ FAILED: API endpoint returned 404 Not Found"
  echo ""
  echo "This means the endpoint doesn't exist or isn't being served. Possible issues:"
  echo "  - Supabase Functions runtime not started"
  echo "  - Function needs to be deployed/served locally"
  echo "  - Wrong endpoint URL"
  echo ""
  echo "Troubleshooting steps:"
  echo "  1. Verify Supabase is running: npm run supabase:start"
  echo "  2. Check Supabase status: supabase status"
  echo "  3. Verify function file exists: ls -la supabase/functions/estimate-expiration/"
  echo "  4. Check Supabase logs for errors"
  echo "  5. Try accessing the base API: curl $BASE_URL"
  echo ""
  echo "Note: Supabase Functions should auto-serve when Supabase is running locally."
  echo "If the function still isn't found, you may need to restart Supabase."
  exit 1
elif [ "$http_code" = "401" ] || [ "$http_code" = "403" ]; then
  echo "❌ FAILED: API returned $http_code (Authentication Error)"
  echo ""
  echo "The endpoint exists but authentication failed. Check:"
  echo "  - Is the SUPABASE_ANON_KEY correct? (Currently using: ${SUPABASE_ANON_KEY:0:20}...)"
  echo "  - Is the Authorization header being sent correctly?"
  echo "  - Get your anon key by running: npm run supabase:start"
  exit 1
elif [ "$http_code" = "500" ] || [ "$http_code" = "502" ]; then
  echo "❌ FAILED: API returned $http_code (Server Error)"
  echo ""
  echo "The endpoint exists but there's a server error. Check:"
  echo "  - Is ANTHROPIC_API_KEY set? (Supabase functions read from .env or secrets)"
  echo "  - Is the API key valid?"
  echo "  - Check Supabase function logs: supabase functions logs estimate-expiration"
  exit 1
else
  echo "❌ FAILED: API returned unexpected status code: $http_code"
  echo ""
  echo "Response body may contain error details (see above)"
  exit 1
fi

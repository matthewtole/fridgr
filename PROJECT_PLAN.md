# Kitchen Inventory App - Project Brief

## Overview

A web-based kitchen inventory management system that uses barcode scanning,
image recognition, and AI to help users track pantry items, reduce food waste,
and plan meals based on available ingredients.

## Tech Stack

### Frontend

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Panda CSS (type-safe CSS-in-JS)
- **State Management:** TanStack Query (for server state/caching)
- **Component Development:** Storybook
- **Testing:** Playwright (E2E tests)

### Backend & Infrastructure

- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, built-in auth)
- **Hosting:** Vercel (chosen over Netlify to try something new, better edge
  function support)
- **Serverless Functions:** Vercel Edge Functions (for AI processing and API
  calls)
- **Image Storage:** Supabase Storage
- **LLM Processing:** Server-side via edge functions (for security, cost
  control, and orchestration)

### External APIs

- **Product Lookup:** Open Food Facts API (primary, free) with UPCitemdb.com
  fallback
- **AI/LLM:** OpenAI GPT-4 Vision or Anthropic Claude (for produce
  identification, recipe parsing, expiration estimation)
- **Barcode Scanning:** html5-qrcode or quagga.js (client-side camera access)

## Core Features

### 1. Inventory Management

- Track items across multiple locations (pantry, fridge, freezer)
- Flexible quantity tracking with multiple modes:
  - **Units:** Discrete items (3 cans, 2 boxes)
  - **Volume:** Measured ingredients (2.5 cups, 500ml)
  - **Percentage:** Partial containers (~40% remaining)
  - **Weight:** By mass (500g, 1lb)
- Smart mode suggestions based on product type
- Manual CRUD operations for inventory items

### 2. Barcode Scanning

- Camera-based barcode scanner for quick product entry
- Automatic product lookup via UPC APIs
- Cache successful lookups in local database
- Manual entry fallback when product not found
- Optimized for touch input (primary interface)

### 3. AI-Powered Features

**Expiration Date Estimation:**

- LLM generates best-guess expiration dates based on:
  - Product type and category
  - Storage location (affects shelf life)
  - Opened vs unopened status
- Returns confidence levels (HIGH/MEDIUM/LOW)
- User can override estimates
- Learning system tracks corrections to improve future estimates

**Produce Image Recognition:**

- Upload photos of produce items
- AI identifies the item (apple, lettuce, etc.)
- Auto-populates inventory with identified produce

**Recipe Parsing:**

- User pastes recipe text or URL
- AI extracts structured ingredient list (item, quantity, unit)
- Stores parsed recipe for future use

### 4. Recipe Integration

- "What can I make?" - Match recipes against current inventory
- Show partial matches ("you have 8 of 10 ingredients")
- **Auto-deduction:** When recipe is marked as "cooked":
  - Reduces inventory quantities automatically
  - Handles different quantity types intelligently
  - Prompts user if insufficient inventory

### 5. Smart Notifications & Shopping

- Expiration warnings (3 days out, today, expired)
- Low stock alerts (configurable thresholds)
- Auto-generated shopping list based on low inventory and recipe needs

### 6. Learning System

- Tracks user corrections to AI estimates
- Stores patterns in database
- Improves expiration rules over time
- Household-specific learning (your bread lasts longer than typical)

## AI Architecture

### agents.md Rules System

- Centralized markdown file defining AI behavior rules
- Separate rule sets for:
  - Expiration date estimation (by product category, storage type)
  - Recipe ingredient extraction
  - Quantity deduction logic
  - Confidence level assignment
- Stored server-side, updatable without frontend redeployment

### Server-Side LLM Processing (Why)

1. **Security:** API keys never exposed to client
2. **Cost Control:** Rate limiting, caching, abuse prevention
3. **Image Processing:** Handle produce photos and barcode images efficiently
4. **Orchestration:** Combine multiple AI calls, apply agents.md rules
5. **Flexibility:** Can switch LLM providers without frontend changes

## Database Schema (Supabase)

**Core Tables:**

- `users` - Handled by Supabase Auth
- `products` - Cached product info (barcode, name, category, default_shelf_life,
  image_url)
- `inventory_items` - User's current inventory (user_id, product_id, quantity,
  quantity_type, location, added_date, expiration_date, opened_status)
- `recipes` - User's recipe collection (user_id, name, ingredients_json,
  instructions)
- `expiration_rules` - AI rules by category (category, storage_type, days,
  confidence_level)
- `user_corrections` - Learning data (user_id, original_estimate, user_override,
  product_type)

**Security:** Row Level Security (RLS) policies ensure users only access their
own data

## Key Design Decisions

1. **Web-first, PWA later:** Start as web app, add PWA features (offline,
   install prompt) for better mobile experience without going full native
2. **Server-side AI:** All LLM calls go through edge functions for security and
   control
3. **Flexible quantity tracking:** Support multiple tracking modes rather than
   forcing one standard
4. **Touch-optimized:** Voice commands deprioritized in favor of fast touch
   interactions
5. **Learning system:** AI improves over time based on user corrections
6. **Cache-first product lookups:** Store successful UPC lookups to reduce API
   calls
7. **Progressive enhancement:** Core inventory management works without AI, AI
   features enhance the experience

## Success Metrics

- Time from barcode scan to inventory addition < 5 seconds
- Expiration estimate accuracy improves over time (track correction rate)
- Reduce user food waste (track items that expire unused)
- Recipe matching reduces shopping trips (users find meals with existing
  ingredients)

## Development Approach

- Build in 2-week phases following the implementation plan
- Use Storybook for component development in isolation
- Test barcode scanning on real devices early (camera APIs vary)
- Monitor Vercel edge function costs from day 1
- Deploy preview branches for every feature

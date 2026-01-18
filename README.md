# Fridgr - Kitchen Inventory App

A web-based kitchen inventory management system that uses barcode scanning,
image recognition, and AI to help users track pantry items, reduce food waste,
and plan meals based on available ingredients.

## Tech Stack

### Frontend

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Panda CSS (type-safe CSS-in-JS)
- **Component Development:** Storybook
- **Testing:** Playwright (E2E tests)

### Backend & Infrastructure

- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, built-in auth)
- **Hosting:** Vercel (frontend)
- **Serverless Functions:** Supabase Edge Functions

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x (LTS)
- npm (comes with Node.js)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fridgr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Panda CSS styles:
   ```bash
   npm run prepare
   ```

4. Set up environment variables:
   - Create `.env` with your credentials:
     ```env
     # Supabase Configuration
     VITE_SUPABASE_URL=http://127.0.0.1:54321
     VITE_SUPABASE_ANON_KEY=your-anon-key-here

     # Anthropic API Configuration (for Supabase Functions)
     ANTHROPIC_API_KEY=your-anthropic-api-key-here

     # Rate Limiting (optional, defaults to 10 requests per minute)
     RATE_LIMIT_MAX_REQUESTS=10
     ```
   - **Important:** For Supabase Functions to access environment variables in
     **local development**, create a `.env` file in `supabase/functions/`:
     ```bash
     # Use the helper script to automatically create it from your root .env
     ./scripts/setup-secrets.sh
     ```
     Or manually create `supabase/functions/.env`:
     ```env
     ANTHROPIC_API_KEY=your-key-here
     RATE_LIMIT_MAX_REQUESTS=10
     ```
     Supabase will automatically load these when running functions locally.
     **Note:** For production, set secrets via Supabase Dashboard (Project Settings > Edge Functions).
   - Get your Supabase anon key by running `supabase status` after starting
     Supabase
   - Get your Anthropic API key from
     [Anthropic Console](https://console.anthropic.com/)

5. Start local Supabase (requires Docker):
   ```bash
   npm run supabase:start
   ```

   This starts a local PostgreSQL database and Supabase services. Access
   Supabase Studio at http://localhost:54323

   **Note:** After starting Supabase:
   - Copy the `anon key` from the output and add it to your `.env` file
   - Set up function environment variables for **local development** (required
     for Edge Functions to access environment variables):
     ```bash
     ./scripts/setup-secrets.sh
     ```
     This creates `supabase/functions/.env` from your root `.env` file.
     **Note:** This file is gitignored and only used locally. Production secrets are set separately via Supabase Dashboard.

### Development

#### Frontend Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

#### API Development (Supabase Functions)

Supabase Functions run automatically when you start Supabase locally:

```bash
npm run supabase:start
```

**Setting up Function Environment Variables (Local Development Only):**

For local development, create `supabase/functions/.env` with your secrets:

```bash
# Use the helper script (recommended)
./scripts/setup-secrets.sh
```

Or manually create `supabase/functions/.env`:
```env
ANTHROPIC_API_KEY=your-anthropic-api-key-here
RATE_LIMIT_MAX_REQUESTS=10
```

**Note:** 
- These environment variables are **LOCAL ONLY** and don't affect production
- The `.env` file persists until you delete it
- Supabase automatically loads this file when running functions locally
- To view function logs: `supabase functions logs estimate-expiration`
- **For production:** Set secrets via Supabase Dashboard (Project Settings > Edge Functions)

Functions are available at `http://localhost:54321/functions/v1/<function-name>`

For example, the expiration estimation function:

- `http://localhost:54321/functions/v1/estimate-expiration`

**Note:** You can run both the frontend and Supabase simultaneously:

- Terminal 1: `npm run dev` (frontend on :5173)
- Terminal 2: `npm run supabase:start` (Supabase with functions on :54321)

**Setting up local environment variables from .env:**

You can use the helper script to automatically create `supabase/functions/.env` from your root `.env` file:

```bash
./scripts/setup-secrets.sh
```

Or manually create `supabase/functions/.env` with the same variables from your root `.env`.

**Note:** The `supabase/functions/.env` file is gitignored and only used for local development. For production secrets, use the Supabase Dashboard.

To test functions locally, you can use the test script:

```bash
./test-api.sh
```

### Building for Production

Build the project:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run compile` - Type check TypeScript

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Storybook

- `npm run storybook` - Start Storybook
- `npm run build-storybook` - Build Storybook for static hosting

### Supabase

- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:reset` - Reset database and apply all migrations
- `npm run supabase:types` - Generate TypeScript types from database schema
- `npm run supabase:migration <name>` - Create new database migration

### API (Supabase Functions)

- Supabase Functions run automatically when Supabase is started
- Functions are available at
  `http://localhost:54321/functions/v1/<function-name>`
- To deploy functions: `supabase functions deploy <function-name>`

### Utilities

- `npm run prepare` - Generate Panda CSS styles (runs automatically on install)

## Supabase Local Development

This project uses Supabase CLI for local database development. See
[docs/supabase-cli-workflow.md](docs/supabase-cli-workflow.md) for detailed
instructions.

### Quick Start

1. Ensure Docker Desktop is running
2. Start Supabase: `npm run supabase:start`
3. Access Studio: http://localhost:54323
4. Database URL: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

### Database Schema

See [docs/database-schema.md](docs/database-schema.md) for complete schema
documentation.

## Project Structure

```
fridgr/
├── .storybook/          # Storybook configuration
├── supabase/            # Supabase configuration
│   ├── functions/       # Supabase Edge Functions
│   │   └── estimate-expiration/  # Expiration date estimation function
│   ├── migrations/      # Database migrations
│   └── seed.sql        # Seed data
├── docs/                # Documentation
│   ├── database-schema.md
│   └── supabase-cli-workflow.md
├── src/
│   ├── components/      # React components
│   ├── styles/          # Global styles
│   └── types/           # TypeScript types
│       └── database.ts  # Generated Supabase types
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── styled-system/       # Generated by Panda CSS (gitignored)
├── public/              # Static assets
├── panda.config.ts      # Panda CSS configuration
├── postcss.config.cjs   # PostCSS configuration
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── eslint.config.js     # ESLint configuration
```

## Code Quality

This project uses ESLint and Prettier for code quality and formatting:

- **ESLint:** Linting with TypeScript and React rules
- **Prettier:** Code formatting
- Both are configured to work together without conflicts

Run linting and formatting before committing:

```bash
npm run lint:fix
npm run format
```

## Storybook

Storybook is set up for component development and documentation. Start it with:

```bash
npm run storybook
```

Storybook will be available at `http://localhost:6006`

## Deployment

### Vercel

This project is configured for deployment on Vercel:

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Vercel
3. Configure project settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   - **Node Version:** 18.x or 20.x (LTS)

Vercel will automatically:

- Deploy previews for pull requests
- Deploy to production on pushes to the main branch

## Development Workflow

1. Create a feature branch
2. Make your changes
3. Run linting and formatting: `npm run lint:fix && npm run format`
4. Run type checking: `npm run compile`
5. Test your changes locally: `npm run dev`
6. Create a pull request
7. Vercel will automatically create a preview deployment

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Panda CSS Documentation](https://panda-css.com/)
- [Storybook Documentation](https://storybook.js.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## License

MIT

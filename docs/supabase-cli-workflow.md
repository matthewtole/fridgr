# Supabase CLI Workflow

This document describes how to use the Supabase CLI for local development.

## Prerequisites

- Docker Desktop installed and running
- Supabase CLI installed (via npm: `npm install -D supabase`)

## Starting and Stopping Supabase

### Start Local Supabase

```bash
npm run supabase:start
# or
supabase start
```

This starts all local Supabase services:
- PostgreSQL database on port 54322
- Supabase Studio on port 54323
- API server on port 54321
- Auth, Storage, Realtime, and other services

**Note:** The first time you run this, it will download Docker images (takes a few minutes).

### Stop Local Supabase

```bash
npm run supabase:stop
# or
supabase stop
```

This stops all containers but preserves data in Docker volumes.

## Database Migrations

### Create a New Migration

```bash
npm run supabase:migration <migration_name>
# or
supabase migration new <migration_name>
```

This creates a timestamped file in `supabase/migrations/` with the format:
`YYYYMMDDHHMMSS_<migration_name>.sql`

### Apply Migrations

```bash
npm run supabase:reset
# or
supabase db reset
```

This:
1. Resets the database (drops all tables)
2. Applies all migrations in order
3. Runs seed data from `supabase/seed.sql`

**Note:** This will delete all data! Use for development only.

### Apply Pending Migrations (Incremental)

```bash
supabase migration up
```

Applies only migrations that haven't been applied yet, without resetting the database.

## TypeScript Type Generation

Generate TypeScript types from your database schema:

```bash
npm run supabase:types
# or
supabase gen types typescript --local > src/types/database.ts
```

**When to run:**
- After creating or modifying tables
- After applying migrations
- Before committing schema changes

The generated types are used for type-safe database queries in your application.

## Accessing Supabase Studio

Supabase Studio provides a web interface for managing your database:

1. Start Supabase: `npm run supabase:start`
2. Open Studio: http://localhost:54323
3. Use Studio to:
   - View and edit tables
   - Run SQL queries
   - View table data
   - Manage database settings

## Common Workflows

### Initial Setup

```bash
# 1. Install Supabase CLI (already done via npm)
npm install -D supabase

# 2. Initialize Supabase in project
supabase init

# 3. Start local services
supabase start

# 4. Create initial migration
supabase migration new initial_schema

# 5. Edit migration file in supabase/migrations/

# 6. Apply migration
supabase db reset

# 7. Generate TypeScript types
supabase gen types typescript --local > src/types/database.ts
```

### Making Schema Changes

```bash
# 1. Create new migration
supabase migration new add_new_table

# 2. Edit the migration file with your changes

# 3. Apply migration
supabase db reset

# 4. Regenerate types
supabase gen types typescript --local > src/types/database.ts
```

### Adding Seed Data

1. Edit `supabase/seed.sql`
2. Run `supabase db reset` to apply migrations and seed data

### Viewing Database

1. Start Supabase: `supabase start`
2. Open Studio: http://localhost:54323
3. Navigate to Table Editor or SQL Editor

## Environment Variables

Local Supabase credentials are displayed when you run `supabase start`:

- **API URL**: `http://127.0.0.1:54321`
- **Database URL**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
- **Studio URL**: `http://127.0.0.1:54323`
- **Anon Key**: Displayed in output
- **Service Role Key**: Displayed in output

You can optionally save these to `.env.local` for use in your application.

## Troubleshooting

### Port Already in Use

If you get a port conflict error:

```bash
# Stop other Supabase projects
supabase stop --project-id <other-project-id>

# Or configure different ports in supabase/config.toml
```

### Database Reset Issues

If migrations fail:

1. Check migration files for syntax errors
2. Ensure migrations are idempotent (use `IF NOT EXISTS` where appropriate)
3. Check Supabase logs: `supabase logs`

### Docker Issues

If Docker containers fail to start:

1. Ensure Docker Desktop is running
2. Check Docker has enough resources allocated
3. Try: `docker system prune` to free up space
4. Restart Docker Desktop

## Best Practices

1. **Always use migrations** - Never modify schema directly in Studio for production
2. **Version control migrations** - Commit all migration files to git
3. **Test migrations** - Run `supabase db reset` after creating migrations
4. **Regenerate types** - Always regenerate TypeScript types after schema changes
5. **Use seed data** - Keep seed.sql minimal, use it for test data only
6. **Document changes** - Update `docs/database-schema.md` when adding tables

## NPM Scripts Reference

All Supabase operations are available as npm scripts:

- `npm run supabase:start` - Start local Supabase
- `npm run supabase:stop` - Stop local Supabase
- `npm run supabase:reset` - Reset database and apply all migrations
- `npm run supabase:types` - Generate TypeScript types
- `npm run supabase:migration <name>` - Create new migration

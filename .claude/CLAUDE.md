# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack Overview

This is a Next.js 16 application built with the T3 Stack architecture:

- **Framework**: Next.js 16 with App Router, React 19, TypeScript 5.8
- **Styling**: TailwindCSS with Radix UI components
- **State Management**: Zustand with Immer for client state
- **API Layer**: tRPC 11 for end-to-end type-safe APIs
- **Database**: PostgreSQL with Prisma 6.18 (using @prisma/adapter-pg for connection pooling)
- **Authentication**: NextAuth.js 4.24 with Google OAuth
- **Caching**: Upstash Redis for rate limiting and caching
- **Validation**: Zod 4 for runtime type validation
- **AI SDK**: Vercel AI SDK 5 (available but optional)

## Development Commands

### Core Development

```bash
npm run dev              # Start dev server on port 4242 with Prisma Studio
npm run build            # Production build with Prisma generation
npm run lint             # Run ESLint
npm run format           # Auto-fix with ESLint and Prettier
npm run format:check     # Check formatting without fixing
npm run analyze          # Analyze bundle size
```

### Database Operations

**Client Generation** (always run after schema changes):

```bash
npm run db:generate      # Generate Prisma client
```

**Development Migrations**:

```bash
npm run db:migrate:dev   # Create and apply new migration
npm run db:push          # Push schema changes without migration (dev only)
npm run db:studio        # Open Prisma Studio on port 5555
```

**Production Deployment**:

```bash
npm run db:migrate:deploy  # Apply migrations in production
```

**Migration Management**:

```bash
npm run db:status        # Check migration status
npm run db:reset         # Reset database (dev only - destroys data)
npm run db:pull          # Pull schema from database
```

**Migration Debugging**:

```bash
npm run db:site:diff                # Show diff between schema and datasource
npm run db:site:diff-from-prod      # Compare local schema to production DB
npm run db:site:resolve-applied -- MIGRATION_NAME     # Mark migration as applied
npm run db:site:resolve-rollback -- MIGRATION_NAME    # Mark migration as rolled back
```

## Feature Scaffolding

The repository includes a powerful CLI tool for creating new features with proper structure and automatic registry integration.

### Creating Features

```bash
npm run create                              # Interactive mode (recommended)
npm run create -- my-feature                # Quick create with positional argument
npm run create -- --name=my-feature         # Using --name flag
npm run create -- -n my-feature             # Using -n short flag
```

### Interactive Module Selection

When you run `npm run create`, you'll be prompted to select which modules to generate:

- **API** (tRPC routes and services) - Creates:
  - `api/index.ts` - Feature router that exports to root
  - `api/{feature-name}.ts` - tRPC procedures
  - `api/services/{feature-name}.service.ts` - Business logic layer
  - Auto-updates `src/trpc/server/api/site/root.ts`

- **Components** (React components) - Creates:
  - `components/{feature-name}-component.tsx` - Example component

- **Lib** (types and validation) - Creates:
  - `lib/types/index.ts` - TypeScript type definitions
  - `lib/validation/{feature-name}.z.ts` - Zod validation schemas

- **Pages** (reusable page sections) - Creates:
  - `pages/index.tsx` - Page component for composition

- **Header Actions** (dynamic header content) - Creates:
  - `header-actions.ts` - Header action definitions
  - `components/{feature-name}-header-action.tsx` - Header component
  - Auto-updates `src/components/layouts/main/header/header-actions/registry.ts`

- **Modals** (dialogs/drawers) - Creates:
  - `modals.ts` - Modal definitions
  - `components/modals/example-{feature-name}-modal.tsx` - Example modal
  - Auto-updates `src/modals/registry.ts`

### What Gets Auto-Generated

The scaffolding tool automatically:
1. Creates the feature directory at `src/features/{feature-name}/`
2. Generates boilerplate code with proper imports and type safety
3. Updates registry files (tRPC root, modals registry, header actions registry)
4. Uses proper naming conventions (kebab-case for files, PascalCase for components, camelCase for functions)
5. Includes example implementations you can customize

### Removing Features

```bash
npm run create -- --remove my-feature       # Remove feature and update registries
npm run create -- -r my-feature             # Short form
```

The removal process:
1. Removes imports and references from all registries
2. Prompts for confirmation before deleting the directory
3. Cleans up tRPC routes, modal definitions, and header actions

## Architecture

### Prisma Schema Organization

The database schema is located at `src/prisma/site/schema/schema.prisma`. The generated Prisma client outputs to `src/prisma/site/.generated/` with separate subdirectories for client and enums.

**Important**: Always use the generated types from `@/prisma/site/.generated/client` and `@/prisma/site/.generated/enums`.

### tRPC Architecture

The tRPC API follows a feature-based structure:

1. **Router Definition**: `src/trpc/server/api/site/root.ts` - Main app router that aggregates feature routers
2. **Feature Organization**: Each feature (e.g., settings) has:
    - `src/features/{feature}/api/index.ts` - Feature router that exports to root
    - `src/features/{feature}/api/{module}.ts` - Individual route modules (e.g., user.ts)
    - `src/features/{feature}/api/services/{module}.service.ts` - Business logic separated from routes
    - `src/features/{feature}/lib/validation/*.z.ts` - Zod validation schemas

3. **Server Setup**: `src/trpc/server/api/site/trpc.ts` contains the tRPC initialization and procedure builders
4. **Client Setup**: `src/trpc/react.tsx` provides the React Query integration

### Middleware (Next.js Proxy)

The application uses a custom middleware system in `src/lib/proxy/app.ts`:

- Handles authentication state and routing
- Validates JWT sessions for protected routes
- Manages admin route access (dev-only)
- Redirects based on user onboarding state
- Session validation via `validateProxySession()` for protected routes

### Authentication Flow

NextAuth.js configuration in `src/lib/auth/options.ts`:

- JWT strategy with custom session callbacks
- Google OAuth provider (extensible for more providers)
- Custom fields: `role`, `alias`, `onboardingCompleted`
- Session security handled in `src/lib/auth/session-security.ts`
- Client-side session handling in `src/lib/auth/client-session-handler.ts`

### Zustand State Management

Located in `src/zustand/`:

- Uses Immer middleware for immutable updates
- Configuration in `src/lib/infra/storage/zustand/immer-config.ts`
- Versioning support in `src/lib/infra/storage/zustand/versioning.ts`
- Example stores: `useLayoutStore`, `useModalStore`, `useOnboardingStore`

### Route Architecture

Routes are centrally managed in `src/routes/`:

- `src/routes/index.ts` - Main routes aggregator
- `src/routes/core.ts` - Core navigation routes
- `src/routes/menubar.ts` - Menubar/sidebar routes
- `src/routes/account.ts` - Account-related routes
- `src/routes/admin.ts` - Admin routes (dev-only)

Each route implements the `Route` interface from `src/lib/core/types/routes.ts`.

### Registry Pattern

The codebase uses a registry pattern for extensibility:

1. **Modal Registry** (`src/modals/registry.ts`):
    - Each feature exports modals from `{feature}/modals.ts`
    - Central registry aggregates all modals
    - Type-safe with auto-inferred props: `ModalPropsMap`
    - Usage: `const { openModal } = useModals(); openModal('modalKey', { props })`

2. **Header Action Registry** (`src/components/layouts/main/header/header-actions/registry.ts`):
    - Each feature exports header actions from `{feature}/header-actions.ts`
    - Automatically rendered based on current route
    - Type-safe with auto-inferred props: `HeaderActionPropsMap`

### Component Organization

- **UI Components**: `src/components/ui/` - Radix UI-based design system
- **Layout Components**: `src/components/layouts/` - Main layout, headers, footers
- **Feature Components**: `src/features/{feature}/components/` - Feature-specific components
- **Feature Pages**: `src/features/{feature}/pages/` - Reusable page sections

### Custom Hooks

Located in `src/hooks/`:

- `useModals` - Modal state management
- `useMediaQuery` - Responsive breakpoint detection
- `useKeyboardShortcut` - Keyboard shortcut handling
- `useHandleFormError` - Form error handling with toast notifications

### Environment Variables

Managed via `@t3-oss/env-nextjs` in `src/env.js`:

- Server-only variables (database URLs, API keys, OAuth secrets)
- Client-exposed variables (prefixed with `NEXT_PUBLIC_`)
- Automatic validation with Zod schemas
- Set `SKIP_ENV_VALIDATION=true` to skip validation (useful for Docker builds)

### Path Aliases

TypeScript path alias configured: `@/*` maps to `src/*`

## Feature Development Guidelines

When adding new features:

1. **Create Feature Directory**: `src/features/{feature-name}/`
2. **Add tRPC Router**:
    - Create `api/index.ts` with feature router
    - Add individual route files as needed (e.g., `api/user.ts`)
    - Separate business logic into `api/services/*.service.ts`
    - Add to `src/trpc/server/api/site/root.ts`
3. **Add Validation**: Create Zod schemas in `lib/validation/*.z.ts`
4. **Add UI Components**: Create in `components/`
5. **Add Routes**: Define routes in `src/routes/` if adding navigation
6. **Add Modals** (if needed):
    - Export modal definitions from `modals.ts`
    - Registry auto-includes them from `src/modals/registry.ts`
7. **Add Header Actions** (if needed):
    - Export from `header-actions.ts`
    - Registry auto-includes them from `src/components/layouts/main/header/header-actions/registry.ts`

## Database Schema Changes

1. Modify `src/prisma/site/schema/schema.prisma`
2. Run `npm run db:migrate:dev` to create and apply migration
3. Commit both the schema file and the migration files in `src/prisma/site/migrations/`
4. The Prisma client is automatically regenerated in `src/prisma/site/.generated/`

## Testing Database Connections

The application uses `@prisma/adapter-pg` with connection pooling:

- Pool configuration in `src/trpc/server/site.ts`
- Max connections: 20
- Connection timeout: 10s
- Idle timeout: 30s
- Vercel Functions integration via `attachDatabasePool()`

## Metadata and SEO

Metadata utilities in `src/lib/metadata/`:

- `config.ts` - Base metadata configuration
- `structured-data.ts` - JSON-LD schema generation
- `icon-graphics.ts` - Dynamic icon generation
- OpenGraph/Twitter images handled in `src/app/` route files

## Error Handling

- Custom error handler: `src/lib/core/errors/error-handler.ts`
- Error messages: `src/lib/core/errors/error-messages.ts`
- Form error handling: Use `useHandleFormError` hook
- tRPC error handling: Defined in `src/trpc/server/api/site/errors.ts`

## Analytics Integration

- Microsoft Clarity: `NEXT_PUBLIC_CLARITY_PROJECT_ID`
- Google Analytics: `NEXT_PUBLIC_GTAG_ID`
- Vercel Analytics: Automatically integrated
- Scripts in `src/scripts/analytics.tsx`

## Port Configuration

- **Dev Server**: <http://localhost:4242>
- **Prisma Studio**: <http://localhost:5555>

## Important Notes

- Admin routes (`/admin/*`) are only accessible in development mode
- The app uses standalone output mode for Docker deployments
- TailwindCSS uses the `tailwind-merge` utility for className composition
- Images use Next.js Image component with remote pattern allowlist
- Security headers configured in `next.config.js`

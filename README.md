# Heisenberg — Pre-Production Management

A modular filmmaking workspace designed for independent producers, writers, and film crews. Plan and manage every stage of pre-production — from script development and story beats to stripboards, call sheets, and industry-standard PDF exports.

---

## Features

- **Screenplay Writer**
  - Industry-standard screenplay editor formatted in Courier Prime (US Letter, proper indentations).
  - Element-based typing workflow (Scene Heading, Action, Character, Dialogue, Parenthetical, Transition, Notes).
  - Keyboard navigation with `TAB` / `ENTER` flow rules.
  - Scene navigator, autosave, find & replace, and Fountain file import/export.
- **Story Structure Engine**
  - Beat boards supporting Three-Act Structure, Save the Cat, Hero's Journey, or Custom frameworks.
  - Reorderable story beats with act organization.
- **Pre-Production Databases**
  - **Characters**: Detailed character database, arc descriptions, and cast assignments.
  - **Locations**: Scene locations, interior/exterior tags, addresses, and production notes.
  - **Props & Costumes**: Scene-by-scene tracking and inventory breakdowns.
  - **Storyboards**: Shot visualization and image attachments.
- **Production Logistics**
  - **Call Sheets**: Call times, shooting schedules, crew details, weather, and nearest hospital info.
  - **Shooting Schedule**: Stripboard scheduling organized by shoot day.
  - **Production Notes**: Categorized department notes and updates.
- **Global Search**
  - Instant cross-module search indexing scripts, characters, locations, notes, and call sheets.
- **Export Engine**
  - Pixel-perfect PDF exports via jsPDF for scripts, story structures, call sheets, and full production binders.
- **Team Collaboration & Roles**
  - Built-in role-based access control (Admin, Producer, Director, Writer, Assistant Director) with project team management.

---

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack SSR/SPA with Vite & Nitro)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.com/)
- **State & Data Fetching**: [TanStack Query](https://tanstack.com/query) & [TanStack Router](https://tanstack.com/router)
- **Database & Authentication**: [Supabase](https://supabase.com/) (PostgreSQL with Row-Level Security)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Fonts**: `@fontsource-variable/figtree` & `@fontsource/courier-prime`

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20 or newer
- [npm](https://www.npmjs.com/) v10 or newer (or pnpm / yarn)
- A [Supabase](https://supabase.com/) project

### 1. Clone & Install Dependencies

```bash
git clone <your-github-repo-url>
cd heisenberg-preproduction-management
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and configure your Supabase project credentials (found in **Supabase Dashboard > Settings > API**):

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>

SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### 3. Database Setup (Supabase Migrations)

All database schema migrations, tables, triggers, and Row Level Security (RLS) policies are located in `supabase/migrations/`.

To apply migrations to your Supabase project:

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```
2. Link your local project to your Supabase project:
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
3. Push database migrations:
   ```bash
   supabase db push
   ```

### 4. Configure Authentication

This application uses Google OAuth via Supabase Auth:
1. In your Supabase Dashboard, go to **Authentication > Providers > Google**.
2. Enable Google sign-in and provide your Google OAuth Client ID and Secret.
3. In **Authentication > URL Configuration**, add your local (`http://localhost:3000`) and production URLs to **Redirect URLs**.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the local development server at `http://localhost:3000` |
| `npm run build` | Builds the application for production |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs ESLint |
| `npm run typecheck` | Validates TypeScript types across the codebase |
| `npm run format` | Formats the codebase using Prettier |

---

## Deployment

The application is powered by Nitro and can be deployed to any modern cloud platform:

- **Node.js Server**: Run `npm run build` and launch `.output/server/index.mjs` using `node`.
- **Vercel / Netlify / Cloudflare Pages**: Set the `NITRO_PRESET` environment variable (e.g. `NITRO_PRESET=vercel` or `NITRO_PRESET=cloudflare-pages`) during build, or let Nitro auto-detect the platform.

---

## License

This project is licensed under the MIT License.

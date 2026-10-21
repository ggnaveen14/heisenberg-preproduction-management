# Heisenberg Pre-Production Management — Developer & Agent Guide

This repository contains **Heisenberg Pre-Production Management**, a filmmaking workspace built with TanStack Start, React 19, Tailwind CSS v4, and Supabase.

## Architecture

- **Framework**: TanStack Start (full-stack SSR/SPA framework with Vite and Nitro)
- **Frontend**: React 19, Tailwind CSS v4, Radix UI primitives, Lucide icons, sonner
- **Routing**: File-based routing in `src/routes/` with TanStack Router
- **Database & Auth**: Supabase (`@supabase/supabase-js`)
- **PDF Generation**: jsPDF + jsPDF-AutoTable
- **State Management**: TanStack Query + React Context

## Project Conventions

- Keep routes under `src/routes/`. The root layout is `src/routes/__root.tsx`.
- Protected pages are organized under `src/routes/_authenticated/`.
- Screenplay formatting adheres to industry standards (Courier Prime, US-Letter dimensions, scene headings, parentheticals, transitions).
- Environment variables for client-side access must be prefixed with `VITE_` (e.g., `VITE_SUPABASE_URL`).
- All code changes should maintain type-safety and adhere to the project's ESLint and Prettier configurations.

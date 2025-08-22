# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a project management application built with React Router 7 and deployed on Vercel. It's a dashboard system for managing actions, partners, and users in a Brazilian Portuguese context (bussola.cnvt.com.br).

## Development Commands

- **Start development server**: `npm run dev` (runs on http://localhost:5173)
- **Build for production**: `npm run build` (includes Vercel preparation)
- **Type checking**: `npm run typecheck` (runs React Router typegen then tsc)
- **Generate database types**: `npm run gentypes` (generates TypeScript types from Supabase)

## Architecture

### Tech Stack
- **Frontend**: React 19 with React Router 7 (SSR enabled)
- **Backend**: Supabase (PostgreSQL) with server-side authentication
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **AI Integration**: OpenAI API and Anthropic Claude SDK
- **Deployment**: Vercel with Edge Runtime
- **File Storage**: Cloudinary
- **Rich Text**: Tiptap editor
- **Animation**: GSAP and Framer Motion

### Key Features
- Dashboard for managing actions/tasks with kanban-style interface
- Partner management system
- User administration
- Real-time collaboration
- AI-powered content generation
- Theme switching (light/dark)
- File upload and management
- Report generation

### Database Schema
The app uses Supabase with these main tables:
- `actions` - Core tasks/actions with states, priorities, categories
- `partners` - Organizations/clients
- `people` - User profiles
- `categories`, `states`, `priorities`, `areas`, `sprints`, `celebrations`, `configs` - Configuration tables

### File Structure
- `app/` - Main application code
  - `components/` - Reusable UI components including shadcn/ui
  - `lib/` - Utilities (Supabase client, OpenAI, theme provider, etc.)
  - `routes/` - React Router route components
  - `root.tsx` - Application root with providers
- `server/` - Server-side code
- `database.ts` - Generated Supabase TypeScript types
- `vercel/` - Vercel deployment configuration

### Environment Variables Required
- `SUPABASE_URL` and `SUPABASE_KEY` - Supabase configuration
- `OPENAI_API_KEY` - OpenAI API access
- `CLOUDINARY_CLOUD_NAME` and `CLOUDINARY_UPLOAD_PRESET` - File uploads

### Route Structure
- `/` - Home page
- `/dashboard` - Main dashboard (requires authentication)
  - `/dashboard/home` - Dashboard home
  - `/dashboard/:partner` - Partner-specific views
  - `/dashboard/action/:id` - Action details
  - `/dashboard/admin/*` - Admin routes for users/partners
  - `/dashboard/me` - User profile
- `/login` - Authentication
- `/handle-openai` and `/handle-actions` - API endpoints

### Development Notes
- Uses TypeScript with strict mode enabled
- Path alias `~/*` maps to `./app/*`
- Edge runtime configuration for Vercel deployment
- SSR with hydration for better performance
- Theme persistence using remix-themes
- Authentication handled via Supabase Auth with cookie-based sessions
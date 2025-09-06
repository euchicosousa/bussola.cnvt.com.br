# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a project management application built with React Router 7 and deployed on Vercel. It's a dashboard system for managing actions, partners, and users in a Brazilian Portuguese context (bussola.cnvt.com.br).

## Development Commands

- **Start development server**: `npm run dev` (runs on http://localhost:3000)
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
- `types/database.ts` - Generated Supabase TypeScript types
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

## Action Management System

### Core Concepts
Actions are the central entity representing tasks/projects with:
- **Time-based validation**: Actions have execution time requirements that affect scheduling
- **Instagram integration**: Special handling for social media actions with separate posting dates
- **State management**: Kanban-style workflow with customizable states
- **Multi-partner support**: Actions can span multiple clients/partners

### Date Validation Logic
The system uses a unified date validation system (`app/shared/utils/validation/dateValidation.ts`):
- **validateAndAdjustActionDates**: Central function that maintains time constraints between action execution and Instagram posting
- **Time preservation**: When changing categories, existing time differences are preserved when possible
- **Automatic adjustment**: If constraints are violated, dates are automatically adjusted to maintain business rules

### Action Categories & Time Requirements
Defined in `app/lib/constants/constants.ts` - `TIMES` object:
- Social media actions (post: 10min, carousel: 30min, reels: 20min, stories: 5min)
- Development tasks (dev: 30min)
- Business activities (meeting: 60min, finance: 5min)
- Creative work (design: 30min, print: 30min)

### State Management Patterns
- URL state synchronization with `useEffect` hooks for persistence across navigation
- Local state for immediate UX updates with background URL syncing
- Theme state managed through remix-themes provider
- Form validation with immediate feedback and popover-close validation pattern

### API Integration
- **Actions API** (`/handle-actions`): Handles CRUD operations for actions
- **OpenAI API** (`/handle-openai`): AI content generation for captions, ideas, carousel content
- **Supabase Integration**: Real-time data sync with PostgreSQL backend
- **Intent-based actions**: Uses INTENTS constants for type-safe action handling

## Important Implementation Details

### Date Handling
- All dates stored as strings in "yyyy-MM-dd HH:mm:ss" format
- Brazilian Portuguese locale (pt-BR) used throughout
- Complex validation ensures Instagram posting dates respect action execution time requirements
- Validation occurs on popover close for better UX, not on every input change

### Component Architecture
- Unified ActionItem component with multiple variants (line, block, content, grid)
- Shared ActionContextMenu for consistent right-click functionality
- CreateAction component with sophisticated date/time validation
- DateTimeAndInstagramDate component for dual-date management

### Authentication Flow
- Server-side session management with Supabase Auth
- Cookie-based authentication for SSR compatibility
- Route protection at the loader level
- Theme persistence across sessions
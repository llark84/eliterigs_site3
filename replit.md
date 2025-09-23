# EliteRigs PC Builder

## Overview

EliteRigs PC Builder is a comprehensive web application for building custom PC configurations with compatibility checking and component selection. The application targets both beginners and enthusiasts, offering a beginner-friendly interface with educational component color-coding and sophisticated technical features. Built as a full-stack application with React frontend and Express backend, it provides real-time component compatibility validation, preset builds, and a modern responsive interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom design system featuring beginner-friendly color coding for PC components (CPU: orange, GPU: green, RAM: purple, etc.)
- **State Management**: React Query (TanStack Query) for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Custom light/dark mode implementation with CSS variables

### Backend Architecture  
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: Development server with hot reloading via Vite integration
- **Storage Interface**: Abstract storage layer with in-memory implementation for development

### Data Architecture
- **Database**: PostgreSQL configured via Drizzle ORM
- **Schema**: Structured tables for users, PC components, build presets, and user builds
- **Validation**: Zod schemas for runtime type checking and data validation
- **Migrations**: Drizzle Kit for database schema management

### Component System
- **Design System**: Gaming/tech industry reference design with sophisticated visual treatment
- **Component Categories**: Educational color coding (CPU, GPU, RAM, Storage, Motherboard, PSU, Case, Cooling)
- **Layout**: Responsive grid system with consistent spacing using Tailwind utilities
- **Interactive Elements**: Hover effects, elevation states, and smooth transitions

### Build Management
- **Component Selection**: Category-based component selection with compatibility checking
- **Build Summary**: Real-time price calculation and component tracking
- **Presets**: Pre-configured builds for different performance tiers (Entry, Mid-range, High-end, Enthusiast)
- **Console Killers**: Specialized presets targeting console-equivalent performance (PS5 Equivalent at $793, Xbox Series X Equivalent at $843)
- **Validation**: Real-time compatibility validation and missing component detection
- **Cart Building**: Integration with vendor pricing to generate purchasable links grouped by vendor

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18+ with React DOM, React Query for data fetching
- **Build Tools**: Vite for development and build processes, esbuild for production builds
- **TypeScript**: Full TypeScript support across frontend and backend

### UI and Design
- **Radix UI**: Complete set of unstyled, accessible UI primitives (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Lucide React**: Icon library for consistent iconography
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono)

### Database and Backend
- **Neon Database**: PostgreSQL cloud database via @neondatabase/serverless
- **Drizzle ORM**: Type-safe SQL toolkit with Drizzle Kit for migrations
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)

### Development and Deployment
- **Replit Integration**: Development environment integration with runtime error overlay
- **Compression**: gzip compression for production builds
- **CORS**: Cross-origin resource sharing configuration
- **Hot Reloading**: Development server with file watching and automatic reloads

### Utility Libraries
- **Form Handling**: React Hook Form with Hookform Resolvers for validation
- **Date Manipulation**: date-fns for date formatting and manipulation
- **Class Utilities**: clsx and tailwind-merge for conditional styling
- **Carousel**: Embla Carousel for component showcases
- **Command Palette**: cmdk for search and command interfaces
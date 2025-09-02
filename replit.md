# Overview

This is a comprehensive website for Mahapala Narotama, a nature conservation and outdoor activities organization at Narotama University. The application serves as both an informational platform and a management system for member registration, activities, learning modules, and organizational history. It features a React frontend with a Node.js/Express backend, Firebase integration for hosting and storage, and GitHub OAuth for image management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite as the build tool
- **Routing**: React Router for client-side navigation with proper SPA handling
- **UI Components**: Shadcn/ui with Radix UI primitives for consistent design system
- **Styling**: Tailwind CSS with custom green/nature theme for Mahapala branding
- **State Management**: TanStack Query for server state and local React state for UI state
- **Mobile Support**: Capacitor for native mobile app capabilities

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema**: Centralized schema definitions in shared folder for type consistency
- **API Design**: RESTful endpoints with proper CORS configuration
- **File Structure**: Workspace-based monorepo with separate client and server packages

## Authentication & Authorization
- **GitHub OAuth**: Direct OAuth implementation for admin image uploads to GitHub repositories
- **Firebase Auth**: Firebase Authentication for admin panel access
- **Token Management**: Secure cookie-based token storage with validation

## Data Storage
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Image Storage**: GitHub repository for static assets with direct API uploads
- **Firebase Storage**: Firebase for additional file storage needs
- **Caching**: Browser caching for static assets and service worker for offline support

## Progressive Web App (PWA)
- **Service Worker**: Custom implementation for offline functionality and asset caching
- **Manifest**: PWA manifest for standalone app installation
- **Offline Mode**: Dedicated offline page with cached content for limited connectivity

## Build & Deployment
- **Build System**: Vite for fast development and optimized production builds
- **Deployment**: Multi-platform deployment with Netlify, Firebase Hosting, and server options
- **CI/CD**: Automated builds with TypeScript compilation and asset optimization
- **Asset Management**: Automated asset manifest generation for efficient caching

# External Dependencies

## Core Services
- **Database**: Neon PostgreSQL serverless database for data persistence
- **Hosting**: Firebase Hosting for static site deployment with CDN
- **Authentication**: Firebase Authentication service for secure user management
- **File Storage**: GitHub API for image uploads and version-controlled asset management

## Third-Party APIs
- **GitHub OAuth**: OAuth integration for repository access and image management
- **Firebase Services**: Authentication, hosting, and storage services
- **Google Fonts**: Poppins and Open Sans fonts for typography

## Development Tools
- **Drizzle ORM**: Type-safe database queries with migration support
- **TypeScript**: Full type safety across client and server
- **Tailwind CSS**: Utility-first CSS framework with custom theme
- **Vite**: Fast build tool with hot module replacement

## UI Libraries
- **Radix UI**: Accessible component primitives for consistent user interface
- **Lucide React**: Icon library for consistent iconography
- **React Query**: Server state management with caching and synchronization
- **QR Code Generation**: QRCode.react for member card QR codes

## Monitoring & Analytics
- **Error Boundary**: React error boundaries for graceful error handling
- **Service Worker**: Performance monitoring and cache management
- **Browser APIs**: Geolocation, camera access for member features
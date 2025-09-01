# Overview

This project is a full-stack web application for Mahapala Narotama, a nature-loving student organization at Narotama University in Surabaya. The platform serves as their official website featuring member management, activity showcasing, learning modules, and administrative tools. The application combines a React-based frontend with an Express backend, supporting both web and Progressive Web App (PWA) deployment models.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client-side application is built with React and TypeScript, utilizing Vite as the build tool. It follows a component-based architecture with React Router for navigation and TanStack Query for state management. The UI is built using Radix UI components with Tailwind CSS for styling, following a design system approach with shadcn/ui components.

Key architectural decisions:
- **Single Page Application (SPA)**: Enables smooth navigation and better user experience
- **PWA Support**: Implements service workers for offline functionality and mobile app-like experience
- **Component Library**: Uses Radix UI primitives for accessibility and consistency
- **State Management**: TanStack Query handles server state, while local state uses React hooks

## Backend Architecture  
The server-side follows a Node.js/Express architecture with TypeScript. It implements a modular design with separate concerns for routing, storage, and business logic.

Key components:
- **Express Server**: Handles API routing and serves static files
- **Storage Layer**: Abstracted storage interface supporting both in-memory and database implementations
- **Authentication**: Firebase Authentication integration for admin access
- **File Upload**: GitHub OAuth integration for image management

## Database Design
The application uses Drizzle ORM with PostgreSQL for data persistence. The schema includes entities for users, members, activities, and learning modules with appropriate relationships and constraints.

Tables:
- `users`: Admin authentication and authorization
- `members`: Student member profiles with registration details
- `activities`: Organization events and activities
- `learning_modules`: Educational content and resources

## Deployment Strategy
The application supports multiple deployment models:
- **Monorepo Structure**: Client and server workspaces with shared schema
- **Static Hosting**: Client can be deployed to Netlify/Firebase Hosting
- **Server Deployment**: Express server deployable to Railway/Heroku
- **Capacitor Integration**: Mobile app deployment for Android

# External Dependencies

## Authentication & Authorization
- **Firebase Authentication**: User management and admin authentication
- **GitHub OAuth**: Integration for image upload functionality to GitHub repositories

## Database & Storage
- **Neon Database**: PostgreSQL database hosting (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database operations and migrations
- **GitHub API**: Image storage and repository management

## UI & Styling
- **Radix UI**: Accessible component primitives for consistent UI
- **Tailwind CSS**: Utility-first CSS framework for responsive design  
- **Lucide React**: Icon library for consistent iconography
- **React Three Fiber**: 3D rendering for enhanced member card visualization

## Development & Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across the entire application
- **ESLint & Prettier**: Code quality and formatting standards
- **Capacitor**: Cross-platform mobile app deployment

## Third-party Integrations
- **QR Code Generation**: Member identification and verification system
- **Date Formatting**: International date handling with date-fns
- **Real-time Features**: Service worker implementation for offline support
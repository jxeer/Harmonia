# Harmonia Healthcare Platform

## Overview

Harmonia is a healthcare platform focused on connecting patients with culturally competent healthcare providers. The application emphasizes cultural sensitivity and inclusive healthcare by allowing patients to find providers who understand their cultural background, speak their language, and share similar cultural experiences. The platform features comprehensive health management tools, appointment scheduling, secure messaging, and telehealth capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **UI Components**: Radix UI primitives with custom styling for accessibility

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Authentication**: OpenID Connect (OIDC) with Replit Auth integration
- **Session Management**: express-session with PostgreSQL session store

### Data Storage Solutions
- **Primary Database**: PostgreSQL with the following core entities:
  - Users (with role-based access: patient, provider, admin)
  - Patient and Provider profiles with cultural background tracking
  - Health journal entries for biometric and wellness data
  - Appointments with virtual/in-person support
  - Messages for secure communication
  - Medical records with file attachments
  - Provider reviews and ratings
- **File Storage**: Google Cloud Storage for medical records and attachments
- **Session Storage**: PostgreSQL table for session persistence

### Authentication and Authorization
- **Primary Auth**: Replit OIDC integration with automatic user provisioning
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Role-Based Access**: Three-tier role system (patient, provider, admin)
- **API Security**: Session-based authentication for all API endpoints

### External Dependencies
- **Cloud Storage**: Google Cloud Storage with Replit sidecar authentication
- **UI Components**: Radix UI primitives for accessible component foundation
- **File Upload**: Uppy.js for robust file upload handling with progress tracking
- **Charts**: Recharts for data visualization in dashboards
- **Database**: Neon PostgreSQL for serverless database hosting
- **Date Handling**: date-fns for date manipulation and formatting
- **Icons**: Lucide React for consistent iconography

### Key Architectural Decisions
- **Monorepo Structure**: Shared schema definitions between client and server in `/shared` directory
- **Type Safety**: End-to-end TypeScript with Zod schemas for runtime validation
- **Cultural Focus**: Specialized filtering and matching based on cultural backgrounds and languages
- **File Security**: Object ACL system for controlling access to medical records and sensitive files
- **Responsive Design**: Mobile-first approach with Tailwind CSS responsive utilities
- **Development Experience**: Hot reload with Vite, comprehensive error handling, and structured logging
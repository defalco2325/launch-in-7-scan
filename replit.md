# LaunchIn7 - Website Health Scanner

## Overview

LaunchIn7 is a production-ready web application that scans websites for performance, accessibility, SEO, and best practices issues while extracting brand elements to generate modern website previews. The application captures leads for website rebuilding services through an integrated lead form and automated PDF report delivery system. Built as a full-stack TypeScript application, it combines website analysis tools with lead generation capabilities to help businesses identify and address website issues.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Component-based UI with strict type safety
- **Wouter**: Lightweight client-side routing for SPA navigation
- **Tailwind CSS + Shadcn UI**: Utility-first styling with pre-built component library
- **TanStack Query**: Server state management with caching and background refetching
- **React Hook Form**: Form validation and state management

### Backend Architecture
- **Express.js + Node.js**: RESTful API server with middleware support
- **TypeScript**: End-to-end type safety across client and server
- **In-Memory Storage**: Simple data persistence using Map-based storage (MemStorage class)
- **Service Layer Pattern**: Separated business logic into dedicated service modules
- **Background Processing**: Asynchronous website scanning and brand extraction

### Database & Data Management
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect
- **Zod Schemas**: Runtime validation and type inference for data models
- **Dual Storage Strategy**: In-memory storage for development, PostgreSQL schema ready for production
- **Data Models**: Scans table for website analysis results, Leads table for prospect information

### Authentication & Security
- **Basic HTTP Authentication**: Admin dashboard protection with username/password
- **Input Validation**: URL format validation and sanitization
- **CORS Configuration**: Cross-origin request handling
- **Environment Variables**: Secure API key and credential management

### External Service Integration
- **Google PageSpeed Insights API**: Website performance, accessibility, SEO, and best practices analysis
- **SendGrid Email API**: Automated PDF report delivery to leads
- **Cheerio Web Scraping**: Brand element extraction from website HTML/CSS
- **Screenshot Capture**: Website preview generation (infrastructure ready)

### Core Features Architecture
- **Website Scanning Engine**: Integrates with PageSpeed API to analyze Core Web Vitals, performance scores, and technical issues
- **Brand Extraction System**: Automated detection of business name, tagline, logo, colors, and fonts from website markup
- **Preview Generation**: Creates modern website mockups using extracted brand elements
- **Lead Capture Pipeline**: Form submission → data storage → PDF generation → email delivery
- **Admin Dashboard**: Lead management interface with authentication and export capabilities

### Performance & Scalability Considerations
- **Lazy Loading**: Component-level code splitting for optimal bundle sizes
- **Query Caching**: TanStack Query handles API response caching and invalidation
- **Background Processing**: Non-blocking website scans with status polling
- **Error Boundaries**: Graceful error handling with user feedback
- **Responsive Design**: Mobile-first approach with adaptive layouts

## External Dependencies

### API Services
- **Google PageSpeed Insights API**: Website performance analysis and Core Web Vitals measurement
- **SendGrid**: Email delivery service for automated report distribution

### Third-Party Libraries
- **Radix UI**: Accessible component primitives for complex UI elements
- **Cheerio**: Server-side HTML parsing and manipulation for brand extraction
- **React Hook Form + Zod**: Form validation and data schema validation
- **Class Variance Authority**: Type-safe CSS class composition
- **Lucide React**: Icon library for consistent UI elements

### Development Tools
- **Vite**: Fast build tool and development server
- **ESBuild**: JavaScript bundling for production builds
- **PostCSS + Autoprefixer**: CSS processing and vendor prefixing
- **TypeScript**: Static type checking across the entire application

### Database & ORM
- **Neon Database**: Serverless PostgreSQL hosting (configured via DATABASE_URL)
- **Drizzle Kit**: Database migration and schema management tools
- **Connect PG Simple**: PostgreSQL session storage for production deployments

### Deployment Infrastructure
- **Replit Hosting**: Primary deployment platform with integrated development environment
- **Environment Configuration**: Secure credential management through environment variables
- **Static Asset Serving**: Optimized client bundle delivery through Express middleware
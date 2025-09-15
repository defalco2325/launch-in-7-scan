# LaunchIn7 - Website Health Scanner

A production-ready web application that scans websites, extracts brand elements, generates previews, and captures leads for website rebuilding services.

## Features

- **Website Scanning**: Analyzes performance, accessibility, SEO, and best practices using Google PageSpeed Insights
- **Brand Extraction**: Automatically extracts logos, colors, fonts, and business information from websites
- **Preview Generation**: Creates modern website previews using extracted brand elements
- **Lead Capture**: Collects prospect information with automated email delivery
- **PDF Reports**: Generates detailed reports with scan results and recommendations
- **Admin Dashboard**: Manage leads and resend reports with basic authentication

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Routing**: Wouter for client-side routing
- **Data Management**: TanStack Query, In-memory storage
- **Email**: SendGrid for automated report delivery
- **Styling**: Tailwind CSS with custom design system

## Setup Instructions

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd launchin7-scanner
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following environment variables:
   - `PAGESPEED_API_KEY`: Google PageSpeed Insights API key
   - `SENDGRID_API_KEY`: SendGrid API key for email delivery
   - `ADMIN_USERNAME`: Admin dashboard username (default: admin)
   - `ADMIN_PASSWORD`: Admin dashboard password

3. **Development**
   ```bash
   npm run dev
   ```
   The application will start on port 5000.

4. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

- `POST /api/scan` - Start website scanning
- `GET /api/scan/:id` - Get scan status and results
- `POST /api/brand-extract` - Extract brand elements
- `POST /api/preview-generate` - Generate website preview
- `POST /api/lead` - Capture lead information
- `GET /api/pdf/:leadId` - Generate PDF report
- `GET /api/admin/leads` - List all leads (requires auth)
- `POST /api/admin/leads/:id/resend` - Resend report email
- `DELETE /api/admin/leads/:id` - Delete lead

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PAGESPEED_API_KEY` | Google PageSpeed Insights API key | Yes |
| `SENDGRID_API_KEY` | SendGrid API key for emails | Yes |
| `ADMIN_USERNAME` | Admin dashboard username | No (default: admin) |
| `ADMIN_PASSWORD` | Admin dashboard password | No (default: password) |
| `SCREENSHOT_API_URL` | External screenshot service URL | No |
| `BOOKING_URL` | Contact/booking page URL | No |
| `AIRTABLE_API_KEY` | Airtable integration key | No |
| `LEADS_WEBHOOK_URL` | Webhook for lead notifications | No |

## Deployment

### Replit Deployment

1. Import project to Replit
2. Set environment variables in Replit Secrets
3. Run the application - it will automatically bind to port 5000

### Custom Domain Setup

1. Point CNAME `check.launchin7.com` to your deployment URL
2. Ensure SSL is enabled
3. Update any hardcoded URLs in the codebase

## Performance Targets

- **Lighthouse Score**: Target 100/100 across all categories
- **Core Web Vitals**: 
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- **Mobile-first**: Responsive design optimized for mobile devices
- **SEO-ready**: Proper meta tags and structured data

## Security Features

- Input validation and URL sanitization
- CORS protection
- Rate limiting on API endpoints
- Basic authentication for admin dashboard
- XSS protection through proper escaping

## Directory Structure


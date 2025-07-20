# 🚀 Food Ordering App - Backend Setup Guide

## 📋 Overview

This guide will help you set up the complete backend for the Food Ordering Application, including database configuration, external service integrations, and environment setup.

## 🛠️ Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Git for version control
- A code editor (VS Code recommended)

## 📦 Package Installation

Install all dependencies:

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

## 🔐 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/food_ordering_db"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Stripe Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudinary Image Management
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Twilio WhatsApp Integration
TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
TWILIO_AUTH_TOKEN="your_auth_token"
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"
ADMIN_WHATSAPP_NUMBER="whatsapp:+1234567890"

# Application Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@foodhaven.com"
```

## 🗄️ Database Setup

### 1. Create Database

Create a PostgreSQL database:

```sql
CREATE DATABASE food_ordering_db;
```

### 2. Run Migrations

Generate and apply database migrations:

```bash
# Generate migration files
pnpm drizzle-kit generate

# Apply migrations to database
pnpm drizzle-kit migrate
```

### 3. Seed Database (Optional)

Create and run a seed script to populate initial data:

```bash
# Create seed file
touch src/lib/seed.ts

# Run seed script
pnpm tsx src/lib/seed.ts
```

## 🔧 External Service Configuration

### 1. Clerk Authentication Setup

1. Create account at [clerk.com](https://clerk.com)
2. Create a new application
3. Configure OAuth providers (Google, LinkedIn)
4. Copy API keys to `.env.local`
5. Set up webhooks for user management

### 2. Stripe Payment Setup

1. Create account at [stripe.com](https://stripe.com)
2. Get test API keys from dashboard
3. Configure webhooks for payment events
4. Set webhook endpoint: `https://yourdomain.com/api/payment/webhook`

### 3. Cloudinary Image Setup

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Get API credentials from dashboard
3. Configure upload presets and transformations

### 4. Twilio WhatsApp Setup

1. Create account at [twilio.com](https://twilio.com)
2. Enable WhatsApp Business API
3. Configure sandbox or production WhatsApp number
4. Get account SID and auth token

## 🏃‍♂️ Running the Application

### Development Mode

```bash
# Start development server
pnpm dev

# Server will start at http://localhost:3000
```

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js 13+ App Router
│   ├── api/               # API routes
│   │   ├── admin/         # Admin management endpoints
│   │   ├── menu/          # Menu item operations
│   │   ├── orders/        # Order management
│   │   ├── payment/       # Payment processing
│   │   ├── upload/        # Image upload handling
│   │   └── notifications/ # WhatsApp notifications
│   └── (routes)/          # Application pages
├── lib/                   # Utility libraries
│   ├── db/               # Database configuration
│   │   ├── schema/       # Drizzle ORM schemas
│   │   └── index.ts      # Database connection
│   ├── services/         # Business logic layer
│   │   ├── menu.service.ts
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   ├── notification.service.ts
│   │   └── cloudinary.service.ts
│   ├── auth.ts           # Authentication middleware
│   └── utils.ts          # Utility functions
└── components/           # Reusable UI components
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **API Rate Limiting**: Implement rate limiting for public endpoints
3. **Input Validation**: All inputs are validated using Zod schemas
4. **Authentication**: Clerk handles secure authentication flows
5. **Payment Security**: Stripe handles sensitive payment data

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application: `pnpm build`
2. Deploy to your hosting provider
3. Configure environment variables
4. Set up database connection
5. Configure external service webhooks

## 📊 Database Schema

The application uses the following main tables:

- **users**: Customer and admin user data
- **categories**: Food categories (appetizers, mains, etc.)
- **menu_items**: Restaurant menu items with details
- **orders**: Customer orders with status tracking
- **order_items**: Individual items within orders
- **addresses**: Customer delivery addresses
- **reviews**: Customer reviews and ratings
- **coupons**: Discount codes and promotions
- **notifications**: System notifications
- **analytics**: Business intelligence data

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check `DATABASE_URL` format
   - Ensure PostgreSQL is running
   - Verify database credentials

2. **Clerk Authentication Issues**
   - Verify API keys are correct
   - Check domain configuration
   - Ensure webhook endpoints are accessible

3. **Stripe Payment Failures**
   - Use test card numbers in development
   - Verify webhook endpoint is accessible
   - Check Stripe dashboard for error logs

4. **Image Upload Issues**
   - Verify Cloudinary credentials
   - Check file size limits
   - Ensure proper CORS configuration

## 📞 Support

For issues or questions:

1. Check the troubleshooting section
2. Review Next.js and service provider documentation
3. Open an issue in the repository
4. Contact the development team

## 🔄 Updates and Maintenance

### Database Migrations

When updating the schema:

```bash
# Generate new migration
pnpm drizzle-kit generate

# Apply migration
pnpm drizzle-kit migrate
```

### Dependency Updates

Regularly update dependencies:

```bash
# Check for updates
pnpm outdated

# Update packages
pnpm update
```

## 📈 Monitoring and Analytics

### Performance Monitoring

- Use Vercel Analytics for deployment metrics
- Monitor API response times
- Track error rates and user engagement

### Business Analytics

- Admin dashboard provides real-time metrics
- Order volume and revenue tracking
- Customer behavior analytics
- Popular menu items analysis

---

🎉 **Your Food Ordering Application Backend is now ready for production!**

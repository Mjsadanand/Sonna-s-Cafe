# Admin Panel Backend API Documentation

## Overview

This comprehensive admin backend provides complete CRUD operations, analytics, and invoice management for the food ordering application using PostgreSQL with Drizzle ORM.

## Authentication

All admin routes require authentication via Clerk. The user must have `admin` role in the database.

## API Routes

### Dashboard & Analytics

#### GET `/api/admin/dashboard`
Get dashboard statistics including orders, revenue, users, and growth metrics.

**Query Parameters:**
- `dateFrom` (optional): Start date (ISO string)
- `dateTo` (optional): End date (ISO string)

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "totalOrders": 1200,
    "totalMenuItems": 45,
    "totalCategories": 8,
    "totalRevenue": 45000.50,
    "deliveredOrders": 1100,
    "pendingOrders": 50,
    "cancelledOrders": 50,
    "todayOrders": 15,
    "todayRevenue": 850.25,
    "orderGrowth": 12.5,
    "revenueGrowth": 18.3
  }
}
```

#### GET `/api/admin/analytics/revenue`
Get revenue analytics with time-based breakdown.

**Query Parameters:**
- `period`: "daily" | "weekly" | "monthly" (default: "daily")
- `days`: Number of days (default: 30)

#### GET `/api/admin/analytics/customers`
Get customer analytics including segmentation and growth metrics.

#### GET `/api/admin/analytics/top-items`
Get top selling menu items.

**Query Parameters:**
- `limit`: Number of items (default: 10)
- `dateFrom`, `dateTo`: Date range

### Order Management

#### GET `/api/admin/orders`
Get all orders with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Order status filter
- `paymentStatus`: Payment status filter
- `search`: Search in order number, customer name/email
- `dateFrom`, `dateTo`: Date range
- `sortBy`: "createdAt" | "total" | "status"
- `sortOrder`: "asc" | "desc"

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [...],
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

#### PUT `/api/admin/orders`
Update order status.

**Request Body:**
```json
{
  "orderId": "uuid",
  "status": "confirmed",
  "kitchenNotes": "Extra spicy"
}
```

#### GET `/api/admin/orders/[id]`
Get detailed order information including items and tracking.

#### PATCH `/api/admin/orders/[id]`
Update specific order.

### User Management

#### GET `/api/admin/users`
Get all users with filtering and pagination.

**Query Parameters:**
- `page`, `limit`: Pagination
- `role`: User role filter
- `search`: Search in name, email, phone
- `isActive`: Active status filter
- `sortBy`: "createdAt" | "loyaltyPoints" | "email"
- `sortOrder`: "asc" | "desc"

#### PUT `/api/admin/users`
Update user status or role.

**Request Body:**
```json
{
  "userId": "uuid",
  "isActive": true,
  "role": "admin"
}
```

#### GET `/api/admin/users/[id]`
Get detailed user information including order history and statistics.

### Menu Management

#### GET `/api/admin/menu`
Get all menu items with filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `categoryId`: Filter by category
- `status`: "available" | "unavailable"
- `search`: Search in item names
- `isPopular`: Filter popular items

#### POST `/api/admin/menu`
Create new menu item.

**Request Body:**
```json
{
  "name": "Pizza Margherita",
  "description": "Fresh tomatoes, mozzarella, basil",
  "price": "12.99",
  "categoryId": "uuid",
  "image": "image-url",
  "isAvailable": true,
  "isVegetarian": true,
  "spiceLevel": "MILD",
  "preparationTime": 15,
  "ingredients": ["tomatoes", "mozzarella", "basil"],
  "tags": ["popular", "vegetarian"]
}
```

#### GET `/api/admin/menu-items/[id]`
Get menu item details.

#### PUT `/api/admin/menu-items/[id]`
Update menu item.

#### DELETE `/api/admin/menu-items/[id]`
Delete menu item.

#### PATCH `/api/admin/menu-items/[id]`
Quick updates (toggle availability, etc.).

**Request Body:**
```json
{
  "action": "toggle_availability"
}
```

#### POST `/api/admin/menu/bulk`
Bulk operations on menu items.

**Request Body:**
```json
{
  "action": "update",
  "itemIds": ["uuid1", "uuid2"],
  "updateData": {
    "isAvailable": false
  }
}
```

#### GET `/api/admin/menu/statistics`
Get menu statistics (total items, available, popular, vegetarian).

### Category Management

#### GET `/api/admin/categories`
Get all categories.

**Query Parameters:**
- `includeInactive`: Include inactive categories

#### POST `/api/admin/categories`
Create new category.

**Request Body:**
```json
{
  "name": "Pizzas",
  "slug": "pizzas",
  "description": "Delicious pizzas",
  "image": "image-url",
  "isActive": true,
  "sortOrder": 1
}
```

### Review Management

#### GET `/api/admin/reviews`
Get all reviews with filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `rating`: Filter by rating (1-5)
- `isApproved`: Approval status
- `menuItemId`: Filter by menu item
- `search`: Search in review comments

#### PUT `/api/admin/reviews`
Update review approval status.

**Request Body:**
```json
{
  "reviewId": "uuid",
  "isApproved": true
}
```

#### DELETE `/api/admin/reviews`
Delete review.

**Query Parameters:**
- `reviewId`: Review ID to delete

### Invoice Management

#### GET `/api/admin/invoices`
Get all invoices with filtering and pagination.

**Query Parameters:**
- `page`, `limit`: Pagination
- `paymentStatus`: Payment status filter
- `search`: Search in order number, customer details
- `dateFrom`, `dateTo`: Date range
- `sortBy`: "createdAt" | "total" | "orderNumber"
- `sortOrder`: "asc" | "desc"

#### GET `/api/admin/invoices/[id]`
Get specific invoice data.

#### GET `/api/admin/invoices/[id]/html`
Generate and download invoice as HTML.

#### GET `/api/admin/invoices/analytics`
Get invoice analytics and statistics.

**Query Parameters:**
- `dateFrom`, `dateTo`: Date range

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalInvoices": 1200,
      "totalRevenue": 45000.50,
      "paidInvoices": 1100,
      "paidRevenue": 42000.00,
      "pendingInvoices": 100,
      "pendingRevenue": 3000.50,
      "averageOrderValue": 37.50
    },
    "monthlyBreakdown": [...]
  }
}
```

### Notifications

#### POST `/api/admin/notifications`
Send bulk notifications to users.

**Request Body:**
```json
{
  "title": "Special Offer!",
  "message": "Get 20% off on all pizzas",
  "type": "promotion",
  "targetUsers": ["user1", "user2"],
  "metadata": {
    "discount": "20%",
    "category": "pizzas"
  }
}
```

## Services

### AdminService

Main service class providing:
- Dashboard statistics
- Revenue analytics
- Customer analytics
- Order management (CRUD)
- User management (CRUD)
- Review management
- Bulk notifications

### InvoiceService

Invoice management service providing:
- Invoice data generation
- HTML invoice generation
- Invoice statistics
- Invoice listing with filters

### MenuService (Enhanced)

Enhanced menu service with:
- Complete CRUD operations
- Bulk operations
- Statistics
- Advanced filtering
- Availability management

## Database Schema

The system uses PostgreSQL with Drizzle ORM. Key tables include:

- `users` - User accounts with roles
- `orders` - Order information
- `order_items` - Order line items
- `menu_items` - Menu item details
- `categories` - Menu categories
- `reviews` - Customer reviews
- `notifications` - User notifications
- `addresses` - Customer addresses
- `order_tracking` - Order status tracking

## Security

- All routes protected with Clerk authentication
- Role-based access control (admin only)
- Input validation with Zod
- SQL injection protection via Drizzle ORM
- Error handling and logging

## Error Handling

Consistent error responses:
```json
{
  "error": "Error message",
  "details": "Additional details (for validation errors)"
}
```

HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

## Real-time Features

- Order status updates trigger notifications
- Real-time dashboard statistics
- Live order tracking
- Automated invoice generation

## Analytics Features

- Revenue trends and forecasting
- Customer segmentation
- Popular item analysis
- Performance metrics
- Growth calculations
- Monthly/daily breakdowns

# 🍽️ Food Haven - Modern Food Ordering Application

A beautiful, modern, and responsive food ordering web application built with Next.js 15, TypeScript, Tailwind CSS, and ShadcnUI. This application features a clean, minimal aesthetic inspired by a white and green café theme.

## ✨ Features

### 🏠 **Core Features**
- **Modern UI/UX**: Clean, minimal design with green café theme
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)
- **Real-time Cart Management**: Add/remove items with live updates
- **Order Tracking**: Monitor order status in real-time
- **User Authentication**: Secure login and registration
- **Restaurant Discovery**: Browse and search restaurants
- **Advanced Search**: Filter by cuisine, delivery time, rating
- **Favorites System**: Save and reorder favorite items

### 📱 **Pages & Components**
- **Home Page**: Hero section with featured restaurants and popular items
- **Menu Browsing**: Category-based menu with search and filters
- **Shopping Cart**: Dynamic cart with quantity management
- **Checkout**: Secure payment flow with multiple payment options
- **Order Management**: Track active and past orders
- **User Profile**: Manage account settings and preferences
- **Restaurant Listings**: Discover restaurants with detailed information
- **Help & Support**: Comprehensive FAQ and contact options
- **Admin Dashboard**: Restaurant management interface (preview)

### 🛠️ **Technical Features**
- **Next.js 15**: Latest version with App Router
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS v4**: Modern styling with custom theme
- **ShadcnUI**: Beautiful, accessible component library
- **React Hook Form**: Efficient form handling with validation
- **Zod**: Runtime type validation
- **Context API**: Global state management for cart
- **LocalStorage**: Persistent cart data

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd food-ordering-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📂 Project Structure

```
food-ordering-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── auth/              # Authentication pages
│   │   ├── cart/              # Shopping cart
│   │   ├── checkout/          # Checkout process
│   │   ├── help/              # Help & support
│   │   ├── menu/              # Menu browsing
│   │   ├── orders/            # Order management
│   │   ├── profile/           # User profile
│   │   ├── restaurants/       # Restaurant listings
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # Reusable components
│   │   ├── ui/               # ShadcnUI components
│   │   ├── layout/           # Layout components
│   │   ├── menu/             # Menu-related components
│   │   └── cart/             # Cart components
│   ├── contexts/             # React contexts
│   ├── lib/                  # Utilities and configurations
│   ├── types/                # TypeScript type definitions
│   └── data/                 # Mock data
├── public/                   # Static assets
├── tailwind.config.js        # Tailwind CSS configuration
├── components.json           # ShadcnUI configuration
└── package.json             # Dependencies and scripts
```

## 🎨 Design System

### **Color Palette**
- **Primary Green**: `#16a34a` (green-600)
- **Green Variants**: 50, 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Neutral Colors**: Gray scale for text and backgrounds
- **Accent Colors**: Red for favorites, Blue for information, Yellow for ratings

### **Typography**
- **Font Family**: Inter (Google Fonts)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### **Components**
Built with ShadcnUI for consistency and accessibility:
- Buttons with multiple variants
- Cards with hover effects
- Form inputs with validation states
- Badges for status indicators
- Toast notifications
- Modal dialogs
- Tabs and navigation

## 🛒 Cart System

The application features a sophisticated cart management system:

### **Cart Context**
- Global state management using React Context
- Persistent storage with localStorage
- Automatic calculation of totals, tax, and delivery fees

### **Cart Features**
- Add items with customization
- Update quantities
- Remove items
- Apply promo codes
- Calculate delivery fees and taxes
- Persist across browser sessions

## 📱 Responsive Design

### **Mobile-First Approach**
- Designed for mobile devices first
- Progressive enhancement for larger screens
- Touch-friendly interface elements

### **Breakpoints**
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### **Responsive Features**
- Collapsible navigation
- Adaptive grid layouts
- Scalable typography
- Touch-optimized buttons and forms

## 🔧 Development

### **Available Scripts**

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler

# Component Management
pnpm add-component # Add new ShadcnUI component
```

### **Code Quality**
- **ESLint**: Code linting with Next.js configuration
- **TypeScript**: Full type checking
- **Prettier**: Code formatting (recommended)

### **Environment Variables**
Create a `.env.local` file for environment-specific settings:
```env
NEXT_PUBLIC_API_URL=your_api_url
NEXT_PUBLIC_STRIPE_KEY=your_stripe_key
```

## 🌟 Key Technologies

### **Frontend Framework**
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features and hooks
- **TypeScript**: Type-safe development

### **Styling & UI**
- **Tailwind CSS v4**: Utility-first CSS framework
- **ShadcnUI**: High-quality component library
- **Radix UI**: Primitive components for accessibility
- **Lucide React**: Beautiful icon library

### **Form Handling**
- **React Hook Form**: Performant form library
- **Zod**: Schema validation
- **Input validation**: Real-time form validation

### **State Management**
- **React Context**: Global state for cart and user
- **localStorage**: Persistent client-side storage
- **Custom hooks**: Reusable state logic

## 🎯 Future Enhancements

### **Backend Integration**
- User authentication with JWT
- Database integration (PostgreSQL/MongoDB)
- Payment processing (Stripe/PayPal)
- Real-time order tracking
- Restaurant management API

### **Advanced Features**
- Push notifications
- Offline support (PWA)
- Multi-language support
- Advanced analytics
- Loyalty program integration

### **Performance Optimizations**
- Image optimization
- Code splitting
- Caching strategies
- Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ShadcnUI**: For the beautiful component library
- **Tailwind CSS**: For the utility-first CSS framework
- **Next.js Team**: For the amazing React framework
- **Radix UI**: For accessible primitive components
- **Lucide**: For the comprehensive icon library

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**

For questions or support, please visit our [Help page](http://localhost:3000/help) or contact us at support@foodhaven.com.

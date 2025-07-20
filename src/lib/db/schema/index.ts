import { pgTable, text, uuid, timestamp, boolean, integer, decimal, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { z } from 'zod';

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'admin', 'kitchen_staff']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const spiceLevelEnum = pgEnum('spice_level', ['MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').unique().notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  role: userRoleEnum('role').default('customer').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  loyaltyPoints: integer('loyalty_points').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  image: text('image'),
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Menu items table
export const menuItems = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  image: text('image'),
  categoryId: uuid('category_id').references(() => categories.id).notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  isVegetarian: boolean('is_vegetarian').default(false),
  isVegan: boolean('is_vegan').default(false),
  isGlutenFree: boolean('is_gluten_free').default(false),
  spiceLevel: spiceLevelEnum('spice_level').default('MILD'),
  preparationTime: integer('preparation_time').default(30), // in minutes
  ingredients: jsonb('ingredients').$type<string[]>(),
  nutritionInfo: jsonb('nutrition_info'),
  tags: jsonb('tags').$type<string[]>(),
  isPopular: boolean('is_popular').default(false),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Addresses table
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type').default('home'), // home, work, other
  label: text('label'),
  addressLine1: text('address_line_1').notNull(),
  addressLine2: text('address_line_2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').default('India').notNull(),
  landmark: text('landmark'),
  instructions: text('instructions'),
  isDefault: boolean('is_default').default(false),
  coordinates: jsonb('coordinates').$type<{ lat: number; lng: number }>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').unique().notNull(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  status: orderStatusEnum('status').default('pending').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  paymentStatus: paymentStatusEnum('payment_status').default('pending').notNull(),
  paymentIntentId: text('payment_intent_id'),
  deliveryAddressId: uuid('delivery_address_id').references(() => addresses.id),
  customerNotes: text('customer_notes'),
  estimatedDeliveryTime: timestamp('estimated_delivery_time'),
  actualDeliveryTime: timestamp('actual_delivery_time'),
  kitchenNotes: text('kitchen_notes'),
  metadata: jsonb('metadata'),
  scheduledFor: timestamp('scheduled_for'), // for pre-booking
  addOns: jsonb('add_ons').$type<string[]>(), // for add-ons like cake pops
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  specialInstructions: text('special_instructions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Order tracking table
export const orderTracking = pgTable('order_tracking', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id).notNull(),
  status: orderStatusEnum('status').notNull(),
  message: text('message'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  orderId: uuid('order_id').references(() => orders.id),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment'),
  images: jsonb('images').$type<string[]>(),
  isVerified: boolean('is_verified').default(false),
  isApproved: boolean('is_approved').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Offers table (replaces coupons)
export const offers = pgTable('offers', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // banner, popup, notification
  discountType: text('discount_type').notNull(), // percentage, fixed_amount, free_delivery
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  minimumOrderAmount: decimal('minimum_order_amount', { precision: 10, scale: 2 }),
  maximumDiscountAmount: decimal('maximum_discount_amount', { precision: 10, scale: 2 }),
  targetAudience: text('target_audience').default('all'), // all, new_customers, loyal_customers, birthday, anniversary
  occasionType: text('occasion_type'), // birthday, anniversary, festival, regular
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0),
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(0), // for display order
  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),
  popupDelaySeconds: integer('popup_delay_seconds').default(10), // when to show popup
  showFrequencyHours: integer('show_frequency_hours').default(24), // how often to show
  clickCount: integer('click_count').default(0),
  viewCount: integer('view_count').default(0),
  conversionCount: integer('conversion_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User offer interactions
export const userOfferInteractions = pgTable('user_offer_interactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  offerId: uuid('offer_id').references(() => offers.id).notNull(),
  sessionId: text('session_id'), // for anonymous users
  interactionType: text('interaction_type').notNull(), // viewed, clicked, dismissed, converted
  orderId: uuid('order_id').references(() => orders.id), // if converted to order
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  type: text('type').notNull(), // order_update, promotion, system
  title: text('title').notNull(),
  message: text('message').notNull(),
  data: jsonb('data'),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Analytics table
export const analytics = pgTable('analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: text('event_type').notNull(), // page_view, order_placed, item_viewed, etc.
  eventData: jsonb('event_data').notNull(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: text('session_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Restaurant Settings table
export const restaurantSettings = pgTable('restaurant_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  restaurantName: text('restaurant_name').notNull(),
  restaurantDescription: text('restaurant_description'),
  restaurantPhone: text('restaurant_phone'),
  restaurantEmail: text('restaurant_email'),
  restaurantAddress: text('restaurant_address'),
  isOrderingEnabled: boolean('is_ordering_enabled').default(true).notNull(),
  minimumOrderAmount: decimal('minimum_order_amount', { precision: 10, scale: 2 }).default('15.00').notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).default('5.99').notNull(),
  preparationTime: integer('preparation_time').default(30).notNull(), // in minutes
  emailNotifications: boolean('email_notifications').default(true).notNull(),
  smsNotifications: boolean('sms_notifications').default(false).notNull(),
  pushNotifications: boolean('push_notifications').default(true).notNull(),
  maintenanceMode: boolean('maintenance_mode').default(false).notNull(),
  autoBackup: boolean('auto_backup').default(true).notNull(),
  timezone: text('timezone').default('America/New_York').notNull(),
  currency: text('currency').default('USD').notNull(),
  acceptCashOnDelivery: boolean('accept_cash_on_delivery').default(true).notNull(),
  autoAcceptOrders: boolean('auto_accept_orders').default(false).notNull(),
  loyaltyPointsRate: integer('loyalty_points_rate').default(1).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().$onUpdate(() => new Date()),
});

// Zod schemas for validation
export const insertUserSchema = z.object({
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['customer', 'admin', 'kitchen_staff']).default('customer'),
});

export const insertCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export const insertMenuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()]).transform(val => String(val)),
  image: z.string().optional(),
  categoryId: z.string().uuid(),
  isAvailable: z.boolean().default(true),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  spiceLevel: z.enum(['MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT']).default('MILD'),
  preparationTime: z.number().default(30),
  ingredients: z.array(z.string()).optional(),
  nutritionInfo: z.record(z.string(), z.any()).optional(),
  tags: z.array(z.string()).optional(),
  isPopular: z.boolean().default(false),
  sortOrder: z.number().default(0),
});

export const insertOfferSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['banner', 'popup', 'notification']),
  discountType: z.enum(['percentage', 'fixed_amount', 'free_delivery']),
  discountValue: z.string(),
  minimumOrderAmount: z.string().optional(),
  maximumDiscountAmount: z.string().optional(),
  targetAudience: z.enum(['all', 'new_customers', 'loyal_customers', 'birthday', 'anniversary']).default('all'),
  occasionType: z.enum(['birthday', 'anniversary', 'festival', 'regular']).optional(),
  usageLimit: z.number().optional(),
  priority: z.number().default(0),
  validFrom: z.date(),
  validUntil: z.date(),
  popupDelaySeconds: z.number().default(10),
  showFrequencyHours: z.number().default(24),
});

export const insertOrderSchema = z.object({
  orderNumber: z.string(),
  userId: z.string().uuid(),
  subtotal: z.string(),
  tax: z.string(),
  deliveryFee: z.string(),
  discount: z.string().default('0'),
  total: z.string(),
  deliveryAddressId: z.string().uuid().optional(),
  customerNotes: z.string().optional(),
  estimatedDeliveryTime: z.date().optional(),
  scheduledFor: z.date().optional(),
  addOns: z.array(z.string()).optional(),
});

export const insertAddressSchema = z.object({
  userId: z.string().uuid(),
  type: z.string().default('home'),
  label: z.string().optional(),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default('India'),
  landmark: z.string().optional(),
  instructions: z.string().optional(),
  isDefault: z.boolean().default(false),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

// Cart table for persistent cart storage
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  sessionId: text('session_id'), // for anonymous users
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Cart items table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'cascade' }).notNull(),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  specialInstructions: text('special_instructions'),
  addOns: jsonb('add_ons').$type<string[]>(), // for any additional options
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const insertRestaurantSettingsSchema = z.object({
  restaurantName: z.string().min(1),
  restaurantDescription: z.string().optional(),
  restaurantPhone: z.string().optional(),
  restaurantEmail: z.string().email().optional(),
  restaurantAddress: z.string().optional(),
  isOrderingEnabled: z.boolean().default(true),
  minimumOrderAmount: z.union([z.string(), z.number()]).transform(val => String(val)),
  deliveryFee: z.union([z.string(), z.number()]).transform(val => String(val)),
  preparationTime: z.number().default(30),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
  autoBackup: z.boolean().default(true),
  timezone: z.string().default('America/New_York'),
  currency: z.string().default('USD'),
  acceptCashOnDelivery: z.boolean().default(true),
  autoAcceptOrders: z.boolean().default(false),
  loyaltyPointsRate: z.number().default(1),
});

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type MenuItem = typeof menuItems.$inferSelect;
export type NewMenuItem = typeof menuItems.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type Address = typeof addresses.$inferSelect;
export type NewAddress = typeof addresses.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;

export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;

export type UserOfferInteraction = typeof userOfferInteractions.$inferSelect;
export type NewUserOfferInteraction = typeof userOfferInteractions.$inferInsert;

export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

export type RestaurantSettings = typeof restaurantSettings.$inferSelect;
export type NewRestaurantSettings = typeof restaurantSettings.$inferInsert;

export type Cart = typeof carts.$inferSelect;
export type NewCart = typeof carts.$inferInsert;

export type CartItem = typeof cartItems.$inferSelect;
export type NewCartItem = typeof cartItems.$inferInsert;

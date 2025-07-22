import { pgTable, foreignKey, uuid, text, jsonb, timestamp, unique, boolean, integer, numeric, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const orderStatus = pgEnum("order_status", ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'])
export const paymentStatus = pgEnum("payment_status", ['pending', 'completed', 'failed', 'refunded'])
export const spiceLevel = pgEnum("spice_level", ['MILD', 'MEDIUM', 'HOT', 'EXTRA_HOT'])
export const userRole = pgEnum("user_role", ['customer', 'admin', 'kitchen_staff'])


export const analytics = pgTable("analytics", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	eventType: text("event_type").notNull(),
	eventData: jsonb("event_data").notNull(),
	userId: uuid("user_id"),
	sessionId: text("session_id"),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "analytics_user_id_users_id_fk"
		}),
]);

export const categories = pgTable("categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	image: text(),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("categories_slug_unique").on(table.slug),
]);

export const addresses = pgTable("addresses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	type: text().default('home'),
	label: text(),
	addressLine1: text("address_line_1").notNull(),
	addressLine2: text("address_line_2"),
	city: text().notNull(),
	state: text().notNull(),
	postalCode: text("postal_code").notNull(),
	country: text().default('India').notNull(),
	landmark: text(),
	instructions: text(),
	isDefault: boolean("is_default").default(false),
	coordinates: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "addresses_user_id_users_id_fk"
		}),
]);

export const menuItems = pgTable("menu_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	image: text(),
	categoryId: uuid("category_id").notNull(),
	isAvailable: boolean("is_available").default(true).notNull(),
	isVegetarian: boolean("is_vegetarian").default(false),
	isVegan: boolean("is_vegan").default(false),
	isGlutenFree: boolean("is_gluten_free").default(false),
	spiceLevel: spiceLevel("spice_level").default('MILD'),
	preparationTime: integer("preparation_time").default(30),
	ingredients: jsonb(),
	nutritionInfo: jsonb("nutrition_info"),
	tags: jsonb(),
	isPopular: boolean("is_popular").default(false),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "menu_items_category_id_categories_id_fk"
		}),
]);

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderNumber: text("order_number").notNull(),
	userId: uuid("user_id").notNull(),
	status: orderStatus().default('pending').notNull(),
	subtotal: numeric({ precision: 10, scale:  2 }).notNull(),
	tax: numeric({ precision: 10, scale:  2 }).notNull(),
	deliveryFee: numeric("delivery_fee", { precision: 10, scale:  2 }).notNull(),
	discount: numeric({ precision: 10, scale:  2 }).default('0'),
	total: numeric({ precision: 10, scale:  2 }).notNull(),
	paymentStatus: paymentStatus("payment_status").default('pending').notNull(),
	paymentIntentId: text("payment_intent_id"),
	deliveryAddressId: uuid("delivery_address_id"),
	customerNotes: text("customer_notes"),
	estimatedDeliveryTime: timestamp("estimated_delivery_time", { mode: 'string' }),
	actualDeliveryTime: timestamp("actual_delivery_time", { mode: 'string' }),
	kitchenNotes: text("kitchen_notes"),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	scheduledFor: timestamp("scheduled_for", { mode: 'string' }),
	addOns: jsonb("add_ons"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.deliveryAddressId],
			foreignColumns: [addresses.id],
			name: "orders_delivery_address_id_addresses_id_fk"
		}),
	unique("orders_order_number_unique").on(table.orderNumber),
]);

export const orderTracking = pgTable("order_tracking", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	status: orderStatus().notNull(),
	message: text(),
	metadata: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_tracking_order_id_orders_id_fk"
		}),
]);

export const reviews = pgTable("reviews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	orderId: uuid("order_id"),
	menuItemId: uuid("menu_item_id"),
	rating: integer().notNull(),
	comment: text(),
	images: jsonb(),
	isVerified: boolean("is_verified").default(false),
	isApproved: boolean("is_approved").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "reviews_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "reviews_order_id_orders_id_fk"
		}),
	foreignKey({
			columns: [table.menuItemId],
			foreignColumns: [menuItems.id],
			name: "reviews_menu_item_id_menu_items_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clerkId: text("clerk_id").notNull(),
	email: text().notNull(),
	firstName: text("first_name"),
	lastName: text("last_name"),
	phone: text(),
	role: userRole().default('customer').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	loyaltyPoints: integer("loyalty_points").default(0).notNull(),
}, (table) => [
	unique("users_clerk_id_unique").on(table.clerkId),
	unique("users_email_unique").on(table.email),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	type: text().notNull(),
	title: text().notNull(),
	message: text().notNull(),
	data: jsonb(),
	isRead: boolean("is_read").default(false),
	readAt: timestamp("read_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}),
]);

export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	menuItemId: uuid("menu_item_id").notNull(),
	quantity: integer().notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	totalPrice: numeric("total_price", { precision: 10, scale:  2 }).notNull(),
	specialInstructions: text("special_instructions"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_order_id_orders_id_fk"
		}),
	foreignKey({
			columns: [table.menuItemId],
			foreignColumns: [menuItems.id],
			name: "order_items_menu_item_id_menu_items_id_fk"
		}),
]);

export const userOfferInteractions = pgTable("user_offer_interactions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	offerId: uuid("offer_id").notNull(),
	sessionId: text("session_id"),
	interactionType: text("interaction_type").notNull(),
	orderId: uuid("order_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_offer_interactions_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.offerId],
			foreignColumns: [offers.id],
			name: "user_offer_interactions_offer_id_offers_id_fk"
		}),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "user_offer_interactions_order_id_orders_id_fk"
		}),
]);

export const offers = pgTable("offers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	type: text().notNull(),
	discountType: text("discount_type").notNull(),
	discountValue: numeric("discount_value", { precision: 10, scale:  2 }).notNull(),
	minimumOrderAmount: numeric("minimum_order_amount", { precision: 10, scale:  2 }),
	maximumDiscountAmount: numeric("maximum_discount_amount", { precision: 10, scale:  2 }),
	targetAudience: text("target_audience").default('all'),
	occasionType: text("occasion_type"),
	usageLimit: integer("usage_limit"),
	usedCount: integer("used_count").default(0),
	isActive: boolean("is_active").default(true),
	priority: integer().default(0),
	validFrom: timestamp("valid_from", { mode: 'string' }).notNull(),
	validUntil: timestamp("valid_until", { mode: 'string' }).notNull(),
	popupDelaySeconds: integer("popup_delay_seconds").default(10),
	showFrequencyHours: integer("show_frequency_hours").default(24),
	clickCount: integer("click_count").default(0),
	viewCount: integer("view_count").default(0),
	conversionCount: integer("conversion_count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const restaurantSettings = pgTable("restaurant_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	restaurantName: text("restaurant_name").notNull(),
	restaurantDescription: text("restaurant_description"),
	restaurantPhone: text("restaurant_phone"),
	restaurantEmail: text("restaurant_email"),
	restaurantAddress: text("restaurant_address"),
	isOrderingEnabled: boolean("is_ordering_enabled").default(true).notNull(),
	minimumOrderAmount: numeric("minimum_order_amount", { precision: 10, scale:  2 }).default('15.00').notNull(),
	deliveryFee: numeric("delivery_fee", { precision: 10, scale:  2 }).default('5.99').notNull(),
	preparationTime: integer("preparation_time").default(30).notNull(),
	emailNotifications: boolean("email_notifications").default(true).notNull(),
	smsNotifications: boolean("sms_notifications").default(false).notNull(),
	pushNotifications: boolean("push_notifications").default(true).notNull(),
	maintenanceMode: boolean("maintenance_mode").default(false).notNull(),
	autoBackup: boolean("auto_backup").default(true).notNull(),
	timezone: text().default('America/New_York').notNull(),
	currency: text().default('USD').notNull(),
	acceptCashOnDelivery: boolean("accept_cash_on_delivery").default(true).notNull(),
	autoAcceptOrders: boolean("auto_accept_orders").default(false).notNull(),
	loyaltyPointsRate: integer("loyalty_points_rate").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const carts = pgTable("carts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	sessionId: text("session_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "carts_user_id_users_id_fk"
		}),
]);

export const cartItems = pgTable("cart_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	cartId: uuid("cart_id").notNull(),
	menuItemId: uuid("menu_item_id").notNull(),
	quantity: integer().notNull(),
	unitPrice: numeric("unit_price", { precision: 10, scale:  2 }).notNull(),
	specialInstructions: text("special_instructions"),
	addOns: jsonb("add_ons"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.cartId],
			foreignColumns: [carts.id],
			name: "cart_items_cart_id_carts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.menuItemId],
			foreignColumns: [menuItems.id],
			name: "cart_items_menu_item_id_menu_items_id_fk"
		}),
]);

export const bookings = pgTable("bookings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	name: text().notNull(),
	email: text().notNull(),
	phone: text().notNull(),
	address: text().notNull(),
	occasion: text(),
	scheduledFor: timestamp("scheduled_for", { mode: 'string' }).notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "bookings_user_id_users_id_fk"
		}),
]);

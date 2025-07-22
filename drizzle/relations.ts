import { relations } from "drizzle-orm/relations";
import { users, analytics, addresses, categories, menuItems, orders, orderTracking, reviews, notifications, orderItems, userOfferInteractions, offers, carts, cartItems, bookings } from "./schema";

export const analyticsRelations = relations(analytics, ({one}) => ({
	user: one(users, {
		fields: [analytics.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	analytics: many(analytics),
	addresses: many(addresses),
	orders: many(orders),
	reviews: many(reviews),
	notifications: many(notifications),
	userOfferInteractions: many(userOfferInteractions),
	carts: many(carts),
	bookings: many(bookings),
}));

export const addressesRelations = relations(addresses, ({one, many}) => ({
	user: one(users, {
		fields: [addresses.userId],
		references: [users.id]
	}),
	orders: many(orders),
}));

export const menuItemsRelations = relations(menuItems, ({one, many}) => ({
	category: one(categories, {
		fields: [menuItems.categoryId],
		references: [categories.id]
	}),
	reviews: many(reviews),
	orderItems: many(orderItems),
	cartItems: many(cartItems),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	menuItems: many(menuItems),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	address: one(addresses, {
		fields: [orders.deliveryAddressId],
		references: [addresses.id]
	}),
	orderTrackings: many(orderTracking),
	reviews: many(reviews),
	orderItems: many(orderItems),
	userOfferInteractions: many(userOfferInteractions),
}));

export const orderTrackingRelations = relations(orderTracking, ({one}) => ({
	order: one(orders, {
		fields: [orderTracking.orderId],
		references: [orders.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
	order: one(orders, {
		fields: [reviews.orderId],
		references: [orders.id]
	}),
	menuItem: one(menuItems, {
		fields: [reviews.menuItemId],
		references: [menuItems.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	menuItem: one(menuItems, {
		fields: [orderItems.menuItemId],
		references: [menuItems.id]
	}),
}));

export const userOfferInteractionsRelations = relations(userOfferInteractions, ({one}) => ({
	user: one(users, {
		fields: [userOfferInteractions.userId],
		references: [users.id]
	}),
	offer: one(offers, {
		fields: [userOfferInteractions.offerId],
		references: [offers.id]
	}),
	order: one(orders, {
		fields: [userOfferInteractions.orderId],
		references: [orders.id]
	}),
}));

export const offersRelations = relations(offers, ({many}) => ({
	userOfferInteractions: many(userOfferInteractions),
}));

export const cartsRelations = relations(carts, ({one, many}) => ({
	user: one(users, {
		fields: [carts.userId],
		references: [users.id]
	}),
	cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id]
	}),
	menuItem: one(menuItems, {
		fields: [cartItems.menuItemId],
		references: [menuItems.id]
	}),
}));

export const bookingsRelations = relations(bookings, ({one}) => ({
	user: one(users, {
		fields: [bookings.userId],
		references: [users.id]
	}),
}));
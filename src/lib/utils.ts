import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `₹${numAmount.toFixed(2)}`;
}

export function parsePrice(price: number | string): number {
  return typeof price === 'string' ? parseFloat(price) : price;
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 7);
  return `ORD-${timestamp}-${randomPart}`.toUpperCase();
}

export function calculateDeliveryTime(preparationTime: number = 30): Date {
  const now = new Date();
  const deliveryTime = new Date(now.getTime() + (preparationTime + 30) * 60000); // prep time + 30 min delivery
  return deliveryTime;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[+]?[1-9][\d\s\-()]{8,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function calculateTax(amount: number, taxRate: number = 0.18): number {
  return parseFloat((amount * taxRate).toFixed(2));
}

export function calculateDeliveryFee(amount: number, baseDeliveryFee: number = 50, freeDeliveryThreshold: number = 500): number {
  return amount >= freeDeliveryThreshold ? 0 : baseDeliveryFee;
}

export function calculateOrderTotal(subtotal: number, tax?: number, deliveryFee?: number, discount: number = 0): number {
  const calculatedTax = tax ?? calculateTax(subtotal);
  const calculatedDeliveryFee = deliveryFee ?? calculateDeliveryFee(subtotal);
  
  return parseFloat((subtotal + calculatedTax + calculatedDeliveryFee - discount).toFixed(2));
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export function isValidObjectId(id: string): boolean {
  // UUID validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function getImageUrl(cloudinaryPublicId: string): string {
  if (!cloudinaryPublicId) return '/images/placeholder-food.jpg';
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/${cloudinaryPublicId}`;
}

export function getOptimizedImageUrl(cloudinaryPublicId: string, width: number = 400, height: number = 400): string {
  if (!cloudinaryPublicId) return '/images/placeholder-food.jpg';
  return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width},h_${height},c_fill/${cloudinaryPublicId}`;
}

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export function handleError(error: unknown): { message: string; statusCode: number } {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      statusCode: 500,
    };
  }

  return {
    message: 'An unknown error occurred',
    statusCode: 500,
  };
}

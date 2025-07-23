"use client"

import Link from 'next/link'
import { useState } from 'react';
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/cart-context-new'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { ShoppingCart, User } from 'lucide-react'
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut
} from "@clerk/nextjs"

export function Header() {
  const { getCartItemCount } = useCart()
  const cartItemCount = getCartItemCount()

  const [showBooking, setShowBooking] = useState(false);
  return (
    <>
      {/* Top Header - Desktop and Mobile */}
      <header className="sticky top-0 z-50 bg-white dark:bg-black border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* Logo and Mobile Theme Toggle */}
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center space-x-2 group interactive">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black dark:bg-white rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white dark:text-black font-bold text-sm sm:text-lg">S</span>
                </div>
                  <span
                    className="text-lg sm:text-xl font-bold text-black dark:text-white font-agile"
                    style={{ fontFamily: "'Pacifico', cursive" }}
                  >
                    Sonna&apos;s Patisserie and Cafe
                  </span>
                  <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
                  `}</style>
              </Link>
              {/* Mobile Theme Toggle */}
                <div className="flex lg:hidden ml-auto absolute right-3 top-1/2 -translate-y-1/2">
                  <ThemeToggle />
                </div>
            </div>

            {/* Desktop Navigation - Hidden on mobile, shown on larger screens */}
            <div className="hidden lg:flex items-center space-x-8">
              <nav className="flex items-center space-x-8">
                <Link href="/" className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium relative group">
                  Home
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/menu" className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium relative group">
                  Menu
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/orders" className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium relative group">
                  Orders
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
                <Link href="/booking" className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium relative group">
                  Pre-Book
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </nav>

              <div className="flex items-center space-x-3">
                <ThemeToggle />

                <Link href="/cart">
                  <Button variant="outline" size="sm" className="relative border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black interactive">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Cart
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 px-2 py-1 text-xs btn-gradient-green text-white border-0 pulse-modern">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Clerk Authentication */}
                <SignedOut>
                  <SignInButton>
                    <Button variant="outline" size="sm" className="border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black interactive">
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </SignInButton>
                  <SignUpButton>
                    <Button className="btn-gradient-blue interactive">
                      Sign Up
                    </Button>
                  </SignUpButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Profile
                    </Button>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - Fixed at bottom, hidden on desktop */}
      <nav className="fixed bottom-0 left-0 right-0 z-[9999] lg:hidden bg-white/95 dark:bg-black/95 backdrop-blur-lg border-t border-gray-200/50 dark:border-gray-800/50 shadow-lg">
        <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
          {/* Home */}
          <Link href="/" className="flex flex-col items-center py-2 px-3 min-w-[60px] text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Home</span>
          </Link>

          {/* Menu
          <Link href="/menu" className="flex flex-col items-center py-2 px-3 min-w-[60px] text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </div>
            <span className="text-xs font-medium">Menu</span>
          </Link> */}

          {/* booking */}
          <Link href="/booking" className="flex flex-col items-center py-2 px-3 min-w-[60px] text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
            <div className="w-6 h-6 mb-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13zm0-15H5V5h14v1z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Pre-Book</span>
          </Link>

          {/* Cart */}
          <Link href="/cart" className="flex flex-col items-center py-2 px-3 min-w-[60px] text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group relative">
            <div className="w-6 h-6 mb-1 relative">
              <ShoppingCart className="w-full h-full" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs min-w-[18px] h-[18px] flex items-center justify-center btn-gradient-green text-white border-0 pulse-modern">
                  {cartItemCount}
                </Badge>
              )}
            </div>
            <span className="text-xs font-medium">Cart</span>
          </Link>

          {/* Pre-Book
          <Link href="/booking" className="flex flex-col items-center py-2 px-3 min-w-[60px] text-pink-600 hover:text-pink-800 transition-colors group">
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H5V8h14v13zm0-15H5V5h14v1z" />
              </svg>
            </div>
            <span className="text-xs font-medium">Pre-Book</span>
          </Link> */}


          {/* Profile/Auth */}
          <SignedOut>
            <SignInButton>
              <div className="flex flex-col items-center py-2 px-3 min-w-[60px] text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group cursor-pointer">
                <div className="w-6 h-6 mb-1">
                  <User className="w-full h-full" />
                </div>
                <span className="text-xs font-medium">Sign In</span>
              </div>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/profile" className="flex flex-col items-center py-2 px-3 min-w-[60px] text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors group">
              <div className="w-6 h-6 mb-1">
                <User className="w-full h-full" />
              </div>
              <span className="text-xs font-medium">Profile</span>
            </Link>
          </SignedIn>

          {/* Theme */}
          {/* <div className="flex flex-col items-center py-2 px-3 min-w-[60px]">
            <div className="w-6 h-6 mb-1 flex items-center justify-center">
              <ThemeToggle />
            </div>
            <span className="text-xs font-medium text-black dark:text-white">Theme</span>
          </div> */}
        </div>
      </nav>
      {showBooking && (
        {/* BookingModal removed, now using /booking page */ }
      )}
    </>
  )
}

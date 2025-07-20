'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Check if current route is admin
  const isAdminRoute = pathname.startsWith('/admin')
  
  if (isAdminRoute) {
    // Admin layout without header and footer
    return (
      <div className="min-h-screen">
        <main className="w-full">
          {children}
        </main>
      </div>
    )
  }
  
  // Regular layout with header and footer
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  )
}

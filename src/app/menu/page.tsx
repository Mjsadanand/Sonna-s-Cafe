'use client'

import { Suspense } from 'react'
import MenuClient from './MenuClient'

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-lg text-gray-600 dark:text-gray-300">Loading menu...</div>}>
      <MenuClient />
    </Suspense>
  )
}

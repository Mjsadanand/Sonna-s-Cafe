'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminLogin from '@/components/admin/AdminLogin'

export default function AdminLoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('admin-token')
    if (adminToken) {
      router.push('/admin')
    }
  }, [router])

  const handleLogin = () => {
    router.push('/admin')
  }

  return <AdminLogin onLogin={handleLogin} />
}

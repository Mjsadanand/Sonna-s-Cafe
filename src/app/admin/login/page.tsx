import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Shield } from 'lucide-react'

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>
              Access the hotel management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@foodiehub.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/admin/forgot-password" className="text-sm text-green-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                <Shield className="w-4 h-4 mr-2" />
                Login to Dashboard
              </Button>
            </form>

            <div className="text-center pt-4 border-t">
              <Link href="/" className="text-sm text-gray-500 hover:underline">
                ← Back to Customer Site
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Demo Mode:</strong> Admin authentication will be integrated later. This is a preview of the admin interface.
          </p>
        </div>

        {/* Demo Access */}
        <div className="mt-4">
          <Link href="/admin">
            <Button variant="outline" className="w-full">
              Preview Admin Dashboard (Demo)
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

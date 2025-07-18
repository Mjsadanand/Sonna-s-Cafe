import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-md w-full">
        <Card className="shadow-lg border-0 sm:border sm:shadow-xl">
          <CardHeader className="text-center px-4 sm:px-6 pt-6 sm:pt-8">
            <CardTitle className="text-xl sm:text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-sm sm:text-base mt-2">
              Sign in to your account to continue ordering
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
            <form className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="h-11 sm:h-12 text-base"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                  className="h-11 sm:h-12 text-base"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2 w-4 h-4" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-green-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-11 sm:h-12 text-base font-medium">
                Sign In
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/sign-up" className="text-green-600 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>

            <div className="text-center">
              <Link href="/" className="text-sm text-gray-500 hover:underline">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Notice */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg mx-1 sm:mx-0">
          <p className="text-xs sm:text-sm text-yellow-800">
            <strong>Demo Mode:</strong> This is a demo application. Authentication will be integrated later.
          </p>
        </div>
      </div>
    </div>
  )
}

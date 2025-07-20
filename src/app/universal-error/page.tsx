'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCcw, Home, ArrowLeft } from 'lucide-react'
import { Suspense } from 'react'

function ErrorContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('code') || '500'
  const errorMessage = searchParams.get('message') || 'An unexpected error occurred'

  const getErrorDetails = (code: string) => {
    switch (code) {
      case '400':
        return {
          title: 'Bad Request',
          description: 'The request could not be understood by the server.',
          icon: AlertTriangle,
          color: 'from-orange-500 to-orange-600'
        }
      case '401':
        return {
          title: 'Unauthorized',
          description: 'You need to be logged in to access this page.',
          icon: AlertTriangle,
          color: 'from-yellow-500 to-yellow-600'
        }
      case '403':
        return {
          title: 'Access Forbidden',
          description: 'You do not have permission to access this resource.',
          icon: AlertTriangle,
          color: 'from-red-500 to-red-600'
        }
      case '404':
        return {
          title: 'Page Not Found',
          description: 'The page you are looking for does not exist.',
          icon: AlertTriangle,
          color: 'from-blue-500 to-blue-600'
        }
      case '500':
      default:
        return {
          title: 'Server Error',
          description: 'Something went wrong on our end. Please try again later.',
          icon: AlertTriangle,
          color: 'from-red-500 to-red-600'
        }
    }
  }

  const errorDetails = getErrorDetails(errorCode)
  const ErrorIcon = errorDetails.icon

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon & Title */}
        <div className="mb-8">
          <div className={`w-24 h-24 mx-auto bg-gradient-to-br ${errorDetails.color} rounded-full flex items-center justify-center shadow-2xl mb-6`}>
            <ErrorIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {errorDetails.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
            {errorDetails.description}
          </p>
          {errorMessage !== 'An unexpected error occurred' && (
            <p className="text-sm text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg inline-block">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Error Details Card */}
        <Card className="mb-8 border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Error Code: {errorCode}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-gray-600 dark:text-gray-400">
              <p>If this error persists, please try the following:</p>
              <ul className="text-left mt-2 space-y-1 list-disc list-inside">
                <li>Refresh the page</li>
                <li>Clear your browser cache</li>
                <li>Check your internet connection</li>
                <li>Contact support if the issue continues</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button onClick={handleRefresh} className="flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                Refresh Page
              </Button>
              
              <Link href="/">
                <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
              </Link>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Need help? Contact our support team
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/help">
              <Button variant="outline" size="sm">
                Help Center
              </Button>
            </Link>
            <Link href="mailto:support@foodieapp.com">
              <Button variant="outline" size="sm">
                Email Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UniversalErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle, RefreshCcw, Phone, Mail, AlertTriangle, ArrowLeft } from 'lucide-react'

export default function ErrorPage() {
  return (
    <div className="min-h-screen modern-bg floating-shapes">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          {/* Error Icon & Title */}
          <div className="text-center mb-12 fade-in">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl pulse-modern">
                <XCircle className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-black dark:text-white mb-4 text-balance">
              Order Failed
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 text-balance max-w-2xl mx-auto">
              We&apos;re sorry, but there was an issue processing your order. Don&apos;t worry - we&apos;re here to help.
            </p>
          </div>

          {/* Error Details Card */}
          <Card className="glass-card mb-8 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-black dark:text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-white" />
                </div>
                What Happened?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-lg">
                Your order could not be completed due to one of the following reasons:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Payment processing failed</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Items no longer available</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Delivery address issue</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Technical difficulties</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solutions Card */}
          <Card className="glass-card mb-8 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-black dark:text-white">What You Can Do</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center group hover-lift">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <RefreshCcw className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-black dark:text-white mb-2">Try Again</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-balance">
                    Go back to your cart and attempt to place the order again.
                  </p>
                </div>
                
                <div className="text-center group hover-lift">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-black dark:text-white mb-2">Call Us</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-balance">
                    Our support team can help you complete your order over the phone.
                  </p>
                </div>

                <div className="text-center group hover-lift">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-bold text-lg text-black dark:text-white mb-2">Email Support</h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm text-balance">
                    Send us an email and we&apos;ll help resolve the issue quickly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/cart">
              <Button className="btn-gradient-green min-w-[200px] interactive">
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Link>
            <a href="tel:+15551234567">
              <Button className="btn-gradient-blue min-w-[200px] interactive">
                <Phone className="w-4 h-4 mr-2" />
                Call Support
              </Button>
            </a>
            <Link href="/menu">
              <Button variant="outline" className="min-w-[200px] border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black interactive">
                Browse Menu
              </Button>
            </Link>
          </div>

          {/* Support Information */}
          <Card className="glass-card border-0 shadow-xl mb-8">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl text-black dark:text-white mb-6 text-center">Need Immediate Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover-lift">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-black dark:text-white block">Phone Support</span>
                    <a href="tel:+15551234567" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
                      (555) 123-4567
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl hover-lift">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-black dark:text-white block">Email Support</span>
                    <a href="mailto:support@foodiehub.com" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                      support@foodiehub.com
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Support Hours:</span> Monday - Sunday, 9:00 AM - 11:00 PM
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/">
              <Button variant="link" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white interactive">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

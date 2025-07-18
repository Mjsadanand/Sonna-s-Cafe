"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock,
  ArrowLeft,
  Search,
  ChevronRight,
  HelpCircle,
  Star,
  MapPin,
  CreditCard,
  Package,
  AlertCircle
} from 'lucide-react'

export default function HelpPage() {
  const faqCategories = [
    {
      title: "Orders & Delivery",
      icon: Package,
      faqs: [
        {
          question: "How can I track my order?",
          answer: "You can track your order in real-time by going to the 'My Orders' section in your account or clicking the tracking link sent to your email."
        },
        {
          question: "What are the delivery hours?",
          answer: "Our delivery hours are from 9:00 AM to 11:00 PM, 7 days a week. Our hotel kitchen operates during these hours."
        },
        {
          question: "Can I modify my order after placing it?",
          answer: "Orders can be modified within 5 minutes of placing them. After that, please contact our support team for assistance."
        },
        {
          question: "What if my order is late?",
          answer: "If your order is significantly delayed, you'll receive automatic updates. You can also contact support for immediate assistance."
        }
      ]
    },
    {
      title: "Payments & Pricing",
      icon: CreditCard,
      faqs: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, PayPal, Apple Pay, and Google Pay."
        },
        {
          question: "How is the delivery fee calculated?",
          answer: "Delivery fees are calculated based on distance and time of day. You'll see the exact fee before confirming your order."
        },
        {
          question: "Can I get a refund for my order?",
          answer: "Refunds are processed for cancelled orders or quality issues. Contact support within 24 hours for refund requests."
        }
      ]
    },
    {
      title: "Account & Profile",
      icon: HelpCircle,
      faqs: [
        {
          question: "How do I reset my password?",
          answer: "Click 'Forgot Password' on the login page and follow the instructions sent to your email."
        },
        {
          question: "How can I update my delivery address?",
          answer: "Go to your Profile settings and update your addresses in the 'Manage Addresses' section."
        },
        {
          question: "How do I delete my account?",
          answer: "Contact our support team to request account deletion. Please note this action is irreversible."
        }
      ]
    },
    {
      title: "Menu & Dining",
      icon: MapPin,
      faqs: [
        {
          question: "Why isn't a specific dish available?",
          answer: "Restaurant availability depends on their operating hours, delivery capacity, and technical issues. Try again later or contact the restaurant directly."
        },
        {
          question: "How do I leave a review?",
          answer: "After your order is delivered, you'll receive an email with a review link. You can also leave reviews in the 'My Orders' section."
        },
        {
          question: "Can I request a restaurant to join the platform?",
          answer: "Yes! Use our restaurant suggestion form or ask the restaurant to apply through our partner portal."
        }
      ]
    }
  ]

  const contactMethods = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      action: "Start Chat",
      available: "24/7",
      color: "bg-green-50 text-green-700 border-green-200"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our support team",
      icon: Phone,
      action: "Call (555) 123-4567",
      available: "9 AM - 11 PM",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      title: "Email Support",
      description: "Send us detailed questions or feedback",
      icon: Mail,
      action: "Send Email",
      available: "24-48h response",
      color: "bg-purple-50 text-purple-700 border-purple-200"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help & Support</h1>
              <p className="text-gray-600">Find answers and get help when you need it</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-green-800 mb-2">How can we help you?</h2>
                <p className="text-green-700">Search our help articles or browse categories below</p>
              </div>
              <div className="relative max-w-lg mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search for help articles..."
                  className="pl-10 bg-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Contact Methods */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Support</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactMethods.map((method, index) => {
              const IconComponent = method.icon
              return (
                <Card key={index} className={`${method.color} border-2 hover:shadow-md transition-shadow cursor-pointer`}>
                  <CardHeader className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{method.title}</CardTitle>
                    <CardDescription className="text-current opacity-80">
                      {method.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center space-x-1 text-sm opacity-80 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>{method.available}</span>
                    </div>
                    <Button variant="secondary" className="w-full bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                      {method.action}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => {
              const IconComponent = category.icon
              return (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-green-600" />
                      </div>
                      <CardTitle className="text-xl">{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.faqs.map((faq, faqIndex) => (
                        <div key={faqIndex}>
                          <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer list-none hover:text-green-600 transition-colors">
                              <h4 className="font-medium text-gray-900 group-hover:text-green-600">
                                {faq.question}
                              </h4>
                              <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                            </summary>
                            <div className="mt-3 text-gray-600 text-sm leading-relaxed">
                              {faq.answer}
                            </div>
                          </details>
                          {faqIndex < category.faqs.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Emergency Issues */}
        <Card className="border-red-200 bg-red-50 mb-12">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <div>
                <CardTitle className="text-red-800">Emergency Issues</CardTitle>
                <CardDescription className="text-red-700">
                  For urgent matters that need immediate attention
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium text-red-800">Food Safety Concerns</h4>
                <p className="text-sm text-red-700">Report food quality or safety issues immediately</p>
                <Button size="sm" variant="destructive">
                  Report Issue
                </Button>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-red-800">Delivery Emergency</h4>
                <p className="text-sm text-red-700">Call our emergency line for delivery-related urgent issues</p>
                <Button size="sm" variant="destructive">
                  Emergency Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Section */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Didn&apos;t find what you were looking for?</CardTitle>
            <CardDescription>
              We&apos;re constantly improving our help section. Let us know what we can do better.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex justify-center space-x-2">
              <Button variant="outline">
                <Star className="w-4 h-4 mr-2" />
                Rate this page
              </Button>
              <Button variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Feedback
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              Or email us at{' '}
              <a href="mailto:support@foodhaven.com" className="text-green-600 hover:underline">
                support@foodhaven.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

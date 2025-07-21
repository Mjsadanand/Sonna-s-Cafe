"use client"

declare global {
  interface Window {
    Clerk?: {
      user?: unknown
    }
  }
}

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Footer } from '@/components/layout/footer'
import { Search, MapPin, Clock, Star, ArrowRight, ChefHat, Truck, Shield, Users, Heart, Sparkles, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

export default function Home() {
  const router = useRouter()
  const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/menu')
    }
  }

  // Popular food categories
  const foodCategories = [
    { id: 'pizza', name: 'Pizza', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/1200px-Pizza-3007395.jpg?w=200&h=200&fit=crop' },
    { id: 'burgers', name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
    { id: 'biryani', name: 'Biryani', image: 'https://melam.com/wp-content/uploads/2022/12/ambur-biriyani.jpg?w=200&h=200&fit=crop' },
    { id: 'chinese', name: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop' },
    { id: 'desserts', name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=200&h=200&fit=crop' },
    { id: 'beverages', name: 'Drinks', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&h=200&fit=crop' },
  ]

  // Featured restaurants/sections
  const featuredItems = [
    {
      id: 1,
      name: "Sonna's Special Cakes",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      rating: 4.8,
      time: "25-30 mins",
      discount: "60% OFF",
      cuisine: "Bakery • Desserts",
      priceRange: "₹200 for two"
    },
    {
      id: 2,
      name: "South Indian Delights",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      rating: 4.6,
      time: "20-25 mins",
      discount: "50% OFF",
      cuisine: "South Indian • Healthy",
      priceRange: "₹150 for two"
    },
    {
      id: 3,
      name: "Continental Cuisine",
      image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
      rating: 4.7,
      time: "30-35 mins",
      discount: "40% OFF",
      cuisine: "Continental • Italian",
      priceRange: "₹300 for two"
    }
  ]

  const features = [
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Fast Delivery",
      description: "30 minutes or free",
      color: "bg-blue-500"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Safe & Hygienic",
      description: "100% safe delivery",
      color: "bg-green-500"
    },
    {
      icon: <ChefHat className="w-6 h-6" />,
      title: "Quality Food",
      description: "Fresh & delicious",
      color: "bg-orange-500"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "10K+ Orders",
      description: "Happy customers",
      color: "bg-purple-500"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Enhanced Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-green-700 dark:from-green-700 dark:via-green-800 dark:to-green-900 text-white">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 -left-8 w-32 h-32 bg-white/5 rounded-full animate-bounce"></div>
        <div className="absolute bottom-4 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-12 md:py-16">
          {/* Location Bar with Animation */}
          <div className="flex items-center gap-2 mb-8 animate-fade-in">
            <div className="p-1 bg-white/20 rounded-full">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Delivering to: <strong className="text-green-200">Hubli, Karnataka</strong></span>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            {/* Enhanced Hero Title */}
            <div className="mb-6">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 animate-slide-up">
                Welcome to{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-green-200 to-green-400 bg-clip-text text-transparent">
                    Sonna&apos;s Café
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-green-300 to-green-500 rounded-full"></div>
                </span>
              </h1>
              <p className="text-lg md:text-xl text-orange-100 mb-8 animate-fade-in-delay max-w-2xl mx-auto">
                Discover exquisite flavors delivered fresh to your doorstep. Experience the finest culinary journey in Hubli.
              </p>
            </div>

            {/* Enhanced Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8 animate-slide-up-delay">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-2 flex items-center shadow-xl">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search for restaurant, cuisine or a dish..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-4 text-gray-800 dark:text-gray-200 bg-transparent border-0 focus:ring-0 text-lg placeholder:text-gray-500"
                    />
                  </div>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8 py-4 rounded-xl border-0 font-semibold text-white shadow-lg transform transition-all duration-200 hover:scale-105"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </form>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in-delay-2">
              <Link href="/menu">
                <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-full font-medium transform transition-all duration-200 hover:scale-105 hover:shadow-lg">
                  <ChefHat className="w-4 h-4 mr-2" />
                  View Menu
                </Button>
              </Link>
                <Button
                variant="outline"
                className="bg-transparent text-white border-white/50 hover:bg-white hover:text-green-600 px-6 py-3 rounded-full font-medium transform transition-all duration-200 hover:scale-105"
                onClick={() => {
                  // Check Clerk user
                  if (window.Clerk?.user) {
                  router.push('/profile')
                  } else {
                  router.push('/auth/sign-up')
                  }
                }}
                >
                Join Now
                </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Food Categories */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">
              What&apos;s on your mind?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Explore our delicious categories
            </p>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {foodCategories.map((category, index) => (
              <Link key={category.id} href={`/menu?category=${category.id}`}>
                <div className="flex-shrink-0 cursor-pointer group text-center transform transition-all duration-300 hover:scale-105">
                  <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 shadow-lg group-hover:shadow-xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-green-700/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {category.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Restaurants */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                Featured Restaurants
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Top-rated restaurants in your area
              </p>
            </div>
            <Link href="/menu">
              <Button variant="outline" className="hidden md:flex text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 group">
                See all 
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((item, index) => (
              <Link key={item.id} href="/menu">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 group cursor-pointer">
                  <div className="relative">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={400}
                        height={240}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                      {item.discount}
                    </Badge>
                    <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-1 flex items-center gap-1 backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{item.time}</span>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-3">
                      <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                        {item.name}
                      </h3>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-green-600 dark:text-green-400 fill-current" />
                          <span className="text-sm font-semibold text-green-700 dark:text-green-300">{item.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.cuisine}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.priceRange}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link href="/menu">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full">
                View All Restaurants
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">
              Why choose us?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
              We&apos;re committed to providing the best food delivery experience with quality, speed, and care.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className={`w-20 h-20 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:rotate-3`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-3 text-gray-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-500 via-green-600 to-green-700 dark:from-green-700 dark:via-green-800 dark:to-green-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 animate-pulse">
              <TrendingUp className="w-16 h-16 mx-auto mb-6 text-green-200" />
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Ready to order?
            </h2>
            
            <p className="text-xl md:text-2xl mb-10 text-green-100 max-w-2xl mx-auto leading-relaxed">
              Join thousands of food lovers and experience premium delivery today. Fresh food, fast delivery, unforgettable taste.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/menu">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 px-10 py-4 text-lg rounded-full font-semibold shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl min-w-[200px]">
                  Order Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-10 py-4 text-lg rounded-full font-semibold transform transition-all duration-300 hover:scale-105 min-w-[200px]">
                  Sign Up Free
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">4.9★</div>
                <div className="text-sm text-green-200">Customer Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-sm text-green-200">Happy Orders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">30min</div>
                <div className="text-sm text-green-200">Average Delivery</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

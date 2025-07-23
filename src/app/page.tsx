/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

declare global {
  interface Window {
    Clerk?: {
      user?: unknown
    }
  }
}

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Footer } from '@/components/layout/footer'
import { Search, MapPin, Clock, Star, ArrowRight, ChefHat, Truck, Shield, Users, Heart, TrendingUp, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
// import { useTheme } from 'next-themes'

export default function Home() {
  const router = useRouter()
  // const { theme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [isInstagramLoading, setIsInstagramLoading] = useState(true)
  // Dynamic tempting text for search with typing effect
  const phrases = useMemo(() => [
    "Are you hungry?",
    "Is your birthday today?!!✮⋆˙",
    "Looking for something sweet?𖹭",
    "Search for the food..🔍︎"
  ], []);
  const [typedText, setTypedText] = useState("");
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!isDeleting && charIdx < phrases[phraseIdx].length) {
      timeout = setTimeout(() => {
        setTypedText(phrases[phraseIdx].slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
      }, 80);
    } else if (!isDeleting && charIdx === phrases[phraseIdx].length) {
      timeout = setTimeout(() => setIsDeleting(true), 1200);
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setTypedText(phrases[phraseIdx].slice(0, charIdx - 1));
        setCharIdx(charIdx - 1);
      }, 40);
    } else if (isDeleting && charIdx === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setPhraseIdx((phraseIdx + 1) % phrases.length);
      }, 400);
    }
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [charIdx, isDeleting, phraseIdx]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Simulate Instagram posts loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInstagramLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError('')

    if (searchQuery.trim().length < 2) {
      setSearchError('Please enter at least 2 characters')
      return
    }

    if (searchQuery.trim()) {
      router.push(`/menu?search=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push('/menu')
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    // Add click analytics or tracking here
    router.push(`/menu?category=${categoryId}`)
  }

  // Popular food categories
  const foodCategories = [
    { id: 'pizza', name: 'Pizza', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/1200px-Pizza-3007395.jpg?w=200&h=200&fit=crop' },
    // { id: 'burgers', name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
    { id: 'cakes', name: 'Cakes', image: 'https://www.kekizcakes.com/wp-content/uploads/2024/08/black-forest-cake-half-kg_1.webp?w=200&h=200&fit=crop' },
    // { id: 'chinese', name: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop' },
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
      name: "Birthday Delights",
      image: "https://polanddaily24.com/wp-content/uploads/2024/06/alexandra-khudyntseva-u95-mqfuaqg-unsplash-e1719348481711.jpg?w=400&h=300&fit=crop",
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

  // const features = [
  //   {
  //     icon: <Truck className="w-6 h-6" />,
  //     title: "Fast Delivery",
  //     description: "30 minutes or free",
  //     color: "bg-blue-500"
  //   },
  //   {
  //     icon: <Shield className="w-6 h-6" />,
  //     title: "Safe & Hygienic",
  //     description: "100% safe delivery",
  //     color: "bg-green-500"
  //   },
  //   {
  //     icon: <ChefHat className="w-6 h-6" />,
  //     title: "Quality Food",
  //     description: "Fresh & delicious",
  //     color: "bg-orange-500"
  //   },
  //   {
  //     icon: <Users className="w-6 h-6" />,
  //     title: "10K+ Orders",
  //     description: "Happy customers",
  //     color: "bg-purple-500"
  //   }
  // ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-amber-950 dark:to-orange-950 transition-colors duration-300 pb-0">
      {/* Enhanced Header Section with Better Mobile Colors */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 dark:from-amber-900 dark:via-orange-900 dark:to-red-900 text-amber-900 dark:text-amber-100">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 -left-8 w-32 h-32 bg-white/5 rounded-full animate-bounce"></div>
          <div className="absolute bottom-4 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-8 md:py-12 lg:py-16">
          

          <div className="max-w-4xl mx-auto text-center">
            {/* Tempting dynamic text above search bar */}
            <div className="mb-4 text-xl font-bold text-orange-700 dark:text-orange-300 animate-fade-in min-h-[2.5rem]">
              {typedText}
              <span className="inline-block w-2 h-6 bg-orange-700 dark:bg-orange-300 align-middle animate-blink ml-1"></span>
            </div>
            {/* Mobile-Optimized Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-6 md:mb-8 animate-slide-up-delay px-2">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-1.5 md:p-2 flex flex-col sm:flex-row items-stretch sm:items-center shadow-xl gap-2 sm:gap-0">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4 md:w-5 md:h-5" />
                    <Input
                      type="text"
                      placeholder="Search for Cakes, food or a dish..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        if (searchError) setSearchError('')
                      }}
                      className={`pl-10 md:pl-12 pr-4 py-3 md:py-4 text-gray-800 dark:text-gray-200 bg-transparent border-0 focus:ring-0 text-base md:text-lg placeholder:text-gray-500 placeholder:text-sm md:placeholder:text-base ${searchError ? 'border-red-300 focus:border-red-500' : ''
                        }`}
                      aria-label="Search for food items"
                      aria-describedby={searchError ? "search-error" : undefined}
                    />
                  </div>
                    <Button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 p-0 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg md:static md:translate-y-0 md:h-auto md:w-auto md:px-6 md:py-3 md:rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 text-sm md:text-base"
                    aria-label="Search"
                    >
                    <Search className="w-5 h-5 md:hidden" />
                    <span className="hidden md:inline">Search</span>
                    </Button>
                </div>
              </div>
              {searchError && (
                <div id="search-error" className="mt-2 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {searchError}
                </div>
              )}
            </form>

            {/* Mobile-Optimized Quick Action Buttons */}
            <div className="flex flex-row flex-wrap gap-3 md:gap-4 justify-center items-center animate-fade-in-delay-2 px-2">
              <Link href="/menu" className="flex-1 min-w-[140px] max-w-xs">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-amber-900 dark:text-amber-100 border border-white/30 px-6 py-3 rounded-full font-medium transform transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center">
                <ChefHat className="w-4 h-4 mr-2" />
                View Menu
              </Button>
              </Link>
              <div className="flex-1 min-w-[140px] max-w-xs">
              <Button
                variant="outline"
                className="w-full bg-transparent text-amber-900 dark:text-amber-100 border-amber-700 dark:border-amber-300 hover:bg-white hover:text-orange-600 px-6 py-3 rounded-full font-medium transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent flex items-center justify-center"
                onClick={() => {
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
        </div>
      </section>
      {/* Enhanced Food Categories with Mobile Optimization */}
      <section className="py-8 md:py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6 md:mb-12">
        <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 text-gray-800 dark:text-white">
          What would you like to order today?
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-lg">
          Explore our delicious categories
        </p>
          </div>
          {/* Responsive grid: 2 columns on mobile, row on md+ */}
          <div className="grid grid-cols-2 md:flex md:gap-6 gap-3 pb-4 md:pb-6 justify-start md:justify-center">
        {foodCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className="flex flex-col items-center cursor-pointer group text-center transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 rounded-lg p-1 md:p-2"
            aria-label={`Browse ${category.name} items`}
            tabIndex={0}
            onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleCategoryClick(category.id)
          }
            }}
          >
            <div className="relative w-16 h-16 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden mb-2 md:mb-4 shadow-lg group-hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-700/20 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
          <Image
            src={category.image}
            alt={`${category.name} category`}
            width={128}
            height={128}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />
            </div>
            <p className="text-xs md:text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {category.name}
            </p>
          </button>
        ))}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Restaurants
      <section className="py-16 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
                Featured Items
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Top-rated items in Sonna&apos;s Café
              </p>
            </div>
            <Link href="/menu">
              <Button variant="outline" className="hidden md:flex text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 group focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                See all
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((item, index) => (
              <Link key={item.id} href="/menu">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 group cursor-pointer focus-within:ring-2 focus-within:ring-green-400 focus-within:ring-offset-2">
                  <div className="relative">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={`${item.name} - ${item.cuisine}`}
                        width={400}
                        height={240}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
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
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                View All Items
              </Button>
            </Link>
          </div>
        </div>
      </section> */}


      {/* Enhanced CTA Section with Mobile Optimization */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-amber-100 via-orange-100 to-red-100 dark:from-amber-900 dark:via-orange-900 dark:to-red-900 text-amber-900 dark:text-amber-100 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 md:mb-8 animate-pulse">
              <TrendingUp className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-6 text-orange-600 dark:text-orange-400" />
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
              Ready to order?
            </h2>

            <p className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-10 text-amber-800 dark:text-amber-200 max-w-2xl mx-auto leading-relaxed px-2">
              Join thousands of food lovers and experience premium delivery today. Fresh food, fast delivery, unforgettable taste.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center px-2">
              <Link href="/menu">
                <Button size="lg" className="w-full sm:w-auto bg-white text-orange-600 hover:bg-orange-50 px-8 md:px-10 py-3 md:py-4 text-base md:text-lg rounded-full font-semibold shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl min-w-[200px] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent">
                  Order Now
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Button>
              </Link>
                <Button
                size="lg"
                variant="outline"
                className="hidden sm:flex w-full sm:w-auto border-2 border-amber-700 dark:border-amber-300 text-amber-800 dark:text-amber-200 hover:bg-white hover:text-orange-600 px-8 md:px-10 py-3 md:py-4 text-base md:text-lg rounded-full font-semibold transform transition-all duration-300 hover:scale-105 min-w-[200px] items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent"
                disabled={isLoading}
                onClick={async () => {
                  setIsLoading(true)
                  try {
                  if (window.Clerk?.user) {
                    router.push('/profile')
                  } else {
                    router.push('/auth/sign-up')
                  }
                  } finally {
                  setIsLoading(false)
                  }
                }}
                >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4 md:h-5 md:w-5 text-orange-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                ) : null}
                Sign Up Free
                </Button>
            </div>

            {/* Trust Indicators
            <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-2">4.9★</div>
                <div className="text-xs md:text-sm text-amber-700 dark:text-amber-300">Customer Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-2">10K+</div>
                <div className="text-xs md:text-sm text-amber-700 dark:text-amber-300">Happy Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold mb-2">30min</div>
                <div className="text-xs md:text-sm text-amber-700 dark:text-amber-300">Average Delivery</div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
"use client"

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/layout/footer'
import { Testimonials } from '@/components/ui/testimonials'
import { ChefHat, Clock, Star, Shield, Heart, ArrowRight, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  const features = [
    {
      icon: <ChefHat className="w-6 h-6" />,
      title: "Premium Quality",
      description: "Finest ingredients sourced from trusted suppliers worldwide",
      color: "blue"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Express delivery in 15-30 minutes guaranteed",
      color: "purple"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "5-Star Rated",
      description: "Rated #1 by 50,000+ satisfied customers",
      color: "orange"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Secure",
      description: "Bank-level security with contactless delivery",
      color: "green"
    }
  ]

  const popularItems = [
    {
      name: "Artisan Pizza",
      image: "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "₹499",
      rating: 4.9,
      category: "Italian",
      time: "25-30 min"
    },
    {
      name: "Gourmet Burger",
      image: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=400", 
      price: "₹349",
      rating: 4.8,
      category: "American",
      time: "15-20 min"
    },
    {
      name: "Fresh Sushi",
      image: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=400",
      price: "₹699", 
      rating: 4.7,
      category: "Japanese",
      time: "20-25 min"
    }
  ]

  return (
    <>
      {/* Global Fixed Video Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          poster="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        >
          <source src="https://videos.pexels.com/video-files/3031969/3031969-hd_1920_1080_24fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/1111421/1111421-hd_1920_1080_30fps.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/3031969/3031969-hd_1920_1080_24fps.webm" type="video/webm" />
        </video>
        {/* Subtle overlay for better readability */}
        <div className="absolute inset-0 bg-white/30 dark:bg-black/40"></div>
      </div>

      <div className="min-h-screen relative z-10">
      {/* Hero Section */}
      <section className="relative py-16 px-3 sm:py-20 md:py-24 lg:py-32 overflow-hidden">

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-6 sm:mb-8 hover-lift">
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Trending #Sonna&apos;s Patisserie and Cafe </span>
            </div>
            
            {/* Main Heading - Mobile First */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 text-balance leading-tight">
              <span className="text-black dark:text-white">Food Delivery</span>
              <br />
              <span className="text-black dark:text-white">Made</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Simple</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-black dark:text-white mb-8 sm:mb-10 md:mb-12 max-w-2xl lg:max-w-3xl mx-auto text-balance leading-relaxed px-4 sm:px-0 tracking-tight">
              <span className="font-bold">Experience the future of food delivery</span> with our premium hotel dining and <span className="font-bold">lightning-fast service</span>.
            </p>
            
            {/* CTA Buttons - Mobile First Stack */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-14 md:mb-16 px-4 sm:px-0">
              <Link href="/menu" className="w-full sm:w-auto">
                <Button size="lg" className="btn-gradient-blue px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full w-full sm:min-w-[200px] interactive">
                  Order Now
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/menu" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full w-full sm:min-w-[200px] border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black interactive">
                  Browse Menu
                </Button>
              </Link>
            </div>

            {/* Stats - Mobile First Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-2xl sm:max-w-4xl mx-auto px-4 sm:px-0">
              <div className="text-center p-4 sm:p-0">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">50K+</div>
              <div className="text-sm sm:text-base font-semibold text-black dark:text-white">Happy Customers</div>
              </div>
              <div className="text-center p-4 sm:p-0">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">500+</div>
              <div className="text-sm sm:text-base font-semibold text-black dark:text-white">Quality Dishes</div>
              </div>
              <div className="text-center p-4 sm:p-0">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-black dark:text-white mb-2">24/7</div>
              <div className="text-sm sm:text-base font-semibold text-black dark:text-white">Service Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-3 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-4 sm:mb-6 text-balance px-4 sm:px-0">
              Why Choose Our Platform
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-xl sm:max-w-2xl mx-auto text-balance px-4 sm:px-0">
              <span className="text-gray-800 dark:text-gray-200" style={{ fontFamily: "'Montserrat', 'Poppins', 'Segoe UI', 'Arial', sans-serif" }}>
                We have revolutionized food delivery with cutting-edge technology and premium service standards.
              </span>
            </p>
          </div>
          
          {/* Mobile: Horizontal Scroll */}
          <div className="block lg:hidden overflow-hidden pb-4 px-4">
            <motion.div 
              className="flex gap-4 w-max"
              animate={{
                translateX: "-50%",
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop",
              }}
            >
              {/* Duplicate features array for seamless loop */}
              {[...features, ...features].map((feature, index) => (
                <Card key={index} className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-2xl shadow-lg text-center group interactive w-64 h-48 flex-shrink-0">
                  <CardHeader className="pb-2">
                    <div className="flex justify-center mb-3">
                      <div className={`
                        p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300
                        ${feature.color === 'blue' ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' : ''}
                        ${feature.color === 'purple' ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white' : ''}
                        ${feature.color === 'orange' ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' : ''}
                        ${feature.color === 'green' ? 'bg-gradient-to-br from-green-600 to-green-700 text-white' : ''}
                      `}>
                        <div className="w-5 h-5">{feature.icon}</div>
                      </div>
                    </div>
                    <CardTitle className="text-lg font-bold text-black dark:text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4">
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden lg:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-4 sm:px-0">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-2xl shadow-lg text-center group interactive p-4 sm:p-6">
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex justify-center mb-4 sm:mb-6">
                    <div className={`
                      p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300
                      ${feature.color === 'blue' ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' : ''}
                      ${feature.color === 'purple' ? 'bg-gradient-to-br from-purple-600 to-purple-700 text-white' : ''}
                      ${feature.color === 'orange' ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' : ''}
                      ${feature.color === 'green' ? 'bg-gradient-to-br from-green-600 to-green-700 text-white' : ''}
                    `}>
                      <div className="w-5 h-5 sm:w-6 sm:h-6">{feature.icon}</div>
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-bold text-black dark:text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 dark:text-gray-400 text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Items Section */}
      <section className="py-16 px-3 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black dark:text-white mb-4 sm:mb-6 text-balance px-4 sm:px-0">
              Trending This Week
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white dark:text-black font-semibold bg-black/80 dark:bg-white/80 rounded-xl px-6 py-3 inline-block shadow-lg text-balance">
              Discover what everyone&apos;s ordering right now
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto px-4 sm:px-0">
            {popularItems.map((item, index) => (
              <Card key={index} className="bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-gray-200/30 dark:border-gray-800/30 rounded-2xl shadow-lg group overflow-hidden interactive">
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=400'
                    }}
                  />
                  <Badge className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/95 text-black border-0 shadow-lg z-20 text-xs sm:text-sm">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {item.rating}
                  </Badge>
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
                    <Badge className="bg-black/80 text-white border-0 text-xs sm:text-sm">{item.category}</Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <p className="text-xs sm:text-sm font-medium">⏱️ {item.time}</p>
                  </div>
                </div>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                    <h3 className="font-bold text-lg sm:text-xl text-black dark:text-white flex-1 mr-2">{item.name}</h3>
                    <span className="text-lg sm:text-2xl font-bold text-black dark:text-white">{item.price}</span>
                  </div>
                  <Button className="w-full btn-gradient-green rounded-xl interactive text-sm sm:text-base py-2 sm:py-3">
                    Add to Cart
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8 sm:mt-12 px-4 sm:px-0">
            <Link href="/menu">
              <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full border-2 border-black dark:border-white text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black interactive">
                View All Items
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Testimonials />

      {/* CTA Section */}
      <section className="py-16 px-3 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-20"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-6 sm:mb-8 text-white dark:text-black" />
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-6 sm:mb-8 text-white dark:text-black text-balance px-4 sm:px-0">
              Ready to Order?
            </h2>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 dark:text-gray-700 mb-8 sm:mb-12 text-gray-300 dark:text-gray-700 max-w-xl sm:max-w-2xl mx-auto text-balance px-4 sm:px-0">
              Join thousands of food lovers and experience premium delivery today.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 sm:px-0">
              <Link href="/menu" className="w-full sm:w-auto">
                <Button size="lg" className="btn-gradient-blue px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full w-full sm:min-w-[200px] interactive">
                  Start Ordering
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/auth/sign-up" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-full w-full sm:min-w-[200px] border-2 border-white dark:border-black text-black dark:text-white hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white interactive"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-8 sm:py-12 px-3 sm:px-4 border-t border-gray-200 dark:border-gray-800 relative overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
            <p className="text-xs sm:text-sm text-black dark:text-white font-semibold mb-3 sm:mb-4">Hotel Partner?</p>
          <Link href="/admin/login">
            <Button variant="link" className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400 interactive text-sm sm:text-base">
              Partner Dashboard
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
      </div>
      
      {/* Footer */}
      <Footer />
    </>
  )
}

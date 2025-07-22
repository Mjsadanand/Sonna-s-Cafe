"use client"

import { Card } from '@/components/ui/card'
import Image from 'next/image'

interface WhatsOnMindProps {
  onCategorySelect: (categorySlug: string) => void
}

export function WhatsOnMind({ onCategorySelect }: WhatsOnMindProps) {
  // Updated category data with working food images
const mindItems = [
    { id: 'pizza', name: 'Pizza', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Pizza-3007395.jpg/1200px-Pizza-3007395.jpg?w=400&h=400&fit=crop' },
    { id: 'cakes', name: 'Cakes', image: 'https://www.kekizcakes.com/wp-content/uploads/2024/08/black-forest-cake-half-kg_1.webp?w=400&h=400&fit=crop' },
    { id: 'Snacks', name: 'Snacks', image: 'https://t4.ftcdn.net/jpg/01/73/41/63/360_F_173416361_2YCaYyXrVk6nhNoIkg21515HUWseyqyr.jpg?w=400&h=400&fit=crop' },
    { id: 'burgers', name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop' },
    { id: 'Combos', name: 'Combos', image: 'https://content.jdmagicbox.com/v2/comp/mumbai/r8/022pxx22.xx22.210618092103.s2r8/catalogue/house-of-combos-borivali-west-mumbai-north-indian-delivery-restaurants-iyfzv1l1b5.jpg?w=400&h=400&fit=crop' },
    { id: 'chinese', name: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=400&fit=crop' },
    { id: 'desserts', name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop' },
    { id: 'beverages', name: 'Beverages', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop' },
    { id: 'salads', name: 'Salads', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop' },
    { id: 'sandwiches', name: 'Sandwiches', image: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=400&fit=crop' },
]

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6">What&apos;s on your mind?</h2>
      
      {/* Horizontal scrollable container */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {mindItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onCategorySelect(item.id)}
            className="flex-shrink-0 cursor-pointer group"
          >
            <Card className="w-32 h-32 md:w-36 md:h-36 overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="relative w-full h-full">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/images/placeholder-food.jpg'
                  }}
                  // unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <h3 className="text-white font-semibold text-sm text-center">
                    {item.name}
                  </h3>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

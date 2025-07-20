import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/lib/hooks/useApiData'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
  id: string
  type: 'order_update' | 'promotion' | 'system'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  data?: Record<string, unknown>
}

export function NotificationCenter() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  
  const { data: notifications = [], refetch } = useNotifications() as { data: Notification[]; refetch: () => void }
  const { mutate: markAsRead } = useMarkNotificationAsRead()
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead()

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId)
      refetch()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({})
      refetch()
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_update':
        return '🍽️'
      case 'promotion':
        return '🎉'
      case 'system':
        return '⚙️'
      default:
        return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'order_update':
        return 'bg-blue-500'
      case 'promotion':
        return 'bg-green-500'
      case 'system':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  if (!user) {
    return null
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="h-auto p-1 text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No notifications yet
            </div>
          ) : (
            notifications.map((notification: Notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50 dark:bg-blue-950' : ''
                }`}
                onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3 w-full">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    !notification.isRead ? getNotificationColor(notification.type) : 'bg-gray-300'
                  }`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {getNotificationIcon(notification.type)} {notification.title}
                      </p>
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notification.id)
                          }}
                          className="h-auto p-1"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationCenter

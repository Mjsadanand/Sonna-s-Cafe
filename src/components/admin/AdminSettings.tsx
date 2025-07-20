'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { 
  Save, 
  RefreshCw, 
  Bell,
  Shield,
  Database,
  Mail,
  Globe,
  Clock,
  Download
} from 'lucide-react'

// Get auth headers for API calls
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin-token')
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
}

// Simple Switch component
const Switch = ({ 
  checked, 
  onCheckedChange, 
  id 
}: { 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void; 
  id?: string 
}) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className="sr-only peer"
      id={id}
      aria-label="Toggle switch"
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
  </label>
)

interface AdminSettings {
  // Restaurant Settings
  restaurantName: string
  restaurantDescription: string
  restaurantPhone: string
  restaurantEmail: string
  restaurantAddress: string
  
  // Operational Settings
  isOrderingEnabled: boolean
  minimumOrderAmount: number
  deliveryFee: number
  preparationTime: number
  
  // Notification Settings
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  
  // System Settings
  maintenanceMode: boolean
  autoBackup: boolean
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({
    restaurantName: "",
    restaurantDescription: "",
    restaurantPhone: "",
    restaurantEmail: "",
    restaurantAddress: "",
    isOrderingEnabled: true,
    minimumOrderAmount: 15.00,
    deliveryFee: 5.99,
    preparationTime: 30,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    maintenanceMode: false,
    autoBackup: true
  })

  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // Load settings from database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          headers: getAuthHeaders()
        })
        
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
        } else {
          toast.error('Failed to load settings')
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        toast.error('Failed to load settings')
      } finally {
        setIsInitialLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast.success('Settings saved successfully')
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    }
    setIsLoading(false)
  }

  const handleReset = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/settings', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        toast.success('Settings reset to defaults')
      } else {
        throw new Error('Failed to reset settings')
      }
    } catch (error) {
      console.error('Error resetting settings:', error)
      toast.error('Failed to reset settings')
    }
    setIsLoading(false)
  }

  const handleExportData = async (type: 'orders' | 'menu-items' | 'users') => {
    try {
      const response = await fetch(`/api/admin/export/${type}?format=csv`, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`${type.replace('-', ' ')} data exported successfully`)
      } else {
        throw new Error(`Failed to export ${type} data`)
      }
    } catch (error) {
      console.error(`Error exporting ${type}:`, error)
      toast.error(`Failed to export ${type} data`)
    }
  }

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
  }

  const updateSetting = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Manage your restaurant settings and preferences</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restaurant Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Restaurant Information
            </CardTitle>
            <CardDescription>
              Basic information about your restaurant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input
                id="restaurantName"
                value={settings.restaurantName}
                onChange={(e) => updateSetting('restaurantName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantDescription">Description</Label>
              <Textarea
                id="restaurantDescription"
                value={settings.restaurantDescription}
                onChange={(e) => updateSetting('restaurantDescription', e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantPhone">Phone Number</Label>
              <Input
                id="restaurantPhone"
                value={settings.restaurantPhone}
                onChange={(e) => updateSetting('restaurantPhone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantEmail">Email</Label>
              <Input
                id="restaurantEmail"
                type="email"
                value={settings.restaurantEmail}
                onChange={(e) => updateSetting('restaurantEmail', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="restaurantAddress">Address</Label>
              <Textarea
                id="restaurantAddress"
                value={settings.restaurantAddress}
                onChange={(e) => updateSetting('restaurantAddress', e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Operational Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Operational Settings
            </CardTitle>
            <CardDescription>
              Configure how your restaurant operates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Online Ordering</Label>
                <div className="text-sm text-muted-foreground">
                  Allow customers to place orders online
                </div>
              </div>
              <Switch
                checked={settings.isOrderingEnabled}
                onCheckedChange={(checked) => updateSetting('isOrderingEnabled', checked)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minimumOrderAmount">Minimum Order Amount ($)</Label>
              <Input
                id="minimumOrderAmount"
                type="number"
                step="0.01"
                value={settings.minimumOrderAmount}
                onChange={(e) => updateSetting('minimumOrderAmount', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
              <Input
                id="deliveryFee"
                type="number"
                step="0.01"
                value={settings.deliveryFee}
                onChange={(e) => updateSetting('deliveryFee', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="preparationTime">Default Preparation Time (minutes)</Label>
              <Input
                id="preparationTime"
                type="number"
                value={settings.preparationTime}
                onChange={(e) => updateSetting('preparationTime', parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive order notifications via email
                </div>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive order notifications via SMS
                </div>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Push Notifications</Label>
                <div className="text-sm text-muted-foreground">
                  Receive push notifications in browser
                </div>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Advanced system configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <div className="text-sm text-muted-foreground">
                  Temporarily disable ordering
                </div>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Backup</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically backup data daily
                </div>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
              />
            </div>

            <div className="pt-4 border-t">
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Database className="w-4 h-4 mr-2" />
                  Backup Database Now
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Test Email Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Export
            </CardTitle>
            <CardDescription>
              Export your data for backup or analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleExportData('orders')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Orders Data
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleExportData('menu-items')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Menu Items Data
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleExportData('users')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Users Data
              </Button>
            </div>
            <div className="text-sm text-gray-500">
              Exports are generated in CSV format and include all relevant data.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

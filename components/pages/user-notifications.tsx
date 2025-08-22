"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Send, Bell, Loader2 } from "lucide-react"
import apiClient from "@/lib/axios"

interface Notification {
  _id: string
  title: string
  message: string
  type: string
  recipientType: string
  recipientId?: string
  createdAt: string
}

interface User {
  _id: string
  username: string
  email: string
}

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [formData, setFormData] = useState({
    recipientType: "",
    recipientId: "",
    title: "",
    message: "",
    type: "general",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [notificationsRes, usersRes] = await Promise.all([
          apiClient.get('/api/admin/notifications'),
          apiClient.get('/api/admin/users?limit=100')
        ])
        
        if (notificationsRes.data.success) {
          setNotifications(notificationsRes.data.notifications)
        }
        
        if (usersRes.data && usersRes.data.users) {
          setUsers(usersRes.data.users)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.message || !formData.recipientType) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.recipientType === 'custom' && !formData.recipientId) {
      alert('Please select a user for custom notification')
      return
    }

    try {
      setSending(true)
      const response = await apiClient.post('/api/admin/notifications', {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        recipientType: formData.recipientType,
        recipientId: formData.recipientType === 'custom' ? formData.recipientId : undefined
      })

      if (response.data.success) {
        // Add the new notification to the list
        setNotifications([response.data.notification, ...notifications])
        
        // Reset form
        setFormData({
          recipientType: "",
          recipientId: "",
          title: "",
          message: "",
          type: "general",
        })
        
        alert(`Notification sent successfully to ${response.data.recipientsCount} users!`)
      }
    } catch (error: any) {
      console.error('Failed to send notification:', error)
      alert(error.response?.data?.error || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      general: "bg-blue-50 text-blue-700 border-blue-200",
      promotion: "bg-green-50 text-green-700 border-green-200",
      system: "bg-orange-50 text-orange-700 border-orange-200",
      warning: "bg-red-50 text-red-700 border-red-200",
    }
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || colors.general}>
        {type}
      </Badge>
    )
  }

  const getRecipientTypeLabel = (recipientType: string) => {
    switch (recipientType) {
      case 'all_users':
        return 'All Users'
      case 'active_users':
        return 'Active Users (last 30 days)'
      case 'new_users':
        return 'New Users (last 7 days)'
      case 'custom':
        return 'Custom User'
      default:
        return recipientType
    }
  }

  const getRecipientDisplay = (notification: Notification) => {
    if (notification.recipientType === 'custom' && notification.recipientId) {
      const user = users.find(u => u._id === notification.recipientId)
      return user ? `${user.username} (${user.email})` : notification.recipientId
    }
    return getRecipientTypeLabel(notification.recipientType)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Notifications</h1>
          <p className="mt-2 text-gray-600">Loading notifications...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Notifications</h1>
        <p className="mt-2 text-gray-600">Send custom notifications to users</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="mr-2 h-5 w-5" />
              Send Notification
            </CardTitle>
            <CardDescription>Send a custom notification to specific users or all users</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient Type</Label>
                <Select
                  value={formData.recipientType}
                  onValueChange={(value) => setFormData({ ...formData, recipientType: value, recipientId: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_users">All Users</SelectItem>
                    <SelectItem value="active_users">Active Users (last 30 days)</SelectItem>
                    <SelectItem value="new_users">New Users (last 7 days)</SelectItem>
                    <SelectItem value="custom">Custom User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.recipientType === "custom" && (
                <div>
                  <Label htmlFor="customRecipient">Select User</Label>
                  <Select
                    value={formData.recipientId}
                    onValueChange={(value) => setFormData({ ...formData, recipientId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.username} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="type">Notification Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="promotion">Promotion</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Notification title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Notification message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                <Send className="mr-2 h-4 w-4" />
                Send Notification
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Recent Notifications
            </CardTitle>
            <CardDescription>Recently sent notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.slice(0, 5).map((notification) => (
                <div key={notification._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        {getTypeBadge(notification.type)}
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          {getRecipientTypeLabel(notification.recipientType)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    To: {getRecipientDisplay(notification)} • {new Date(notification.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>Complete history of sent notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => (
                <TableRow key={notification._id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-gray-500">{notification.message}</p>
                    </div>
                  </TableCell>
                  <TableCell>{getRecipientDisplay(notification)}</TableCell>
                  <TableCell>{getTypeBadge(notification.type)}</TableCell>
                  <TableCell>{new Date(notification.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

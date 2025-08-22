"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import apiClient from '@/lib/axios'

export default function TestCorsPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testCors = async () => {
    setLoading(true)
    setError(null)
    setTestResult(null)
    
    try {
      console.log('🧪 Testing CORS connection...')
      const response = await apiClient.get('/api/test-cors')
      setTestResult(response.data)
      console.log('✅ CORS test successful:', response.data)
    } catch (err: any) {
      console.error('❌ CORS test failed:', err)
      setError(err.message || 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const testDashboardStats = async () => {
    setLoading(true)
    setError(null)
    setTestResult(null)
    
    try {
      console.log('📊 Testing dashboard stats...')
      const response = await apiClient.get('/api/admin/dashboard-stats')
      setTestResult(response.data)
      console.log('✅ Dashboard stats test successful:', response.data)
    } catch (err: any) {
      console.error('❌ Dashboard stats test failed:', err)
      setError(err.message || 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">CORS Test Page</h1>
        <p className="mt-2 text-gray-600">Test the connection to the backend API</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Basic CORS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testCors} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test CORS Connection'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Dashboard Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testDashboardStats} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Dashboard Stats'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-red-700 text-sm overflow-auto">
              {error}
            </pre>
          </CardContent>
        </Card>
      )}

      {testResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Success</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-green-700 text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

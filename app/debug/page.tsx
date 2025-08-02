"use client"

import { API_CONFIG, getApiUrl } from "@/lib/config"

export default function DebugPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel Debug Info</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
          <p><strong>NEXT_PUBLIC_API_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'NOT SET'}</p>
        </div>
        
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">API Configuration</h2>
          <p><strong>Base URL:</strong> {API_CONFIG.BASE_URL}</p>
          <p><strong>Dashboard Stats URL:</strong> {getApiUrl('/api/admin/dashboard-stats')}</p>
        </div>
        
        <div className="bg-green-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Expected Values</h2>
          <p><strong>Should be:</strong> https://easyearn-backend-production-01ac.up.railway.app</p>
          <p><strong>Should NOT be:</strong> nexusbackend-production.up.railway.app</p>
        </div>
        
        <div className="bg-yellow-100 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Deployment Info</h2>
          <p><strong>Build Time:</strong> {new Date().toISOString()}</p>
          <p><strong>Latest Commit:</strong> d12ed03</p>
        </div>
      </div>
    </div>
  )
}

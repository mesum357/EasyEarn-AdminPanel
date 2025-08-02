// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://easyearn-backend-production-01ac.up.railway.app',
}

// Helper function to get API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '') // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${cleanEndpoint}`
}

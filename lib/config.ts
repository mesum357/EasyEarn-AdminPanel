// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005',
}

// Helper function to get API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '') // Remove trailing slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const finalUrl = `${baseUrl}${cleanEndpoint}`
  
  // Debug logging
  console.log('🔧 Config Debug:', {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    API_CONFIG_BASE_URL: API_CONFIG.BASE_URL,
    baseUrl,
    endpoint,
    cleanEndpoint,
    finalUrl
  })
  
  return finalUrl
}

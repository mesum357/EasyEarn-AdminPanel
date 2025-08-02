"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Dynamically import the router component with no SSR
const AdminPanelRouter = dynamic(() => import("./admin-panel-router"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  ),
})

export default function AdminPanel() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return <AdminPanelRouter />
}

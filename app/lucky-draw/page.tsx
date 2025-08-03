"use client"

import dynamic from "next/dynamic"
import AdminLayout from "@/components/admin-layout"

const LuckyDrawControl = dynamic(() => import("@/components/pages/lucky-draw-control"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  ),
})

export default function LuckyDrawPage() {
  return (
    <AdminLayout>
      <LuckyDrawControl />
    </AdminLayout>
  )
} 
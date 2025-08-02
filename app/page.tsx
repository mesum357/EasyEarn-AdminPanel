"use client"

import dynamic from "next/dynamic"

const AdminPanel = dynamic(() => import("@/components/admin-panel"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  ),
})

export default function Home() {
  return <AdminPanel />
}

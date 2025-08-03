"use client"

import dynamic from "next/dynamic"
import AdminLayout from "@/components/admin-layout"

const DepositRequests = dynamic(() => import("@/components/pages/deposit-requests"), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
  ),
})

export default function DepositsPage() {
  return (
    <AdminLayout>
      <DepositRequests />
    </AdminLayout>
  )
} 
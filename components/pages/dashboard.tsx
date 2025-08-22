import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Users, Gift, Wallet, TrendingUp, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/axios"

interface DashboardStats {
  users: {
    total: number
    verified: number
    unverified: number
    newToday: number
    newThisMonth: number
    newLastMonth: number
    monthlyGrowth: number
  }
  deposits: {
    total: number
    pending: number
    confirmed: number
    totalAmount: number
  }
  participations: {
    total: number
    pending: number
    approved: number
    rejected: number
  }
  referrals: {
    total: number
    completed: number
    pending: number
  }
  withdrawals: {
    total: number
    pending: number
    completed: number
    totalAmount: number
  }
  balance: {
    total: number
  }
  recentActivity: {
    users: number
    deposits: number
    participations: number
    withdrawals: number
  }
}

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/api/admin/dashboard-stats')
        if (response.data.success) {
          setStats(response.data.stats)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Loading dashboard data...</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const dashboardStats = stats ? [
  {
    name: "Total Users",
      value: stats.users.total.toLocaleString(),
      change: `${stats.users.monthlyGrowth >= 0 ? '+' : ''}${stats.users.monthlyGrowth}%`,
      changeType: stats.users.monthlyGrowth >= 0 ? "positive" : "negative",
    icon: Users,
    redirectPath: "/users",
  },
  {
    name: "Pending Deposits",
      value: stats.deposits.pending.toString(),
      change: `+${stats.recentActivity.deposits}`,
    changeType: "neutral",
    icon: CreditCard,
    redirectPath: "/deposits",
  },
  {
      name: "Pending Participations",
      value: stats.participations.pending.toString(),
      change: `+${stats.recentActivity.participations}`,
    changeType: "positive",
    icon: Gift,
    redirectPath: "/lucky-draw",
  },
  {
    name: "Pending Withdraws",
      value: stats.withdrawals.pending.toString(),
      change: `+${stats.recentActivity.withdrawals}`,
    changeType: "positive",
    icon: Wallet,
    redirectPath: "/withdraws",
  },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card 
              key={stat.name} 
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => router.push(stat.redirectPath)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.name}</CardTitle>
                <Icon className="h-4 w-4 text-gray-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                        ? "text-red-600"
                        : "text-gray-600"
                  }`}
                >
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Platform activity in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats && (
                <>
                  <div className="flex items-center justify-between">
                  <div>
                      <p className="font-medium">New Users</p>
                      <p className="text-sm text-gray-500">{stats.recentActivity.users} users joined</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Deposits</p>
                      <p className="text-sm text-gray-500">{stats.recentActivity.deposits} deposits made</p>
                  </div>
                  <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Pending
                    </span>
                  </div>
                </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New Participations</p>
                      <p className="text-sm text-gray-500">{stats.recentActivity.participations} tasks completed</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Review
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Important system notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats && (
                <>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                    <div>
                      <p className="font-medium">Pending Deposits</p>
                      <p className="text-sm text-gray-500">{stats.deposits.pending} deposits require review</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                <div>
                      <p className="font-medium">Pending Participations</p>
                      <p className="text-sm text-gray-500">{stats.participations.pending} tasks need approval</p>
                </div>
              </div>
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-green-500" />
                <div>
                      <p className="font-medium">Total Balance</p>
                      <p className="text-sm text-gray-500">${stats.balance.total.toLocaleString()} across all users</p>
                </div>
              </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Check, X, Eye, AlertTriangle, Loader2, RefreshCw } from "lucide-react"
import apiClient from "@/lib/axios"

interface WithdrawalRequest {
  id: string
  user: {
    id: string
    username: string
    email: string
    balance: number
  }
  amount: number
  walletAddress: string
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  notes?: string
  createdAt: string
  processedAt?: string
}

export default function WithdrawRequests() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [processStatus, setProcessStatus] = useState<'completed' | 'rejected'>('completed')
  const [processNotes, setProcessNotes] = useState("")

  // Fetch withdrawal requests
  const fetchWithdrawals = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/api/admin/withdrawal-requests')
      
      if (response.data.success) {
        setWithdrawals(response.data.withdrawalRequests)
      }
    } catch (error) {
      console.error('Error fetching withdrawal requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const handleProcess = async () => {
    if (!selectedWithdrawal) return

    try {
      setProcessingId(selectedWithdrawal.id)
      const response = await apiClient.put(
        `/api/admin/withdrawal-requests/${selectedWithdrawal.id}/process`,
        {
          status: processStatus,
          notes: processNotes
        }
      )

      if (response.data.success) {
        // Update local state
        setWithdrawals(withdrawals.map(w => 
          w.id === selectedWithdrawal.id 
            ? { 
                ...w, 
                status: processStatus, 
                processedAt: new Date().toISOString(),
                notes: processNotes
              }
            : w
        ))
        
        setIsProcessDialogOpen(false)
        setSelectedWithdrawal(null)
        setProcessNotes("")
        setProcessStatus('completed')
      }
    } catch (error) {
      console.error('Error processing withdrawal request:', error)
      alert('Failed to process withdrawal request')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Processing
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const filteredWithdrawals =
    statusFilter === "all" ? withdrawals : withdrawals.filter((withdrawal) => withdrawal.status === statusFilter)

  const stats = {
    pending: withdrawals.filter((w) => w.status === "pending").length,
    processing: withdrawals.filter((w) => w.status === "processing").length,
    totalAmount: withdrawals
      .filter((w) => w.status === "pending" || w.status === "processing")
      .reduce((sum, w) => sum + w.amount, 0),
  }

  if (loading) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Withdraw Requests</h1>
        <p className="mt-2 text-gray-600">Review and process user withdrawal requests</p>
        </div>
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading withdrawal requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Withdraw Requests</h1>
          <p className="mt-2 text-gray-600">Review and process user withdrawal requests</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchWithdrawals}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <div className="h-4 w-4 bg-yellow-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pending Amount</CardTitle>
            <div className="h-4 w-4 bg-blue-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Requires processing</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>Manage user withdrawal requests</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Requests</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                <TableHead>Wallet Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredWithdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{withdrawal.user.username}</div>
                      <div className="text-sm text-gray-500">{withdrawal.user.email}</div>
                      <div className="text-xs text-gray-400">Balance: ${withdrawal.user.balance.toFixed(2)}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${withdrawal.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={withdrawal.walletAddress}>
                      {withdrawal.walletAddress}
                    </div>
                    </TableCell>
                  <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                  <TableCell>{new Date(withdrawal.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Withdrawal Request Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium">User</Label>
                                <p className="text-sm text-gray-600">{withdrawal.user.username} ({withdrawal.user.email})</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Amount</Label>
                                <p className="text-sm text-gray-600">${withdrawal.amount.toFixed(2)}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Status</Label>
                                <div className="mt-1">{getStatusBadge(withdrawal.status)}</div>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Request Date</Label>
                                <p className="text-sm text-gray-600">{new Date(withdrawal.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Wallet Address</Label>
                              <p className="text-sm text-gray-600 break-all">{withdrawal.walletAddress}</p>
                            </div>
                            {withdrawal.notes && (
                              <div>
                                <Label className="text-sm font-medium">Notes</Label>
                                <p className="text-sm text-gray-600">{withdrawal.notes}</p>
                              </div>
                            )}
                            {withdrawal.processedAt && (
                              <div>
                                <Label className="text-sm font-medium">Processed Date</Label>
                                <p className="text-sm text-gray-600">{new Date(withdrawal.processedAt).toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {(withdrawal.status === 'pending' || withdrawal.status === 'processing') && (
                        <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedWithdrawal(withdrawal)}
                            >
                              Process
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Process Withdrawal Request</DialogTitle>
                              <DialogDescription>
                                Choose to approve or reject this withdrawal request for {withdrawal.user.username}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label className="text-sm font-medium">Amount</Label>
                                <p className="text-sm text-gray-600">${withdrawal.amount.toFixed(2)}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Wallet Address</Label>
                                <p className="text-sm text-gray-600 break-all">{withdrawal.walletAddress}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Action</Label>
                                <Select value={processStatus} onValueChange={(value: 'completed' | 'rejected') => setProcessStatus(value)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="completed">Approve</SelectItem>
                                    <SelectItem value="rejected">Reject</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="notes">Notes (Optional)</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Add any notes about this decision..."
                                  value={processNotes}
                                  onChange={(e) => setProcessNotes(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                            <Button
                                onClick={handleProcess}
                                disabled={processingId === withdrawal.id}
                              >
                                {processingId === withdrawal.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  `Mark as ${processStatus === 'completed' ? 'Approved' : 'Rejected'}`
                                )}
                          </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          
          {filteredWithdrawals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No withdrawal requests found.</p>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

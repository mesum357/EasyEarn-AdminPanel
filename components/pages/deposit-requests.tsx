"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Check, X, Eye, Loader2, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import apiClient from "@/lib/axios"

interface Deposit {
  _id: string
  userId: string
  amount: number
  status: string
  transactionHash?: string
  receiptUrl?: string
  notes?: string
  createdAt: string
  confirmedAt?: string
  user?: {
    username: string
    email: string
  }
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalDeposits: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export default function DepositRequests() {
  const [deposits, setDeposits] = useState<Deposit[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [processingDeposits, setProcessingDeposits] = useState<Set<string>>(new Set())
  const [showSuccessMessage, setShowSuccessMessage] = useState<string | null>(null)

  const fetchDeposits = async (page = 1) => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/api/admin/deposits?page=${page}&limit=10`)
      if (response.data && response.data.deposits) {
        const sanitizedDeposits = response.data.deposits.map((deposit: any) => ({
          ...deposit,
          user: deposit.user || null,
          userId: deposit.userId || ''
        }))
        setDeposits(sanitizedDeposits)
        setPagination(response.data.pagination)
        setCurrentPage(page)
      } else {
        setDeposits([])
        setPagination(null)
      }
    } catch (error) {
      console.error('Failed to fetch deposits:', error)
      setDeposits([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeposits(currentPage)
  }, [currentPage])

  const handleApprove = async (id: string) => {
    try {
      setProcessingDeposits(prev => new Set(prev).add(id))
              const response = await apiClient.put(`/api/admin/deposits/${id}/confirm`)
      if (response.data.success) {
        setDeposits(deposits.map((deposit) => 
          deposit._id === id ? { ...deposit, status: "confirmed" } : deposit
        ))
        setShowSuccessMessage('Deposit approved successfully!')
        setTimeout(() => setShowSuccessMessage(null), 3000)
      }
    } catch (error) {
      console.error('Failed to approve deposit:', error)
      setShowSuccessMessage('Failed to approve deposit. Please try again.')
      setTimeout(() => setShowSuccessMessage(null), 3000)
    } finally {
      setProcessingDeposits(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      setProcessingDeposits(prev => new Set(prev).add(id))
              const response = await apiClient.put(`/api/admin/deposits/${id}/reject`)
      if (response.data.success) {
        setDeposits(deposits.map((deposit) => 
          deposit._id === id ? { ...deposit, status: "rejected" } : deposit
        ))
        setShowSuccessMessage('Deposit rejected successfully!')
        setTimeout(() => setShowSuccessMessage(null), 3000)
      }
    } catch (error) {
      console.error('Failed to reject deposit:', error)
      setShowSuccessMessage('Failed to reject deposit. Please try again.')
      setTimeout(() => setShowSuccessMessage(null), 3000)
    } finally {
      setProcessingDeposits(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            Pending
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Confirmed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
            <X className="h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deposit Requests</h1>
          <p className="mt-2 text-gray-600">Loading deposit requests...</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Deposit Requests</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between animate-pulse">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Deposit Requests</h1>
        <p className="mt-2 text-gray-600">Manage user deposit requests and approvals</p>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className={`p-4 rounded-lg border ${
          showSuccessMessage.includes('successfully') 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {showSuccessMessage.includes('successfully') ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <span className="font-medium">{showSuccessMessage}</span>
          </div>
        </div>
      )}

      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deposits</p>
                <p className="text-2xl font-bold">{pagination ? pagination.totalDeposits : 0}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">$</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {deposits.filter(d => d.status === 'pending').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {deposits.filter(d => d.status === 'confirmed').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {deposits.filter(d => d.status === 'rejected').length}
                </p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <X className="h-4 w-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Deposit Requests</CardTitle>
              <CardDescription>Review and manage user deposit requests</CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={fetchDeposits}
              disabled={loading}
              className="ml-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <span>Refresh</span>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Transaction Hash</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits && deposits.length > 0 ? (
                  deposits.map((deposit) => (
                    <TableRow 
                      key={deposit._id}
                      className={`${
                        deposit.status === 'confirmed' 
                          ? 'bg-green-50/30 border-green-200' 
                          : deposit.status === 'rejected' 
                          ? 'bg-red-50/30 border-red-200' 
                          : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {deposit.user?.username || 'Unknown'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {deposit.user?.email || 'N/A'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>${deposit.amount ? deposit.amount.toFixed(2) : '0.00'}</TableCell>
                      <TableCell>{getStatusBadge(deposit.status || 'unknown')}</TableCell>
                      <TableCell>
                        {deposit.createdAt ? new Date(deposit.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {deposit.transactionHash ? (
                          <span className="text-sm font-mono text-gray-600">
                            {deposit.transactionHash.slice(0, 8)}...
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <div className="flex items-center space-x-2">
                            {deposit.receiptUrl && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                <DialogContent className="max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Receipt Image</DialogTitle>
                                    <p className="text-sm text-gray-500 mt-2">URL: {deposit.receiptUrl}</p>
                                  </DialogHeader>
                                  <div className="flex justify-center">
                                    <img 
                                      src={deposit.receiptUrl}
                                      alt="Receipt"
                                      className="max-w-full max-h-[70vh] object-contain rounded-lg border border-gray-200"
                                      onLoad={() => {
                                        console.log('✅ Image loaded successfully:', deposit.receiptUrl);
                                      }}
                                      onError={(e) => {
                                        console.error('❌ Failed to load image:', deposit.receiptUrl);
                                        console.error('Error details:', e);
                                      }}
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>View Receipt Image</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          {deposit.status === "pending" && (
                            <>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={processingDeposits.has(deposit._id)}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-50"
                                  >
                                    {processingDeposits.has(deposit._id) ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Check className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to approve this deposit of ${deposit.amount.toFixed(2)} from {deposit.user?.username || 'Unknown'}?
                                      <br />
                                      <span className="font-medium text-green-600">
                                        This will add ${deposit.amount.toFixed(2)} to the user's balance.
                                      </span>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleApprove(deposit._id)}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Approve Deposit
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={processingDeposits.has(deposit._id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                                  >
                                    {processingDeposits.has(deposit._id) ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Rejection</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to reject this deposit of ${deposit.amount.toFixed(2)} from {deposit.user?.username || 'Unknown'}?
                                      <br />
                                      <span className="font-medium text-red-600">
                                        This action cannot be undone.
                                      </span>
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleReject(deposit._id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Reject Deposit
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No deposit requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={!pagination?.hasPrevPage}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={!pagination?.hasNextPage}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Eye, Ban, CheckCircle, UserCheck, Gift, Edit, Save, X, Loader2 } from "lucide-react"
import apiClient from "@/lib/axios"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface User {
  _id: string
  username: string
  email: string
  verified: boolean
  balance?: number
  additionalBalance?: number
  totalBalance?: number
  baseBalance?: number
  createdAt: string
  referralCode?: string
  hasDeposited?: boolean
  tasksUnlocked?: boolean
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [newAdditionalBalance, setNewAdditionalBalance] = useState("")
  const [isEditAdditionalBalanceDialogOpen, setIsEditAdditionalBalanceDialogOpen] = useState(false)
  const [isUpdatingAdditionalBalance, setIsUpdatingAdditionalBalance] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/api/admin/users?page=${currentPage}&limit=50`)
        if (response.data && response.data.users) {
          setUsers(response.data.users)
          setTotalPages(response.data.pagination?.totalPages || 1)
        }
      } catch (error) {
        console.error('Failed to fetch users:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage])

  const handleStatusChange = async (userId: string, newStatus: 'activate' | 'suspend') => {
    try {
      if (newStatus === 'activate') {
        await apiClient.put(`/api/admin/users/${userId}/activate`);
        // Update the user in the local state
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, hasDeposited: true, tasksUnlocked: true } : user
          )
        );
        console.log(`User ${userId} activated successfully.`);
      } else if (newStatus === 'suspend') {
        await apiClient.put(`/api/admin/users/${userId}/deactivate`);
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId ? { ...user, hasDeposited: false, tasksUnlocked: false } : user
          )
        );
        console.log(`User ${userId} deactivated successfully.`);
      }
    } catch (error) {
      console.error(`Failed to change status for user ${userId}:`, error);
    }
  };


  const handleEditAdditionalBalance = (user: User) => {
    setEditingUser(user);
    setNewAdditionalBalance(user.additionalBalance?.toString() || "0");
    setIsEditAdditionalBalanceDialogOpen(true);
  };

  const handleUpdateAdditionalBalance = async () => {
    console.log('🔄 Additional balance update started', { editingUser, newAdditionalBalance });
    
    if (!editingUser) {
      console.error('❌ No editing user found');
      return;
    }

    const additionalBalanceValue = parseFloat(newAdditionalBalance);
    console.log('💰 Parsed additional balance value:', additionalBalanceValue);
    
    if (isNaN(additionalBalanceValue)) {
      console.error('❌ Invalid additional balance value:', additionalBalanceValue);
      toast({
        title: "Invalid Additional Balance",
        description: "Please enter a valid number for the additional balance.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingAdditionalBalance(true);
      console.log('🚀 Sending API request to update additional balance...');
      
      const response = await apiClient.put(`/api/admin/users/${editingUser._id}/additional-balance`, {
        additionalBalance: additionalBalanceValue,
        reason: 'Admin adjustment'
      });

      console.log('✅ API response received:', response.data);

      if (response.data.success) {
        // Update the user in the local state with the new additional balance
        const updatedAdditionalBalance = response.data.user.additionalBalance;
        const totalBalance = response.data.user.totalBalance;
        const baseBalance = response.data.user.balance;
        
        console.log('🔄 Updating local state with new balance:', {
          userId: editingUser._id,
          additionalBalance: updatedAdditionalBalance,
          totalBalance,
          baseBalance
        });
        
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === editingUser._id ? { 
              ...user, 
              additionalBalance: updatedAdditionalBalance,
              totalBalance: totalBalance,
              baseBalance: baseBalance
            } : user
          )
        );

        // Show success message with detailed information
        const balanceChange = updatedAdditionalBalance - (editingUser.additionalBalance || 0);
        const changeText = balanceChange > 0 ? `+$${balanceChange.toFixed(2)}` : `$${balanceChange.toFixed(2)}`;
        
        toast({
          title: "✅ Additional Balance Updated Successfully",
          description: `User: ${editingUser.username} | Change: ${changeText} | New Additional: $${updatedAdditionalBalance.toFixed(2)} | Total Balance: $${totalBalance.toFixed(2)}`,
          duration: 6000,
        });

        setIsEditAdditionalBalanceDialogOpen(false);
        setEditingUser(null);
        setNewAdditionalBalance("");
        
        console.log('✅ Additional balance update completed successfully');
      } else {
        console.error('❌ API response indicates failure:', response.data);
        toast({
          title: "Update Failed",
          description: "Server responded with failure status",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('❌ Failed to update additional balance:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      toast({
        title: "Update Failed",
        description: error.response?.data?.error || "Failed to update user additional balance. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingAdditionalBalance(false);
      console.log('🏁 Additional balance update process finished');
    }
  };

  const handleCancelAdditionalBalanceEdit = () => {
    setIsEditAdditionalBalanceDialogOpen(false);
    setEditingUser(null);
    setNewAdditionalBalance("");
  };

  const isUserActive = (u: User) => Boolean(u.hasDeposited || u.tasksUnlocked)

  const getActivationStatusBadge = (user: User) => {
    const isActive = isUserActive(user)
    if (isActive) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Active
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          Inactive
        </Badge>
      );
    }
  };

  const getAccountTypeBadge = (totalBalance: number = 0) => {
    if (totalBalance > 100) {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          Premium
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          Basic
        </Badge>
      );
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const isActive = isUserActive(user)
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && isActive) ||
                         (statusFilter === "inactive" && !isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-2 text-gray-600">Manage all registered users</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription>Loading users...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 animate-pulse">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="mt-2 text-gray-600">Manage all registered users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>A list of all registered users in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Current Balance</TableHead>
                  <TableHead>Additional Balance</TableHead>
                  <TableHead>Total Balance</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="" alt={user.username} />
                          <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getActivationStatusBadge(user)}</TableCell>
                    <TableCell>{getAccountTypeBadge(user.totalBalance)}</TableCell>
                    <TableCell>
                      <span>${user.baseBalance?.toFixed(2) || '0.00'}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className={user.additionalBalance && user.additionalBalance < 0 ? "text-red-600" : ""}>
                          ${user.additionalBalance?.toFixed(2) || '0.00'}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAdditionalBalance(user)}
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={`font-semibold ${(user.totalBalance || 0) < 0 ? "text-red-600" : "text-green-600"}`}>
                          ${(user.totalBalance || 0).toFixed(2)}
                        </span>
                        {user.additionalBalance && user.additionalBalance !== 0 && (
                          <span className={`text-xs ${user.additionalBalance > 0 ? "text-blue-600" : "text-red-600"}`}>
                            {user.additionalBalance > 0 ? `(+$${user.additionalBalance.toFixed(2)} additional)` : `($${user.additionalBalance.toFixed(2)} deduction)`}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={isUserActive(user) ? "default" : "secondary"}
                          size="sm"
                          onClick={() => handleStatusChange(user._id, isUserActive(user) ? "suspend" : "activate")}
                        >
                          {isUserActive(user) ? 'Active' : 'Inactive'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * 50) + 1} to {Math.min(currentPage * 50, users.length)} of {users.length} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline" size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Additional Balance Dialog */}
      <Dialog open={isEditAdditionalBalanceDialogOpen} onOpenChange={setIsEditAdditionalBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Additional Balance</DialogTitle>
            <DialogDescription>
              Set the additional balance for <strong>{editingUser?.username}</strong>. 
              <br />
              <span className="text-sm text-gray-600">
                Current additional balance: <span className="font-mono">${editingUser?.additionalBalance?.toFixed(2) || '0.00'}</span> | 
                Current total balance: <span className="font-mono">${editingUser?.totalBalance?.toFixed(2) || '0.00'}</span>
              </span>
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleUpdateAdditionalBalance();
          }}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="additionalBalance">Additional Balance ($)</Label>
                <Input
                  id="additionalBalance"
                  type="number"
                  step="0.01"
                  value={newAdditionalBalance}
                  onChange={(e) => setNewAdditionalBalance(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleUpdateAdditionalBalance();
                    }
                  }}
                  placeholder="Enter additional balance amount (can be negative)"
                  disabled={isUpdatingAdditionalBalance}
                  autoFocus
                />
                <p className="text-sm text-gray-500">
                  This will be added to the user's current balance from deposits and tasks. You can enter negative values to deduct from their balance.
                </p>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelAdditionalBalanceEdit} 
                disabled={isUpdatingAdditionalBalance}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUpdatingAdditionalBalance}
                className="min-w-[180px]"
              >
                {isUpdatingAdditionalBalance ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating Balance...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Additional Balance
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
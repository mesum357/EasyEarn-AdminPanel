"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Eye, Ban, CheckCircle, UserCheck, Gift, Edit, Save, X } from "lucide-react"
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
  const [newBalance, setNewBalance] = useState("")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false)
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

  const handleEditBalance = (user: User) => {
    setEditingUser(user);
    setNewBalance(user.balance?.toString() || "0"); // Start with current balance for editing
    setIsEditDialogOpen(true);
  };

  const handleUpdateBalance = async () => {
    if (!editingUser) return;

    const balanceValue = parseFloat(newBalance);
    if (isNaN(balanceValue)) {
      toast({
        title: "Invalid Balance",
        description: "Please enter a valid number for the balance.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingBalance(true);
      const response = await apiClient.put(`/api/admin/users/${editingUser._id}/balance`, {
        balance: balanceValue,
        operation: 'set' // Set the balance to the specified value
      });

      if (response.data.success) {
        // Update the user in the local state with the new total balance
        const newTotalBalance = response.data.user.balance;
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === editingUser._id ? { ...user, balance: newTotalBalance } : user
          )
        );

        toast({
          title: "Balance Updated",
          description: `Successfully updated ${editingUser.username}'s balance to $${newTotalBalance.toFixed(2)}`,
        });

        setIsEditDialogOpen(false);
        setEditingUser(null);
        setNewBalance("");
      }
    } catch (error: any) {
      console.error('Failed to update balance:', error);
      toast({
        title: "Update Failed",
        description: error.response?.data?.error || "Failed to update user balance",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditingUser(null);
    setNewBalance("");
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

  const getAccountTypeBadge = (balance: number = 0) => {
    if (balance > 100) {
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
                  <TableHead>Balance</TableHead>
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
                    <TableCell>{getAccountTypeBadge(user.balance)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>${user.balance?.toFixed(2) || '0.00'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBalance(user)}
                          className="h-6 w-6 p-0 hover:bg-gray-100"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
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

      {/* Edit Balance Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Balance</DialogTitle>
            <DialogDescription>
              Set the balance for {editingUser?.username}. Current balance: ${editingUser?.balance?.toFixed(2) || '0.00'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
                              <Label htmlFor="balance">New Balance ($)</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                min="0"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                                  placeholder="Enter new balance amount"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit} disabled={isUpdatingBalance}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleUpdateBalance} disabled={isUpdatingBalance}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdatingBalance ? "Updating..." : "Update Balance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
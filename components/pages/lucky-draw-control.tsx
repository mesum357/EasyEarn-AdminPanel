"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Calendar, Play, Pause, Edit, Trash2, Eye, CheckCircle, XCircle, RefreshCw } from "lucide-react"

// Empty array - will be populated from backend
const initialDraws = []

export default function LuckyDrawControl() {
  const [draws, setDraws] = useState(initialDraws)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    prize: "",
    entryFee: "",
    maxParticipants: "",
    startDate: "",
    endDate: "",
  })
  const [participations, setParticipations] = useState([])
  const [selectedParticipation, setSelectedParticipation] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingDraw, setEditingDraw] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('https://easyearn-backend-production-01ac.up.railway.app/api/admin/lucky-draws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          entryFee: Number(formData.entryFee),
          maxParticipants: Number(formData.maxParticipants),
        }),
      })
      
      if (response.ok) {
        const newDraw = await response.json()
        setDraws([...draws, newDraw])
        setFormData({
          title: "",
          description: "",
          prize: "",
          entryFee: "",
          maxParticipants: "",
          startDate: "",
          endDate: "",
        })
        setIsAddDialogOpen(false)
      } else {
        console.error('Failed to create lucky draw')
      }
    } catch (error) {
      console.error('Error creating lucky draw:', error)
    }
  }

  const toggleDrawStatus = async (id: string) => {
    try {
      const currentDraw = draws.find(draw => draw._id === id)
      if (!currentDraw) return

      const newStatus = currentDraw.status === "active" ? "paused" : "active"
      
      const response = await fetch(`https://easyearn-backend-production-01ac.up.railway.app/api/admin/lucky-draws/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        setDraws(
          draws.map((draw) => {
            if (draw._id === id) {
              return { ...draw, status: newStatus }
            }
            return draw
          }),
        )
      } else {
        console.error('Failed to update draw status')
      }
    } catch (error) {
      console.error('Error updating draw status:', error)
    }
  }

  // Fetch participations from backend
  const fetchParticipations = async () => {
    try {
      const response = await fetch('https://easyearn-backend-production-01ac.up.railway.app/api/admin/participations')
      const data = await response.json()
      setParticipations(data.participations || [])
    } catch (error) {
      console.error('Failed to fetch participations:', error)
    }
  }

  // Handle participation approval
  const handleApproveParticipation = async (participationId: string) => {
    try {
      const response = await fetch(`https://easyearn-backend-production-01ac.up.railway.app/api/admin/participations/${participationId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        fetchParticipations() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to approve participation:', error)
    }
  }

  // Handle participation rejection
  const handleRejectParticipation = async (participationId: string) => {
    try {
      const response = await fetch(`https://easyearn-backend-production-01ac.up.railway.app/api/admin/participations/${participationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        fetchParticipations() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to reject participation:', error)
    }
  }

  // Fetch lucky draws from backend
  const fetchLuckyDraws = async () => {
    try {
      const response = await fetch('https://easyearn-backend-production-01ac.up.railway.app/api/admin/lucky-draws')
      if (response.ok) {
        const data = await response.json()
        setDraws(data.luckyDraws || [])
      } else {
        console.error('Failed to fetch lucky draws')
      }
    } catch (error) {
      console.error('Error fetching lucky draws:', error)
    }
  }

  // Fetch participations on component mount
  useEffect(() => {
    fetchParticipations()
    fetchLuckyDraws()
  }, [])

  // Handle delete draw
  const handleDeleteDraw = async (drawId: string) => {
    if (confirm('Are you sure you want to delete this lucky draw?')) {
      try {
        const response = await fetch(`https://easyearn-backend-production-01ac.up.railway.app/api/admin/lucky-draws/${drawId}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          setDraws(draws.filter(draw => draw._id !== drawId))
        } else {
          console.error('Failed to delete lucky draw')
        }
      } catch (error) {
        console.error('Error deleting lucky draw:', error)
      }
    }
  }

  const handleEditDraw = (draw: any) => {
    setEditingDraw(draw)
    setFormData({
      title: draw.title,
      description: draw.description,
      prize: draw.prize,
      entryFee: draw.entryFee.toString(),
      maxParticipants: draw.maxParticipants.toString(),
      startDate: new Date(draw.startDate).toISOString().split('T')[0],
      endDate: new Date(draw.endDate).toISOString().split('T')[0],
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateDraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingDraw) return
    
    try {
      const response = await fetch(`https://easyearn-backend-production-01ac.up.railway.app/api/admin/lucky-draws/${editingDraw._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          entryFee: Number(formData.entryFee),
          maxParticipants: Number(formData.maxParticipants),
        }),
      })
      
      if (response.ok) {
        const updatedDraw = await response.json()
        setDraws(draws.map(draw => draw._id === editingDraw._id ? updatedDraw.luckyDraw : draw))
        setEditingDraw(null)
        setIsEditDialogOpen(false)
        setFormData({
          title: "",
          description: "",
          prize: "",
          entryFee: "",
          maxParticipants: "",
          startDate: "",
          endDate: "",
        })
      } else {
        console.error('Failed to update lucky draw')
      }
    } catch (error) {
      console.error('Error updating lucky draw:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Active
          </Badge>
        )
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Scheduled
          </Badge>
        )
      case "paused":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Paused
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lucky Draw Control</h1>
          <p className="mt-2 text-gray-600">Manage and schedule lucky draws</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lucky Draw
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Lucky Draw</DialogTitle>
              <DialogDescription>Set up a new lucky draw for users to participate in</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="prize">Prize</Label>
                  <Input
                    id="prize"
                    value={formData.prize}
                    onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                    placeholder="e.g., $1000, Premium Membership"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="entryFee">Entry Fee (Points)</Label>
                    <Input
                      id="entryFee"
                      type="number"
                      value={formData.entryFee}
                      onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Lucky Draw</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Lucky Draw Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Lucky Draw</DialogTitle>
              <DialogDescription>Update the lucky draw details</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateDraw}>
              <div className="grid gap-4 py-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-prize">Prize</Label>
                  <Input
                    id="edit-prize"
                    value={formData.prize}
                    onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                    placeholder="e.g., $1000, Premium Membership"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-entryFee">Entry Fee (Points)</Label>
                    <Input
                      id="edit-entryFee"
                      type="number"
                      value={formData.entryFee}
                      onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-maxParticipants">Max Participants</Label>
                    <Input
                      id="edit-maxParticipants"
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-startDate">Start Date</Label>
                    <Input
                      id="edit-startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-endDate">End Date</Label>
                    <Input
                      id="edit-endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Lucky Draw</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Draws</CardTitle>
            <Play className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draws.filter((d) => d.status === "active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Draws</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draws.filter((d) => d.status === "scheduled").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <div className="h-4 w-4 bg-purple-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draws.reduce((sum, draw) => sum + draw.currentParticipants, 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lucky Draws Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Lucky Draws</CardTitle>
              <CardDescription>Manage all lucky draws and their status</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLuckyDraws}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Draw ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Prize</TableHead>
                <TableHead>Entry Fee</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {draws.map((draw) => (
                <TableRow key={draw._id}>
                  <TableCell className="font-medium">{draw._id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{draw.title}</div>
                      <div className="text-sm text-gray-500">{draw.description}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{draw.prize}</TableCell>
                  <TableCell>{draw.entryFee} pts</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>
                        {draw.currentParticipants}/{draw.maxParticipants}
                      </span>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(draw.currentParticipants / draw.maxParticipants) * 100}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(draw.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{draw.startDate}</div>
                      <div className="text-gray-500">to {draw.endDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditDraw(draw)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteDraw(draw._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {draw.status !== "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDrawStatus(draw._id)}
                          className={
                            draw.status === "active"
                              ? "text-yellow-600 hover:text-yellow-700"
                              : "text-green-600 hover:text-green-700"
                          }
                        >
                          {draw.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lucky Draw Requests Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lucky Draw Requests</CardTitle>
              <CardDescription>Review and manage participation requests from users</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchParticipations}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Prize</TableHead>
                <TableHead>Wallet/UID</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participations.map((participation) => (
                <TableRow key={participation._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{participation.user?.username || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{participation.user?.email || 'No email'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{participation.prizeTitle || participation.luckyDrawId?.title || 'N/A'}</div>
                      <div className="text-sm text-gray-500">ID: {participation.prizeId || participation.luckyDrawId?._id || 'N/A'}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{participation.walletAddress || participation.binanceUID || 'N/A'}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedParticipation(participation)
                        setIsViewDialogOpen(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    {participation.submittedButton === null && (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Pending
                      </Badge>
                    )}
                    {participation.submittedButton === true && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Approved
                      </Badge>
                    )}
                    {participation.submittedButton === false && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Rejected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(participation.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {participation.submittedButton === null && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveParticipation(participation._id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectParticipation(participation._id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Participation Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Participation Details</DialogTitle>
            <DialogDescription>Review the participation request details</DialogDescription>
          </DialogHeader>
          {selectedParticipation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <p className="text-sm text-gray-600">{selectedParticipation.user?.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{selectedParticipation.user?.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Prize</Label>
                  <p className="text-sm text-gray-600">{selectedParticipation.prizeTitle || selectedParticipation.luckyDrawId?.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Wallet Address / Binance UID</Label>
                  <p className="text-sm text-gray-600 font-mono">{selectedParticipation.walletAddress || selectedParticipation.binanceUID || 'N/A'}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Receipt Image</Label>
                <div className="mt-2">
                  {selectedParticipation.receiptUrl ? (
                    <img
                      src={selectedParticipation.receiptUrl}
                      alt="Receipt"
                      className="max-w-full h-auto rounded-lg border"
                      onError={(e) => {
                        console.error('Failed to load image:', selectedParticipation.receiptUrl);
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div 
                    className="hidden p-4 text-center text-gray-500 border rounded-lg"
                    style={{ display: selectedParticipation.receiptUrl ? 'none' : 'block' }}
                  >
                    <p>No receipt image available</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

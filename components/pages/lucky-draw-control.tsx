"use client"

import type React from "react"
import { useState } from "react"
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
import { Plus, Calendar, Play, Pause, Edit } from "lucide-react"

const mockDraws = [
  {
    id: "DRAW001",
    title: "Weekly Cash Prize",
    description: "Win up to $1000 in cash prizes",
    prize: "$1000",
    entryFee: 50,
    maxParticipants: 100,
    currentParticipants: 67,
    status: "active",
    startDate: "2024-01-15",
    endDate: "2024-01-22",
  },
  {
    id: "DRAW002",
    title: "Premium Membership",
    description: "3 months premium membership",
    prize: "Premium Membership",
    entryFee: 25,
    maxParticipants: 50,
    currentParticipants: 23,
    status: "scheduled",
    startDate: "2024-01-20",
    endDate: "2024-01-27",
  },
  {
    id: "DRAW003",
    title: "Holiday Special",
    description: "Special holiday prizes",
    prize: "$500 + Bonus",
    entryFee: 30,
    maxParticipants: 200,
    currentParticipants: 200,
    status: "completed",
    startDate: "2024-01-01",
    endDate: "2024-01-08",
  },
]

export default function LuckyDrawControl() {
  const [draws, setDraws] = useState(mockDraws)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newDraw = {
      id: `DRAW${String(draws.length + 1).padStart(3, "0")}`,
      ...formData,
      entryFee: Number(formData.entryFee),
      maxParticipants: Number(formData.maxParticipants),
      currentParticipants: 0,
      status: "scheduled",
    }
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
  }

  const toggleDrawStatus = (id: string) => {
    setDraws(
      draws.map((draw) => {
        if (draw.id === id) {
          if (draw.status === "active") {
            return { ...draw, status: "paused" }
          } else if (draw.status === "paused" || draw.status === "scheduled") {
            return { ...draw, status: "active" }
          }
        }
        return draw
      }),
    )
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
          <CardTitle>All Lucky Draws</CardTitle>
          <CardDescription>Manage all lucky draws and their status</CardDescription>
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
                <TableRow key={draw.id}>
                  <TableCell className="font-medium">{draw.id}</TableCell>
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
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      {draw.status !== "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDrawStatus(draw.id)}
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
    </div>
  )
}

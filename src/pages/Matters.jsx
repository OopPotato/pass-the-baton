import React, { useState, useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import { Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react"

import { useAppContext } from "../contexts/AppContext"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu"
import NewMatterModal from "../components/NewMatterModal"

const getStatusBadge = (status) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "completed":
    case "settled":
      return "success"
    case "pre-trial":
    case "negotiation":
    case "review":
      return "warning"
    case "discovery":
    default:
      return "info"
  }
}

export default function Matters() {
  const { matters, archiveMatter } = useAppContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMatter, setEditingMatter] = useState(null)
  const itemsPerPage = 8

  // Filter matters based on search query
  const filteredMatters = useMemo(() => {
    return matters.filter((matter) =>
      matter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      matter.lead.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [matters, searchQuery])

  // Pagination slicing
  const totalItems = filteredMatters.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  const paginatedMatters = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredMatters.slice(start, start + itemsPerPage)
  }, [filteredMatters, currentPage, itemsPerPage])

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Legal Matters</h1>
          <p className="text-muted-foreground mt-1">
            Manage your active cases, clients, and legal tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button className="gap-2" onClick={() => { setEditingMatter(null); setIsModalOpen(true); }}>
            <Plus className="h-4 w-4" />
            New Case
          </Button>
        </div>
      </div>

      <Card>
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-6 gap-4 border-b">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search cases..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto gap-2">
              <Filter className="h-4 w-4" />
              Options
            </Button>
          </div>
        </div>

        {/* Data Table */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Lead Attorney</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMatters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No cases found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMatters.map((matter) => (
                  <TableRow key={matter.id}>
                    <TableCell className="font-medium text-foreground">{matter.name}</TableCell>
                    <TableCell className="text-muted-foreground">{matter.type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(matter.status)}>
                        {matter.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{matter.lead}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {matter.updated ? formatDistanceToNow(new Date(matter.updated), { addSuffix: true }) : "Unknown"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(matter.id)}>
                            Copy Case ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingMatter(matter); setIsModalOpen(true); }}>
                            Edit Case
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => archiveMatter(matter.id)}>
                            Archive Case
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t p-4 px-6 text-sm gap-4">
          <div className="text-muted-foreground">
            Showing <strong>{totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{" "}
            <strong>{Math.min(currentPage * itemsPerPage, totalItems)}</strong> of{" "}
            <strong>{totalItems}</strong> entries
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || totalItems === 0}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
      
      <NewMatterModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        initialData={editingMatter} 
      />
    </div>
  )
}

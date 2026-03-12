import React, { useState, useMemo } from "react"
import { formatDistanceToNow } from "date-fns"
import { Search, Filter, Plus, MoreHorizontal, ChevronLeft, ChevronRight, Users } from "lucide-react"

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
import PassTheBatonModal from "../components/PassTheBatonModal"

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
  const { matters, users, archiveMatter } = useAppContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [attorneyFilter, setAttorneyFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMatter, setEditingMatter] = useState(null)
  const [batonMatter, setBatonMatter] = useState(null) // matter selected for Pass the Baton
  const itemsPerPage = 8

  // Extract unique statuses and attorneys for filter dropdowns
  const statuses = useMemo(() => ["all", ...new Set(matters.map(m => m.status))], [matters])
  const attorneys = useMemo(() => ["all", ...new Set(matters.map(m => m.lead))], [matters])

  // Filter matters based on search query AND dropdown filters
  const filteredMatters = useMemo(() => {
    return matters.filter((matter) => {
      const matchesSearch = matter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          matter.lead.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === "all" || matter.status === statusFilter
      const matchesAttorney = attorneyFilter === "all" || matter.lead === attorneyFilter
      
      return matchesSearch && matchesStatus && matchesAttorney
    })
  }, [matters, searchQuery, statusFilter, attorneyFilter])

  // Pagination slicing
  const totalItems = filteredMatters.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  const paginatedMatters = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredMatters.slice(start, start + itemsPerPage)
  }, [filteredMatters, currentPage, itemsPerPage])

  // Reset to first page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, attorneyFilter])

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Legal Matters</h1>
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

      <Card className="border-slate-200">
        {/* Action Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between p-6 gap-4 border-b">
          <div className="relative w-full lg:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search cases..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Status Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-10 px-4">
                  <Filter className="h-4 w-4" />
                  Status: {statusFilter === "all" ? "All" : statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {statuses.map(status => (
                  <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)} className="capitalize">
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Attorney Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 h-10 px-4">
                  <Users className="h-4 w-4" />
                  Lead: {attorneyFilter === "all" ? "All" : attorneyFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[180px]">
                <DropdownMenuLabel>Filter by Attorney</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {attorneys.map(attorney => (
                  <DropdownMenuItem key={attorney} onClick={() => setAttorneyFilter(attorney)}>
                    {attorney}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {(statusFilter !== "all" || attorneyFilter !== "all" || searchQuery !== "") && (
              <Button 
                variant="ghost" 
                onClick={() => { setStatusFilter("all"); setAttorneyFilter("all"); setSearchQuery(""); }}
                className="text-muted-foreground hover:text-foreground text-xs h-10"
              >
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="font-semibold text-slate-800">Case Name</TableHead>
                <TableHead className="font-semibold text-slate-800">Type</TableHead>
                <TableHead className="font-semibold text-slate-800">Status</TableHead>
                <TableHead className="font-semibold text-slate-800">Lead Attorney</TableHead>
                <TableHead className="font-semibold text-slate-800">Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMatters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                       <Search className="h-8 w-8 opacity-20" />
                       <p>No cases found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMatters.map((matter) => (
                  <TableRow key={matter.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="font-medium text-slate-900">{matter.name}</TableCell>
                    <TableCell className="text-slate-600">{matter.type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadge(matter.status)} className="font-medium shadow-sm">
                        {matter.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-700">{matter.lead}</TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {matter.updated ? formatDistanceToNow(new Date(matter.updated), { addSuffix: true }) : "Unknown"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(matter.id)} className="cursor-pointer">
                            Copy Case ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setEditingMatter(matter); setIsModalOpen(true); }} className="cursor-pointer">
                            Edit Case
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setBatonMatter(matter)}
                            className="cursor-pointer font-semibold text-primary focus:text-primary focus:bg-primary/10"
                          >
                            🏃 Pass the Baton
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer" onClick={() => archiveMatter(matter.id)}>
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
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 p-4 px-6 text-sm gap-4 bg-slate-50/30">
          <div className="text-slate-500">
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
              className="h-9 px-3 border-slate-200"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1 px-2 font-medium text-slate-700">
               {currentPage} / {totalPages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage >= totalPages || totalItems === 0}
              className="h-9 px-3 border-slate-200"
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
      <PassTheBatonModal
        open={!!batonMatter}
        onOpenChange={(open) => { if (!open) setBatonMatter(null) }}
        matter={batonMatter}
      />
    </div>
  )
}

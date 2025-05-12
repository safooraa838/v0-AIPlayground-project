"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, ArrowRight, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getQueryHistory, deleteQueryFromHistory } from "@/lib/history-service"

interface HistoryItem {
  id: string
  userId: string
  prompt: string
  category: string
  models: string[]
  responses: Record<string, string>
  timestamp: string
}

interface HistoryListProps {
  userId: string
}

export function HistoryList({ userId }: HistoryListProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const itemsPerPage = 5
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadHistory()
  }, [userId, page, categoryFilter])

  const loadHistory = async () => {
    setLoading(true)
    try {
      const { items, total } = await getQueryHistory(userId, {
        page,
        limit: itemsPerPage,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
      })

      setHistory(items)
      setTotalPages(Math.ceil(total / itemsPerPage))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load history. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteQueryFromHistory(id)
      setHistory(history.filter((item) => item.id !== id))
      toast({
        title: "Deleted",
        description: "Query has been removed from your history.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete query. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewDetails = (item: HistoryItem) => {
    // In a real app, you would navigate to a detail page or show a modal
    // For this example, we'll just log the details
    console.log("View details for:", item)
    toast({
      title: "View Details",
      description: "This would show detailed responses in a real app.",
    })
  }

  const handleBackToPlayground = () => {
    router.push("/playground")
  }

  if (loading && history.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Query History</h2>
          <Button onClick={handleBackToPlayground}>Back to Playground</Button>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Query History</h2>
        <div className="flex items-center space-x-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="creative">Creative Writing</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="summarization">Summarization</SelectItem>
              <SelectItem value="conversation">Conversation</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleBackToPlayground}>Back to Playground</Button>
        </div>
      </div>

      {history.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">No query history found.</p>
          <Button onClick={handleBackToPlayground}>Start Generating</Button>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between">
                    <div>
                      <CardTitle className="line-clamp-1">{item.prompt}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(item.timestamp), "PPP p")}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="text-xs bg-muted px-2 py-1 rounded-md">
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                    {item.models.map((model) => (
                      <span key={model} className="text-xs bg-muted px-2 py-1 rounded-md">
                        {model}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {Object.values(item.responses)[0]?.substring(0, 150)}...
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(item)}>
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p}>
                  <PaginationLink isActive={page === p} onClick={() => setPage(p)}>
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

interface ModelResponseProps {
  modelId: string
  modelName: string
  response: string
  isLoading: boolean
}

export function ModelResponse({ modelId, modelName, response, isLoading }: ModelResponseProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{modelName}</CardTitle>
        <CardDescription>Model ID: {modelId}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[80%]" />
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{response}</div>
        )}
      </CardContent>
    </Card>
  )
}

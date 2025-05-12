"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send, Save, RotateCcw } from "lucide-react"
import { ModelResponse } from "@/components/model-response"
import { useToast } from "@/hooks/use-toast"
import { generateAIResponse } from "@/lib/ai-service"
import { saveQueryToHistory } from "@/lib/history-service"

const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "creative", name: "Creative Writing" },
  { id: "technical", name: "Technical" },
  { id: "summarization", name: "Summarization" },
  { id: "conversation", name: "Conversation" },
]

const AI_MODELS = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
  { id: "claude-3-opus", name: "Claude 3 Opus" },
  { id: "claude-3-sonnet", name: "Claude 3 Sonnet" },
]

type User = {
  id: string
  name?: string
  email?: string
}

interface PlaygroundInterfaceProps {
  user: User
}

export function PlaygroundInterface({ user }: PlaygroundInterfaceProps) {
  const [prompt, setPrompt] = useState("")
  const [category, setCategory] = useState("all")
  const [selectedModels, setSelectedModels] = useState(["gpt-4o", "gpt-3.5-turbo"])
  const [isGenerating, setIsGenerating] = useState(false)
  const [responses, setResponses] = useState<Record<string, { text: string; loading: boolean }>>({})
  const { toast } = useToast()
  const router = useRouter()

  const handleModelToggle = (modelId: string) => {
    setSelectedModels((prev) => (prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]))
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to generate responses.",
        variant: "destructive",
      })
      return
    }

    if (selectedModels.length === 0) {
      toast({
        title: "No models selected",
        description: "Please select at least one AI model.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    // Initialize responses with loading state
    const initialResponses: Record<string, { text: string; loading: boolean }> = {}
    selectedModels.forEach((modelId) => {
      initialResponses[modelId] = { text: "", loading: true }
    })
    setResponses(initialResponses)

    try {
      // Generate responses for each selected model
      const responsePromises = selectedModels.map(async (modelId) => {
        try {
          const response = await generateAIResponse(prompt, modelId, category)
          return { modelId, response }
        } catch (error) {
          return { modelId, error: true }
        }
      })

      const results = await Promise.all(responsePromises)

      // Update responses
      const newResponses = { ...initialResponses }
      results.forEach(({ modelId, response, error }) => {
        if (error) {
          newResponses[modelId] = {
            text: "Error generating response. Please try again.",
            loading: false,
          }
        } else {
          newResponses[modelId] = {
            text: response,
            loading: false,
          }
        }
      })

      setResponses(newResponses)

      // Save to history
      await saveQueryToHistory({
        userId: user.id,
        prompt,
        category,
        models: selectedModels,
        responses: Object.entries(newResponses).reduce(
          (acc, [modelId, { text }]) => {
            acc[modelId] = text
            return acc
          },
          {} as Record<string, string>,
        ),
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate responses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveToHistory = async () => {
    if (Object.keys(responses).length === 0) {
      toast({
        title: "No responses to save",
        description: "Generate responses first before saving to history.",
        variant: "destructive",
      })
      return
    }

    try {
      await saveQueryToHistory({
        userId: user.id,
        prompt,
        category,
        models: selectedModels,
        responses: Object.entries(responses).reduce(
          (acc, [modelId, { text }]) => {
            acc[modelId] = text
            return acc
          },
          {} as Record<string, string>,
        ),
        timestamp: new Date().toISOString(),
      })

      toast({
        title: "Saved to history",
        description: "Your query and responses have been saved to your history.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save to history. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleReset = () => {
    setPrompt("")
    setResponses({})
  }

  const handleViewHistory = () => {
    router.push("/playground/history")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compare AI Models</CardTitle>
          <CardDescription>Enter a prompt and select models to compare their responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Prompt</h3>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Enter your prompt here..."
              className="min-h-[120px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Select Models to Compare</h3>
            <div className="flex flex-wrap gap-2">
              {AI_MODELS.map((model) => (
                <Button
                  key={model.id}
                  variant={selectedModels.includes(model.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleModelToggle(model.id)}
                >
                  {model.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleReset} disabled={isGenerating}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button variant="outline" onClick={handleViewHistory} disabled={isGenerating}>
              View History
            </Button>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleSaveToHistory}
              disabled={isGenerating || Object.keys(responses).length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {selectedModels.length > 0 && (
        <Tabs defaultValue={selectedModels[0]} className="w-full">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4">
            {selectedModels.map((modelId) => {
              const model = AI_MODELS.find((m) => m.id === modelId)
              return (
                <TabsTrigger key={modelId} value={modelId}>
                  {model?.name || modelId}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {selectedModels.map((modelId) => {
            const response = responses[modelId]
            return (
              <TabsContent key={modelId} value={modelId} className="mt-4">
                <ModelResponse
                  modelId={modelId}
                  modelName={AI_MODELS.find((m) => m.id === modelId)?.name || modelId}
                  response={response?.text || ""}
                  isLoading={response?.loading || false}
                />
              </TabsContent>
            )
          })}
        </Tabs>
      )}
    </div>
  )
}

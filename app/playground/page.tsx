import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { PlaygroundInterface } from "@/components/playground-interface"
import { getCurrentUser } from "@/lib/session"

export const metadata: Metadata = {
  title: "AI Model Playground",
  description: "Compare responses from different AI models",
}

export default async function PlaygroundPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">AI Model Playground</h1>
      <PlaygroundInterface user={user} />
    </div>
  )
}

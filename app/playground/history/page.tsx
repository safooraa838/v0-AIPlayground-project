import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { HistoryList } from "@/components/history-list"
import { getCurrentUser } from "@/lib/session"

export const metadata: Metadata = {
  title: "Query History | AI Model Playground",
  description: "View your past AI model queries and responses",
}

export default async function HistoryPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Query History</h1>
      <HistoryList userId={user.id} />
    </div>
  )
}

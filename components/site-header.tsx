"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"
import { getCurrentUser } from "@/lib/session"
import { useEffect, useState } from "react"

export function SiteHeader() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("Failed to load user", error)
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [pathname])

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
            </svg>
            <span className="inline-block font-bold">AI Model Playground</span>
          </Link>
          {!loading && user && (
            <nav className="flex gap-6">
              <Link
                href="/playground"
                className={`flex items-center text-sm font-medium ${
                  pathname === "/playground"
                    ? "text-foreground"
                    : "text-foreground/60 transition-colors hover:text-foreground"
                }`}
              >
                Playground
              </Link>
              <Link
                href="/playground/history"
                className={`flex items-center text-sm font-medium ${
                  pathname === "/playground/history"
                    ? "text-foreground"
                    : "text-foreground/60 transition-colors hover:text-foreground"
                }`}
              >
                History
              </Link>
            </nav>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <ModeToggle />
            {!loading && (
              <>
                {user ? (
                  <UserNav user={user} />
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/">Sign In</Link>
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}

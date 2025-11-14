"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [sessionId, setSessionId] = useState<string>("")
  const [showAuth, setShowAuth] = useState<"login" | "signup" | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const sid = localStorage.getItem("analytics_session_id") || "No session"
    setSessionId(sid)

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    console.log("[v0] Starting sign up process for:", email)

    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}`,
        },
      })
      
      console.log("[v0] Sign up response:", { error, user: data.user })
      
      if (error) throw error
      
      if (data.user && !data.session) {
        setSuccessMessage(
          "Account created! To login, you need to disable email confirmation in Supabase: " +
          "Go to Supabase Dashboard → Authentication → Providers → Email → Disable 'Confirm Email'. " +
          "Then you can login directly without email verification."
        )
        console.log("[v0] Email confirmation required for:", email)
      } else if (data.session) {
        const sid = localStorage.getItem("analytics_session_id")
        console.log("[v0] Session ID for binding:", sid)
        
        if (sid && data.user) {
          const { error: updateError } = await supabase
            .from("analytics_dashboards")
            .update({ creator_id: data.user.id })
            .eq("session_id", sid)
          
          console.log("[v0] Dashboard binding result:", { error: updateError })
        }
        
        setSuccessMessage("Account created and logged in successfully!")
        setShowAuth(null)
      }
      
      console.log("[v0] Sign up completed successfully")
      setEmail("")
      setPassword("")
    } catch (error: unknown) {
      console.error("[v0] Sign up error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    
    console.log("[v0] Starting login process for:", email)

    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      console.log("[v0] Login response:", { error, session: data.session })
      
      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          throw new Error(
            "Login failed. This could be due to:\n\n" +
            "1. Incorrect password\n" +
            "2. Account created before disabling email confirmation\n\n" +
            "If you just disabled email confirmation in Supabase, you need to:\n" +
            "• Go to Supabase Dashboard → Authentication → Users\n" +
            "• Find your email and click to edit\n" +
            "• Manually confirm the email, OR delete the user and sign up again"
          )
        }
        throw error
      }
      
      const sid = localStorage.getItem("analytics_session_id")
      console.log("[v0] Session ID for binding:", sid)
      
      if (sid && data.user) {
        const { error: updateError } = await supabase
          .from("analytics_dashboards")
          .update({ creator_id: data.user.id })
          .eq("session_id", sid)
        
        console.log("[v0] Dashboard binding result:", { error: updateError })
      }
      
      console.log("[v0] Login completed successfully")
      setShowAuth(null)
      setEmail("")
      setPassword("")
    } catch (error: unknown) {
      console.error("[v0] Login error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent-blue)] text-white hover:opacity-80 transition-opacity"
      >
        {user ? user.email?.charAt(0).toUpperCase() : "?"}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-4 shadow-lg">
            {!showAuth && (
              <>
                <div className="mb-4 border-b border-[var(--color-border)] pb-4">
                  <p className="text-xs text-[var(--color-muted)] mb-1">Session ID</p>
                  <p className="text-sm font-mono break-all">{sessionId}</p>
                </div>

                {user ? (
                  <>
                    <div className="mb-4">
                      <p className="text-xs text-[var(--color-muted)] mb-1">Logged in as</p>
                      <p className="text-sm font-medium">{user.email}</p>
                    </div>
                    <Button onClick={handleLogout} variant="outline" className="w-full">
                      Logout
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Button onClick={() => setShowAuth("login")} className="w-full">
                      Login
                    </Button>
                    <Button onClick={() => setShowAuth("signup")} variant="outline" className="w-full">
                      Sign Up
                    </Button>
                  </div>
                )}
              </>
            )}

            {showAuth === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Sign Up</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuth(null)
                      setError(null)
                    }}
                    className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <Label htmlFor="email-signup">Email</Label>
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password-signup">Password</Label>
                  <Input
                    id="password-signup"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {successMessage && (
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 whitespace-pre-wrap">
                    {successMessage}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Sign Up"}
                </Button>
                <p className="text-center text-sm text-[var(--color-muted)]">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setShowAuth("login")}
                    className="text-[var(--color-accent-blue)] hover:underline"
                  >
                    Login
                  </button>
                </p>
              </form>
            )}

            {showAuth === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Login</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAuth(null)
                      setError(null)
                    }}
                    className="text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <Label htmlFor="email-login">Email</Label>
                  <Input
                    id="email-login"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="password-login">Password</Label>
                  <Input
                    id="password-login"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {successMessage && (
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 whitespace-pre-wrap">
                    {successMessage}
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <p className="text-center text-sm text-[var(--color-muted)]">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setShowAuth("signup")}
                    className="text-[var(--color-accent-blue)] hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  )
}

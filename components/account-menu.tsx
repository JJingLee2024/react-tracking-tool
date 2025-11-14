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
    const sid = typeof window !== 'undefined' 
      ? (localStorage.getItem("analytics_session_id") || "No session")
      : "No session"
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
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || 
            (typeof window !== 'undefined' ? window.location.origin : ''),
        },
      })
      
      console.log("[v0] Sign up response:", { error, user: data.user })
      
      if (error) {
        if (error.message.includes("already") || error.message.includes("exists")) {
          setError(
            "This email is already registered but cannot login. " +
            "Please go to Supabase Dashboard → Authentication → Users, " +
            "find your email, and either: 1) Manually confirm it, OR 2) Delete it and sign up again."
          )
        } else {
          setError(error.message)
        }
        throw error
      }
      
      if (data.user && !data.session) {
        setSuccessMessage(
          "Account created but requires email confirmation. " +
          "To disable this: Go to Supabase Dashboard → Authentication → Providers → Email → Disable 'Confirm Email'. " +
          "Then delete your account and sign up again."
        )
        console.log("[v0] Email confirmation required for:", email)
      } else if (data.session) {
        const sid = typeof window !== 'undefined' ? localStorage.getItem("analytics_session_id") : null
        console.log("[v0] Session ID for binding:", sid)
        
        if (sid && data.user) {
          const { error: updateError } = await supabase
            .from("analytics_dashboards")
            .update({ creator_id: data.user.id })
            .eq("session_id", sid)
          
          console.log("[v0] Dashboard binding result:", { error: updateError })
        }
        
        console.log("[v0] Sign up completed successfully")
        setSuccessMessage("Account created and logged in successfully!")
        setShowAuth(null)
      }
      
      console.log("[v0] Sign up completed successfully")
      setEmail("")
      setPassword("")
    } catch (error: unknown) {
      console.error("[v0] Sign up error:", error)
      // Error already set above
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
        console.error("[v0] Login error:", error)
        if (error.message.includes("Invalid") || error.message.includes("credentials")) {
          setError(
            "Login Failed: Invalid Credentials\n\n" +
            "This error occurs when:\n" +
            "• Wrong password (most common)\n" +
            "• Account exists but email is not confirmed\n\n" +
            "📧 Fix Unconfirmed Account:\n" +
            "1. Open: https://supabase.com/dashboard\n" +
            "2. Select your project\n" +
            "3. Go to: Authentication → Users\n" +
            "4. Find: " + email + "\n" +
            "5. Click the user row to edit\n" +
            "6. Check: ✓ Email Confirmed\n" +
            "7. Click: Save\n" +
            "8. Return here and try logging in again\n\n" +
            "Alternative: Delete the user and sign up again"
          )
        } else if (error.message.includes("Email not confirmed")) {
          setError(
            "Email Not Confirmed\n\n" +
            "Your account exists but needs confirmation.\n\n" +
            "Fix this in Supabase Dashboard:\n" +
            "1. Go to: Authentication → Users\n" +
            "2. Find: " + email + "\n" +
            "3. Edit and check: ✓ Email Confirmed\n" +
            "4. Save and try again"
          )
        } else {
          setError("Login error: " + error.message)
        }
        return
      }
      
      const sid = typeof window !== 'undefined' ? localStorage.getItem("analytics_session_id") : null
      console.log("[v0] Session ID for binding:", sid)
      
      if (sid && data.user) {
        const { error: updateError } = await supabase
          .from("analytics_dashboards")
          .update({ creator_id: data.user.id })
          .eq("session_id", sid)
        
        console.log("[v0] Dashboard binding result:", { error: updateError })
      }
      
      console.log("[v0] Login completed successfully")
      setSuccessMessage("Logged in successfully!")
      setShowAuth(null)
      setEmail("")
      setPassword("")
    } catch (error: unknown) {
      console.error("[v0] Login error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsOpen(false)
  }

  return (
    <div className="fixed top-4 right-4 z-50">
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
                <div className="mb-4 border-b border-[var(--color-border)] pb-4 space-y-3">
                  <div>
                    <p className="text-xs text-[var(--color-muted)] mb-1">Session ID</p>
                    <p className="text-sm font-mono break-all">{sessionId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-muted)] mb-1">User ID</p>
                    <p className="text-sm font-medium">{user?.id || "Not logged in"}</p>
                  </div>
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
                      setSuccessMessage(null)
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
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
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
                    onClick={() => {
                      setShowAuth("login")
                      setError(null)
                      setSuccessMessage(null)
                    }}
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
                      setSuccessMessage(null)
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
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800 whitespace-pre-wrap max-h-40 overflow-y-auto">
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
                    onClick={() => {
                      setShowAuth("signup")
                      setError(null)
                      setSuccessMessage(null)
                    }}
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

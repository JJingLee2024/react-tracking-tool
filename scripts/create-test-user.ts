import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createTestUser() {
  const testEmail = "test@example.com"
  const testPassword = "test123456"

  console.log("[v0] Creating test user...")

  const { data, error } = await supabase.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true,
  })

  if (error) {
    console.error("[v0] Error creating test user:", error.message)
    return
  }

  console.log("[v0] Test user created successfully!")
  console.log("[v0] Email:", testEmail)
  console.log("[v0] Password:", testPassword)
  console.log("[v0] User ID:", data.user?.id)
}

createTestUser()

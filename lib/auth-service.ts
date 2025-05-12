// This is a mock implementation - in a real app, you would use a proper auth system
// like NextAuth.js, Clerk, or Auth0

// Mock user database
const users = [
  {
    id: "user-1",
    name: "Demo User",
    email: "demo@example.com",
    password: "password123", // In a real app, this would be hashed
  },
]

// Mock current user
let currentUser: any = null

export async function loginUser(email: string, password: string): Promise<any> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  // In a real app, you would set a session cookie or token
  const { password: _, ...userWithoutPassword } = user
  currentUser = userWithoutPassword

  return userWithoutPassword
}

export async function registerUser(name: string, email: string, password: string): Promise<any> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if user already exists
  if (users.some((u) => u.email === email)) {
    throw new Error("User already exists")
  }

  // Create new user
  const newUser = {
    id: `user-${users.length + 1}`,
    name,
    email,
    password, // In a real app, this would be hashed
  }

  users.push(newUser)

  // In a real app, you would set a session cookie or token
  const { password: _, ...userWithoutPassword } = newUser
  currentUser = userWithoutPassword

  return userWithoutPassword
}

export async function logoutUser(): Promise<void> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app, you would clear the session cookie or token
  currentUser = null
}

export async function getCurrentUser(): Promise<any> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  return currentUser
}

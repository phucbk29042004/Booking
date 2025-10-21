import React, { createContext, useState, useContext, ReactNode, useEffect } from "react"
import { getTaiKhoanId, removeTaiKhoanId } from "../../services"

interface User {
  id: string
  name: string
  email: string
  phone: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
  loginWithId: (id: number, email?: string) => void
  logout: () => void
  isLoggedIn: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data để test
const MOCK_USERS = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "test@test.com",
    password: "123456",
    phone: "0901234567",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "user@test.com",
    password: "password",
    phone: "0907654321",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on app start
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const taiKhoanId = await getTaiKhoanId()
      if (taiKhoanId) {
        // User is logged in, set basic user info
        setUser({
          id: taiKhoanId.toString(),
          name: "User",
          email: "user@example.com",
          phone: "",
        })
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = (email: string, password: string): boolean => {
    // This function is now handled by LoginScreen directly
    // Just return true to indicate login was successful
    return true
  }

  const loginWithId = (id: number, email?: string) => {
    setUser({
      id: id.toString(),
      name: "User",
      email: email || "user@example.com",
      phone: "",
    })
  }

  const logout = async () => {
    try {
      await removeTaiKhoanId()
      setUser(null)
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithId,
        logout,
        isLoggedIn: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


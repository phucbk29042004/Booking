import React, { createContext, useState, useContext, ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  phone: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => boolean
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

  const login = (email: string, password: string): boolean => {
    // Tìm user trong mock data
    const foundUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    )

    if (foundUser) {
      setUser({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        phone: foundUser.phone,
      })
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
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


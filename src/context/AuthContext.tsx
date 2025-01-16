import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { User, USERS } from '../types/user'

interface AuthContextType {
  currentUser: User | null
  login: (username: string) => boolean
  logout: () => void
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Kayıtlı kullanıcıyı al
const getSavedUser = (): User | null => {
  const saved = localStorage.getItem('currentUser')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return null
    }
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => getSavedUser())

  // Kullanıcı değiştiğinde localStorage'a kaydet
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('currentUser')
    }
  }, [currentUser])

  const login = (username: string): boolean => {
    const user = USERS.find(u => u.username === username.toLowerCase())
    if (user) {
      setCurrentUser(user)
      return true
    }
    return false
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const isAdmin = () => {
    return currentUser?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 
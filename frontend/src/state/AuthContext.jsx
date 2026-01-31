import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setAuthToken } from '../api/client'

const AuthContext = createContext(null)

const STORAGE_KEY = 'vu_auth'

function readStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const saved = readStoredSession()
    if (saved?.token) setToken(saved.token)
    if (saved?.user) setUser(saved.user)
  }, [])

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  const setSession = (nextToken, nextUser) => {
    setToken(nextToken)
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }))
  }

  const signOut = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
    setAuthToken(null)
    window.location.href = '/'
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      setSession,
      signOut,
    }),
    [token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider />')
  return ctx
}

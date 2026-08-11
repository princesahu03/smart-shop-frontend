import { createContext, useContext,
  useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      // Token localStorage se lo:
      const token = localStorage
        .getItem('token')

      if (token) {
        api.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${token}`
      }

      const res = await api.get('/auth/me')
      setUser(res.data.data)
    } catch {
      setUser(null)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', {
      email, password
    })

    // Token save karo:
    const token = res.data.data.token
    if (token) {
      localStorage.setItem('token', token)
      api.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`
    }

    setUser(res.data.data.user)
    return res.data
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch {}

    localStorage.removeItem('token')
    delete api.defaults.headers.common[
      'Authorization'
    ]
    setUser(null)
  }

  const register = async (data) => {
    const res = await api.post(
      '/auth/register', data
    )
    return res.data
  }

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, logout, register
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () =>
  useContext(AuthContext)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/Auth.Context'

import Suppliers from './pages/Suppliers'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Transactions from './pages/Transaction'
import Analysis from './pages/Analysis'
import Sidebar from './components/Sidebar'
import MobileNav from './components/MobileNav'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'var(--bg)'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '40px' }}>🛒</div>
        <p style={{ 
          color: 'var(--text-muted)',
          marginTop: '12px' 
        }}>
          Loading Smart Shop...
        </p>
      </div>
    </div>
  )

  return user ? children : 
    <Navigate to="/login" />
}

function Layout({ children }) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg)'
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        overflow: 'auto',
        padding: '24px',
        paddingBottom: '80px'
      }}>
        <div style={{ 
          maxWidth: '1200px',
          margin: '0 auto'
        }}
          className="fade-in">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/" /> : <Login />
      } />
      <Route path="/register" element={
        user ? <Navigate to="/" /> : <Register />
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/products" element={
        <ProtectedRoute>
          <Layout><Products /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/customers" element={
        <ProtectedRoute>
          <Layout><Customers /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/transactions" element={
        <ProtectedRoute>
          <Layout><Transactions /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/analysis" element={
        <ProtectedRoute>
          <Layout><Analysis /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/suppliers" element={
      <ProtectedRoute>
      <Layout><Suppliers /></Layout>
      </ProtectedRoute>
      } />
    
    
    </Routes>

    

  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontFamily: 'Inter',
              fontSize: '14px'
            }
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
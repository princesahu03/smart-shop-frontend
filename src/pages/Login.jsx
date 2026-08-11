import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/Auth.Context.jsx'
import toast from 'react-hot-toast'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '', password: ''
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(formData.email, formData.password)
      toast.success('Welcome back! 👋')
      navigate('/')
    } catch (err) {
      toast.error(
        err.response?.data?.message || 
        'Login failed!'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1E3A5F 0%, #2D5186 50%, #1E3A5F 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-100px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'rgba(245,158,11,0.08)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-150px',
        left: '-100px',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
        pointerEvents: 'none'
      }} />

      <div style={{
        background: 'white',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        animation: 'fadeIn 0.4s ease'
      }}>
        {/* Logo */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px' 
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #1E3A5F, #2D5186)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(30,58,95,0.3)'
          }}>
            🛒
          </div>
          <h1 style={{
            fontSize: '26px',
            fontWeight: '700',
            color: 'var(--text)',
            fontFamily: 'Space Grotesk'
          }}>
            Smart Shop
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '6px'
          }}>
            Login to manage your shop
          </p>
        </div>

        <form onSubmit={handleSubmit}
          style={{ display: 'flex', 
            flexDirection: 'column', 
            gap: '16px' }}>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '6px'
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={e => setFormData({
                ...formData, 
                email: e.target.value
              })}
              placeholder="your@email.com"
              required
              className="input"
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={e => setFormData({
                ...formData, 
                password: e.target.value
              })}
              placeholder="••••••••"
              required
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              marginTop: '8px',
              padding: '13px',
              fontSize: '15px'
            }}
          >
            {loading ? '⏳ Logging in...' : 
              '→ Login to Dashboard'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--text-muted)',
          marginTop: '24px'
        }}>
          New shop?{' '}
          <Link to="/register" style={{
            color: 'var(--primary)',
            fontWeight: '600',
            textDecoration: 'none'
          }}>
            Register here →
          </Link>
        </p>
      </div>
    </div>
  )
}
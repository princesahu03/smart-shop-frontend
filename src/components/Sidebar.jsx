import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/Auth.Context'
import toast from 'react-hot-toast'

const menuItems = [
  { path: '/', icon: '⊞', label: 'Dashboard' },
  { path: '/products', icon: '◫', label: 'Products' },
  { path: '/customers', icon: '◎', label: 'Customers' },
  { path: '/transactions', icon: '≋', label: 'Sales' },
  { path: '/suppliers', icon: '🏪', label: 'Suppliers' },
  { path: '/analysis', icon: '∿', label: 'Analysis' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logged out!')
      navigate('/login')
    } catch {
      toast.error('Logout failed!')
    }
  }

  return (
    <aside style={{
      width: '240px',
      background: 'var(--primary)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--accent)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0
          }}>
            🛒
          </div>
          <div>
            <div style={{
              color: 'white',
              fontWeight: '700',
              fontSize: '16px',
              fontFamily: 'Space Grotesk'
            }}>
              Smart Shop
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.5)',
              fontSize: '11px',
              marginTop: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '140px'
            }}>
              {user?.shopName}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{
        flex: 1,
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '11px 14px',
              borderRadius: '12px',
              textDecoration: 'none',
              color: isActive ? 
                'white' : 
                'rgba(255,255,255,0.6)',
              background: isActive ? 
                'rgba(255,255,255,0.12)' : 
                'transparent',
              fontWeight: isActive ? '600' : '500',
              fontSize: '14px',
              transition: 'all 0.15s',
              borderLeft: isActive ? 
                '3px solid var(--accent)' : 
                '3px solid transparent',
            })}
          >
            <span style={{ fontSize: '18px' }}>
              {item.icon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{
        padding: '16px 12px',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.08)',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '700',
            fontSize: '14px',
            flexShrink: 0
          }}>
            {user?.ownerName?.[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              color: 'white',
              fontSize: '13px',
              fontWeight: '600',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.ownerName}
            </div>
            <div style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '9px',
            borderRadius: '10px',
            background: 'rgba(239,68,68,0.15)',
            color: '#FCA5A5',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
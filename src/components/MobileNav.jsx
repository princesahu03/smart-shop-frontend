import { NavLink } from 'react-router-dom'

const items = [
  { path: '/', icon: '⊞', label: 'Home' },
  { path: '/products', icon: '◫', label: 'Products' },
  { path: '/transactions', icon: '≋', label: 'Sales' },
  { path: '/suppliers', icon: '🏪', label: 'Suppliers' }, 
  { path: '/analysis', icon: '∿', label: 'Analysis' },
]



export default function MobileNav() {
  return (
    <nav style={{
      display: 'none',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: 'white',
      borderTop: '1px solid #E2E8F0',
      padding: '8px 0',
      zIndex: 40,
    }}
    className="mobile-nav">
      {items.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          style={({ isActive }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '3px',
            flex: 1,
            textDecoration: 'none',
            color: isActive ? 
              'var(--primary)' : '#94A3B8',
            fontSize: '10px',
            fontWeight: isActive ? '600' : '400',
          })}

          

        >
          <span style={{ fontSize: '22px' }}>
            {item.icon}
          </span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
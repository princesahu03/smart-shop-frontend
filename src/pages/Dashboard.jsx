import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/Auth.Context'

export default function Dashboard() {
  const { user } = useAuth()
  const [alerts, setAlerts] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [alertsRes, analysisRes] =
        await Promise.all([
          api.get('/products/alerts'),
          api.get('/transactions/analysis/monthly')
        ])
      setAlerts(alertsRes.data.data)
      setAnalysis(analysisRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <div style={{ fontSize: '40px' }}>🛒</div>
      <p style={{ color: 'var(--text-muted)' }}>
        Loading dashboard...
      </p>
    </div>
  )

  const stats = [
    {
      label: 'Total Sales',
      value: `₹${(analysis?.summary
        ?.totalSales || 0)
        .toLocaleString('en-IN')}`,
      icon: '💰',
      color: '#10B981',
      bg: '#ECFDF5',
      link: '/transactions'
    },
    {
      label: 'Total Udhar',
      value: `₹${(analysis?.summary
        ?.totalUdhar || 0)
        .toLocaleString('en-IN')}`,
      icon: '📋',
      color: '#F97316',
      bg: '#FFF7ED',
      link: '/customers'
    },
    {
      label: 'Low Stock',
      value: alerts?.lowStockProducts
        ?.length || 0,
      icon: '⚠️',
      color: '#F59E0B',
      bg: '#FFFBEB',
      link: '/products'
    },
    {
      label: 'Expiring Soon',
      value: alerts?.expiringProducts
        ?.length || 0,
      icon: '📅',
      color: '#EF4444',
      bg: '#FEF2F2',
      link: '/products'
    },
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>

    {/* Time based greeting */}
    {(() => {
  const hour = new Date().getHours()
  
  let greeting, emoji
  
  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning'
    emoji = '🌅'
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon'
    emoji = '☀️'
  } else if (hour >= 17 && hour < 21) {
    greeting = 'Good Evening'
    emoji = '🌆'
  } else {
    greeting = 'Good Night'
    emoji = '🌙'
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div>
        <h1 style={{
          fontSize: '26px',
          fontWeight: '700',
          color: 'var(--text)',
          fontFamily: 'Space Grotesk'
        }}>
          {emoji} {greeting},{' '}
          {user?.ownerName?.split(' ')[0]}! 👋
        </h1>
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '14px',
          marginTop: '4px'
        }}>
          {user?.shopName} —{' '}
          {new Date().toLocaleDateString(
            'en-IN', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }
          )}
          {' • '}
          {new Date().toLocaleTimeString(
            'en-IN', {
              hour: '2-digit',
              minute: '2-digit'
            }
          )}
        </p>
      </div>
      <Link to="/transactions"
        className="btn-primary"
        style={{ textDecoration: 'none' }}>
        + New Sale
      </Link>
    </div>
  )
  })()}

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 
          'repeat(4, 1fr)',
        gap: '16px'
      }}
        className="grid-4">
        {stats.map((s, i) => (
          <Link key={i} to={s.link}
            style={{ textDecoration: 'none' }}>
            <div className="card" style={{
              padding: '20px',
              transition: 'all 0.2s',
              cursor: 'pointer',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 
                  'translateY(-2px)'
                e.currentTarget.style.boxShadow = 
                  '0 8px 24px rgba(0,0,0,0.08)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 
                  'translateY(0)'
                e.currentTarget.style.boxShadow = 
                  '0 1px 3px rgba(0,0,0,0.04)'
              }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: s.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                marginBottom: '16px'
              }}>
                {s.icon}
              </div>
              <div style={{
                fontSize: '26px',
                fontWeight: '700',
                color: 'var(--text)',
                fontFamily: 'Space Grotesk',
                lineHeight: 1
              }}>
                {s.value}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '6px',
                fontWeight: '500'
              }}>
                {s.label}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alerts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px'
      }}
        className="grid-2">

        {/* Low Stock Alert */}
        <div className="card" style={{
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text)'
            }}>
              ⚠️ Low Stock Alerts
            </h2>
            <Link to="/products"
              style={{
                fontSize: '12px',
                color: 'var(--primary)',
                fontWeight: '600',
                textDecoration: 'none'
              }}>
              View all →
            </Link>
          </div>

          {!alerts?.lowStockProducts?.length ? (
            <div style={{
              textAlign: 'center',
              padding: '24px 0',
              color: 'var(--text-muted)'
            }}>
              <div style={{ fontSize: '32px' }}>
                ✅
              </div>
              <p style={{
                fontSize: '13px',
                marginTop: '8px'
              }}>
                All stocks are good!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {alerts.lowStockProducts
                .slice(0, 5).map(p => (
                <div key={p._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: '#FFF7ED',
                  borderRadius: '10px',
                  border: '1px solid #FED7AA'
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    {p.name}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#F97316',
                    fontWeight: '700',
                    background: 'white',
                    padding: '3px 10px',
                    borderRadius: '20px'
                  }}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring Products */}
        <div className="card" style={{
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '700',
              color: 'var(--text)'
            }}>
              📅 Expiring Soon
            </h2>
            <Link to="/products"
              style={{
                fontSize: '12px',
                color: 'var(--primary)',
                fontWeight: '600',
                textDecoration: 'none'
              }}>
              View all →
            </Link>
          </div>

          {!alerts?.expiringProducts?.length ? (
            <div style={{
              textAlign: 'center',
              padding: '24px 0',
              color: 'var(--text-muted)'
            }}>
              <div style={{ fontSize: '32px' }}>
                ✅
              </div>
              <p style={{
                fontSize: '13px',
                marginTop: '8px'
              }}>
                No products expiring soon!
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {alerts.expiringProducts
                .slice(0, 5).map(p => (
                <div key={p._id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: '#FEF2F2',
                  borderRadius: '10px',
                  border: '1px solid #FECACA'
                }}>
                  <span style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--text)'
                  }}>
                    {p.name}
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#EF4444',
                    fontWeight: '700',
                    background: 'white',
                    padding: '3px 10px',
                    borderRadius: '20px'
                  }}>
                    {new Date(p.expiryDate)
                      .toLocaleDateString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card" style={{
        padding: '20px'
      }}>
        <h2 style={{
          fontSize: '15px',
          fontWeight: '700',
          color: 'var(--text)',
          marginBottom: '16px'
        }}>
          ⚡ Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 
            'repeat(4, 1fr)',
          gap: '12px'
        }}
          className="grid-4">
          {[
            { icon: '📦', label: 'Add Product',
              link: '/products', 
              color: '#EFF6FF' },
            { icon: '👥', label: 'Add Customer',
              link: '/customers', 
              color: '#F0FDF4' },
            { icon: '🧾', label: 'New Sale',
              link: '/transactions', 
              color: '#FFFBEB' },
            { icon: '📈', label: 'View Analysis',
              link: '/analysis', 
              color: '#FDF4FF' },
          ].map((action, i) => (
            <Link key={i} to={action.link}
              style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '16px',
                background: action.color,
                borderRadius: '14px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: '1px solid transparent'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 
                    'scale(1.02)'
                  e.currentTarget.style
                    .borderColor = 
                    'var(--border)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 
                    'scale(1)'
                  e.currentTarget.style
                    .borderColor = 
                    'transparent'
                }}>
                <div style={{ fontSize: '28px' }}>
                  {action.icon}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: 'var(--text)',
                  marginTop: '8px'
                }}>
                  {action.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
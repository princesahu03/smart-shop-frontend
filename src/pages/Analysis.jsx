import { useState, useEffect } from 'react'
import api from '../api/axios'
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'

const COLORS = ['#1E3A5F', '#10B981',
  '#F59E0B', '#EF4444']

const months = [
  'January', 'February', 'March',
  'April', 'May', 'June', 'July',
  'August', 'September', 'October',
  'November', 'December'
]

export default function Analysis() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [month, setMonth] = useState(
    new Date().getMonth() + 1
  )
  const [year, setYear] = useState(
    new Date().getFullYear()
  )

  useEffect(() => {
    fetchAnalysis()
  }, [month, year])

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      const res = await api.get(
        '/transactions/analysis/monthly',
        { params: { month, year } }
      )
      setData(res.data.data)
    } catch {
      console.error('Failed!')
    } finally {
      setLoading(false)
    }
  }

  const pieData = data ? [
    {
      name: 'Cash Sales',
      value: data.summary.totalSales
    },
    {
      name: 'Udhar',
      value: data.summary.totalUdhar
    },
    {
      name: 'Recovered',
      value: data.summary.totalPayments
    },
  ].filter(d => d.value > 0) : []

  const summaryCards = data ? [
    {
      label: 'Total Sales',
      value: `₹${data.summary.totalSales
        .toLocaleString('en-IN')}`,
      icon: '💰',
      bg: '#DCFCE7',
      color: '#16A34A'
    },
    {
      label: 'Total Udhar',
      value: `₹${data.summary.totalUdhar
        .toLocaleString('en-IN')}`,
      icon: '📋',
      bg: '#FEF3C7',
      color: '#D97706'
    },
    {
      label: 'Recovered',
      value: `₹${data.summary.totalPayments
        .toLocaleString('en-IN')}`,
      icon: '✅',
      bg: '#DBEAFE',
      color: '#2563EB'
    },
    {
      label: 'Net Revenue',
      value: `₹${data.summary.netRevenue
        .toLocaleString('en-IN')}`,
      icon: '📊',
      bg: '#F3E8FF',
      color: '#7C3AED'
    },
  ] : []

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '24px',
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
            📈 Monthly Analysis
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            Sales & revenue insights
          </p>
        </div>

        {/* Month + Year Selector */}
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <select
            value={month}
            onChange={e =>
              setMonth(parseInt(e.target.value))}
            className="input"
            style={{ width: 'auto' }}
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={e =>
              setYear(parseInt(e.target.value))}
            className="input"
            style={{ width: 'auto' }}
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '40px' }}>📊</div>
          <p style={{ marginTop: '12px' }}>
            Loading analysis...
          </p>
        </div>
      ) : !data ? (
        <div style={{
          textAlign: 'center',
          padding: '80px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '48px' }}>📊</div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            No data for this month!
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>

          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px'
          }}
            className="grid-4">
            {summaryCards.map((card, i) => (
              <div key={i} className="card"
                style={{ padding: '20px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: card.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                  marginBottom: '14px'
                }}>
                  {card.icon}
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: card.color,
                  fontFamily: 'Space Grotesk',
                  lineHeight: 1
                }}>
                  {card.value}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  marginTop: '6px',
                  fontWeight: '500'
                }}>
                  {card.label}
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px'
          }}
            className="grid-2">

            {/* Daily Sales */}
            <div className="card"
              style={{ padding: '20px' }}>
              <h2 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '20px'
              }}>
                📅 Daily Sales
              </h2>
              {data.dailySales.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  color: 'var(--text-muted)'
                }}>
                  <p>No sales this month!</p>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={220}>
                  <LineChart data={data.dailySales}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#F1F5F9"
                    />
                    <XAxis
                      dataKey="_id"
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={v => `₹${v}`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={v =>
                        [`₹${v}`, 'Sales']}
                      labelFormatter={l =>
                        `Day ${l}`}
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalSales"
                      stroke="#1E3A5F"
                      strokeWidth={2.5}
                      dot={{
                        fill: '#1E3A5F',
                        r: 4
                      }}
                      activeDot={{ r: 6 }}
                      name="Sales"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Revenue Pie */}
            <div className="card"
              style={{ padding: '20px' }}>
              <h2 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '20px'
              }}>
                💰 Revenue Breakdown
              </h2>
              {pieData.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  color: 'var(--text-muted)'
                }}>
                  <p>No data available!</p>
                </div>
              ) : (
                <ResponsiveContainer
                  width="100%"
                  height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={COLORS[i %
                            COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={v =>
                        [`₹${v.toLocaleString(
                          'en-IN'
                        )}`]}
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12px'
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={value => (
                        <span style={{
                          fontSize: '12px',
                          color: 'var(--text)'
                        }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Products Bar Chart */}
          {data.topProducts.length > 0 && (
            <div className="card"
              style={{ padding: '20px' }}>
              <h2 style={{
                fontSize: '15px',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '20px'
              }}>
                🏆 Top Selling Products
              </h2>
              <ResponsiveContainer
                width="100%"
                height={260}>
                <BarChart
                  data={data.topProducts.map(p => ({
                    name: p.productDetails?.[0]
                      ?.name || 'Unknown',
                    revenue: p.totalRevenue,
                    qty: p.totalQuantity
                  }))}
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F1F5F9"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickFormatter={v => `₹${v}`}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v, name) => [
                      name === 'revenue'
                        ? `₹${v.toLocaleString(
                            'en-IN'
                          )}`
                        : v,
                      name === 'revenue'
                        ? 'Revenue'
                        : 'Qty Sold'
                    ]}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px'
                    }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="#1E3A5F"
                    name="Revenue"
                    radius={[6, 6, 0, 0]}
                  />
                  <Bar
                    dataKey="qty"
                    fill="#10B981"
                    name="Qty Sold"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Top Products Table */}
          {data.topProducts.length > 0 && (
            <div className="card"
              style={{ overflow: 'hidden' }}>
              <div style={{
                padding: '20px',
                borderBottom: '1px solid var(--border)'
              }}>
                <h2 style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'var(--text)'
                }}>
                  🏆 Product Performance
                </h2>
              </div>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{
                    background: '#F8FAFC'
                  }}>
                    {['Rank', 'Product',
                      'Qty Sold', 'Revenue']
                      .map(h => (
                      <th key={h} style={{
                        padding: '12px 20px',
                        textAlign: 'left',
                        color: 'var(--text-muted)',
                        fontWeight: '600',
                        fontSize: '11px',
                        textTransform: 'uppercase'
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr key={i}
                      className="table-row"
                      style={{
                        borderTop:
                          '1px solid var(--border)'
                      }}>
                      <td style={{
                        padding: '14px 20px'
                      }}>
                        <span style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: i === 0
                            ? '#FEF3C7'
                            : i === 1
                            ? '#F1F5F9'
                            : '#FEF9F0',
                          color: i === 0
                            ? '#D97706'
                            : i === 1
                            ? '#64748B'
                            : '#92400E',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '12px'
                        }}>
                          {i + 1}
                        </span>
                      </td>
                      <td style={{
                        padding: '14px 20px',
                        fontWeight: '600',
                        color: 'var(--text)'
                      }}>
                        {p.productDetails?.[0]
                          ?.name || 'Unknown'}
                      </td>
                      <td style={{
                        padding: '14px 20px',
                        color: 'var(--text-muted)'
                      }}>
                        {p.totalQuantity} units
                      </td>
                      <td style={{
                        padding: '14px 20px',
                        fontWeight: '700',
                        color: '#10B981',
                        fontSize: '15px',
                        fontFamily: 'Space Grotesk'
                      }}>
                        ₹{p.totalRevenue
                          .toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
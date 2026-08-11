import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { generateBill } from '../components/BillGenerator'
import { useAuth } from '../context/Auth.Context'

export default function Transactions() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterType, setFilterType] = useState('')

  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    fetchTransactions()
    fetchProducts()
    fetchCustomers()
  }, [filterType])

  const fetchTransactions = async () => {
    try {
      const params = {}
      if (filterType) params.type = filterType
      const res = await api.get(
        '/transactions', { params }
      )
      setTransactions(res.data.data.transactions)
    } catch {
      toast.error('Failed to fetch!')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products')
      setProducts(res.data.data.products)
    } catch {}
  }

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers')
      setCustomers(res.data.data)
    } catch {}
  }

  const addToCart = () => {
    if (!selectedProduct) return
    const product = products.find(
      p => p._id === selectedProduct
    )
    if (!product) return

    const existing = cart.find(
      c => c.productId === selectedProduct
    )

    if (existing) {
      setCart(cart.map(c =>
        c.productId === selectedProduct
          ? {
              ...c,
              quantity: c.quantity + parseInt(quantity),
              total: (c.quantity + parseInt(quantity)) *
                product.sellingPrice
            }
          : c
      ))
    } else {
      setCart([...cart, {
        productId: selectedProduct,
        name: product.name,
        price: product.sellingPrice,
        quantity: parseInt(quantity),
        total: product.sellingPrice * parseInt(quantity)
      }])
    }

    setSelectedProduct('')
    setQuantity(1)
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(c => c.productId !== productId))
  }

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.total, 0
  )

  const handleSale = async (e) => {
    e.preventDefault()
    if (cart.length === 0) {
      toast.error('Add products first!')
      return
    }

    try {
      await api.post('/transactions', {
        products: cart.map(c => ({
          productId: c.productId,
          quantity: c.quantity
        })),
        customerId: selectedCustomer || null,
        paymentMethod,
        paidAmount: paidAmount || totalAmount,
        notes
      })

      toast.success('Sale recorded! 🎉')
      setShowModal(false)
      resetSale()
      fetchTransactions()
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Sale failed!'
      )
    }
  }

  const resetSale = () => {
    setCart([])
    setSelectedProduct('')
    setQuantity(1)
    setPaymentMethod('cash')
    setSelectedCustomer('')
    setPaidAmount('')
    setNotes('')
  }

  const handleDownloadBill = (transaction) => {
    generateBill({
      transaction,
      shopInfo: {
        shopName: user?.shopName,
        phone: user?.phone,
        email: user?.email
      },
      customerName: transaction.customer?.name ||
        'Walk-in Customer'
    })
    toast.success('Bill downloaded! 🧾')
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'sale':
        return {
          bg: '#DCFCE7',
          color: '#16A34A'
        }
      case 'udhar':
        return {
          bg: '#FEF3C7',
          color: '#D97706'
        }
      case 'udhar_payment':
        return {
          bg: '#DBEAFE',
          color: '#2563EB'
        }
      default:
        return {
          bg: '#F1F5F9',
          color: '#64748B'
        }
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'sale': return '💰 Sale'
      case 'udhar': return '📋 Udhar'
      case 'udhar_payment': return '✅ Payment'
      default: return type
    }
  }

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
            🧾 Transactions
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {transactions.length} transactions
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + New Sale
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: '', label: 'All' },
          { value: 'sale', label: '💰 Sales' },
          { value: 'udhar', label: '📋 Udhar' },
          { value: 'udhar_payment', label: '✅ Payments' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterType(f.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.15s',
              background: filterType === f.value
                ? 'var(--primary)'
                : 'white',
              color: filterType === f.value
                ? 'white'
                : 'var(--text-muted)',
              border: filterType === f.value
                ? '1.5px solid var(--primary)'
                : '1.5px solid var(--border)'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: 'var(--text-muted)'
        }}>
          Loading...
        </div>
      ) : transactions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 0',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '56px' }}>🧾</div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            No transactions yet!
          </p>
          <p style={{ fontSize: '13px', marginTop: '6px' }}>
            Create your first sale
          </p>
        </div>
      ) : (
        <div className="card" style={{
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px'
            }}>
              <thead>
                <tr style={{
                  background: '#F8FAFC',
                  borderBottom: '1px solid var(--border)'
                }}>
                  {['Type', 'Customer', 'Products',
                    'Total', 'Paid', 'Remaining',
                    'Method', 'Date', 'Bill']
                    .map(h => (
                    <th key={h} style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      color: 'var(--text-muted)',
                      fontWeight: '600',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap'
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => {
                  const typeStyle = getTypeColor(t.type)
                  return (
                    <tr key={t._id}
                      className="table-row"
                      style={{
                        borderBottom:
                          '1px solid var(--border)'
                      }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '600',
                          background: typeStyle.bg,
                          color: typeStyle.color,
                          whiteSpace: 'nowrap'
                        }}>
                          {getTypeLabel(t.type)}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        color: 'var(--text-muted)',
                        whiteSpace: 'nowrap'
                      }}>
                        {t.customer?.name || '—'}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        maxWidth: '180px'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {t.products?.slice(0, 2)
                            .map(p =>
                              `${p.product?.name ||
                                'Item'} x${p.quantity}`
                            ).join(', ')}
                          {t.products?.length > 2 &&
                            ` +${t.products.length - 2}`}
                        </div>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        fontWeight: '700',
                        color: 'var(--text)',
                        whiteSpace: 'nowrap'
                      }}>
                        ₹{t.totalAmount
                          ?.toLocaleString('en-IN')}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        color: '#10B981',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        ₹{t.paidAmount
                          ?.toLocaleString('en-IN')}
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        whiteSpace: 'nowrap'
                      }}>
                        {t.remainingAmount > 0 ? (
                          <span style={{
                            color: '#EF4444',
                            fontWeight: '700'
                          }}>
                            ₹{t.remainingAmount
                              ?.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span style={{
                            color: '#10B981',
                            fontWeight: '600'
                          }}>
                            ✅ Clear
                          </span>
                        )}
                      </td>
                      <td style={{
                        padding: '12px 16px'
                      }}>
                        <span style={{
                          padding: '3px 10px',
                          background: '#F1F5F9',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: 'var(--text-muted)',
                          textTransform: 'uppercase'
                        }}>
                          {t.paymentMethod}
                        </span>
                      </td>
                      <td style={{
                        padding: '12px 16px',
                        color: 'var(--text-muted)',
                        fontSize: '12px',
                        whiteSpace: 'nowrap'
                      }}>
                        {new Date(t.createdAt)
                          .toLocaleDateString('en-IN')}
                      </td>
                      <td style={{
                        padding: '12px 16px'
                      }}>
                        <button
                          onClick={() =>
                            handleDownloadBill(t)}
                          style={{
                            padding: '5px 12px',
                            background: '#EFF6FF',
                            color: 'var(--primary)',
                            border: '1px solid #BFDBFE',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          🧾 Bill
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Sale Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{
            maxWidth: '600px',
            padding: '28px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk',
                color: 'var(--text)'
              }}>
                🧾 New Sale
              </h2>
              <button
                onClick={() => {
                  setShowModal(false)
                  resetSale()
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Add to Cart */}
            <div style={{
              background: '#F8FAFC',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <p style={{
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--text)',
                marginBottom: '10px'
              }}>
                Add Products
              </p>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <select
                  value={selectedProduct}
                  onChange={e =>
                    setSelectedProduct(e.target.value)}
                  className="input"
                  style={{ flex: 1, fontSize: '13px' }}
                >
                  <option value="">
                    Select product...
                  </option>
                  {products.map(p => (
                    <option key={p._id} value={p._id}>
                      {p.name} — ₹{p.sellingPrice}
                      (Stock: {p.stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={quantity}
                  onChange={e =>
                    setQuantity(e.target.value)}
                  min="1"
                  className="input"
                  style={{ width: '80px' }}
                />
                <button
                  type="button"
                  onClick={addToCart}
                  className="btn-accent"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  + Add
                </button>
              </div>
            </div>

            {/* Cart */}
            {cart.length > 0 && (
              <div style={{
                border: '1px solid var(--border)',
                borderRadius: '14px',
                overflow: 'hidden',
                marginBottom: '16px'
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '13px'
                }}>
                  <thead>
                    <tr style={{
                      background: '#F8FAFC',
                      borderBottom:
                        '1px solid var(--border)'
                    }}>
                      {['Product', 'Price',
                        'Qty', 'Total', '']
                        .map(h => (
                        <th key={h} style={{
                          padding: '8px 12px',
                          textAlign: 'left',
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          fontWeight: '600',
                          textTransform: 'uppercase'
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map(item => (
                      <tr key={item.productId}
                        style={{
                          borderBottom:
                            '1px solid var(--border)'
                        }}>
                        <td style={{
                          padding: '10px 12px',
                          fontWeight: '600'
                        }}>
                          {item.name}
                        </td>
                        <td style={{
                          padding: '10px 12px',
                          color: 'var(--text-muted)'
                        }}>
                          ₹{item.price}
                        </td>
                        <td style={{
                          padding: '10px 12px',
                          color: 'var(--text-muted)'
                        }}>
                          {item.quantity}
                        </td>
                        <td style={{
                          padding: '10px 12px',
                          fontWeight: '700',
                          color: '#10B981'
                        }}>
                          ₹{item.total}
                        </td>
                        <td style={{
                          padding: '10px 12px'
                        }}>
                          <button
                            onClick={() =>
                              removeFromCart(
                                item.productId
                              )}
                            style={{
                              background: '#FEE2E2',
                              color: '#EF4444',
                              border: 'none',
                              borderRadius: '6px',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Total */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  background: '#F8FAFC',
                  borderTop: '1px solid var(--border)'
                }}>
                  <span style={{
                    fontWeight: '700',
                    color: 'var(--text)'
                  }}>
                    Total Amount:
                  </span>
                  <span style={{
                    fontWeight: '800',
                    fontSize: '18px',
                    color: 'var(--primary)'
                  }}>
                    ₹{totalAmount
                      .toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}

            {/* Payment Form */}
            <form onSubmit={handleSale}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text)'
                  }}>
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e =>
                      setPaymentMethod(e.target.value)}
                    className="input"
                  >
                    <option value="cash">💵 Cash</option>
                    <option value="upi">📱 UPI</option>
                    <option value="card">💳 Card</option>
                    <option value="udhar">
                      📋 Udhar
                    </option>
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text)'
                  }}>
                    Customer (Optional)
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={e =>
                      setSelectedCustomer(e.target.value)}
                    className="input"
                  >
                    <option value="">
                      Walk-in Customer
                    </option>
                    {customers.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} — {c.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {paymentMethod === 'udhar' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text)'
                  }}>
                    Partial Payment ₹
                    (0 for full udhar)
                  </label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={e =>
                      setPaidAmount(e.target.value)}
                    placeholder="Enter amount paid..."
                    min="0"
                    max={totalAmount}
                    className="input"
                  />
                  {paidAmount !== '' && (
                    <div style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      background: '#FEF3C7',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#D97706',
                      fontWeight: '600'
                    }}>
                      Udhar: ₹{totalAmount -
                        parseInt(paidAmount || 0)}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text)'
                }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any notes..."
                  className="input"
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetSale()
                  }}
                  style={{
                    flex: 1,
                    padding: '13px',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px',
                    color: 'var(--text-muted)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={cart.length === 0}
                  style={{
                    flex: 2,
                    padding: '13px',
                    background: cart.length === 0
                      ? '#94A3B8'
                      : '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: cart.length === 0
                      ? 'not-allowed'
                      : 'pointer',
                    fontWeight: '700',
                    fontSize: '15px'
                  }}
                >
                  {cart.length === 0
                    ? 'Add products first'
                    : `✓ Record Sale — ₹${totalAmount
                        .toLocaleString('en-IN')}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
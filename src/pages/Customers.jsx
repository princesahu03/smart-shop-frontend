import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] =
    useState(false)
  const [showDetails, setShowDetails] =
    useState(false)
  const [selectedCustomer, setSelectedCustomer] =
    useState(null)
  const [customerDetails, setCustomerDetails] =
    useState(null)
  const [search, setSearch] = useState('')
  const [filterUdhar, setFilterUdhar] =
    useState(false)
  const [paymentAmount, setPaymentAmount] =
    useState('')
  const [paymentNotes, setPaymentNotes] =
    useState('')

  const [formData, setFormData] = useState({
    name: '', phone: '', address: ''
  })

  useEffect(() => {
    fetchCustomers()
  }, [search, filterUdhar])

  const fetchCustomers = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (filterUdhar) params.hasUdhar = true
      const res = await api.get(
        '/customers', { params }
      )
      setCustomers(res.data.data)
    } catch {
      toast.error('Failed to fetch customers!')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/customers', formData)
      toast.success('Customer added! 🎉')
      setShowModal(false)
      setFormData({ name: '', phone: '', address: '' })
      fetchCustomers()
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Error!'
      )
    }
  }

  const handleViewDetails = async (customer) => {
    try {
      const res = await api.get(
        `/customers/${customer._id}`
      )
      setCustomerDetails(res.data.data)
      setShowDetails(true)
    } catch {
      toast.error('Failed to fetch details!')
    }
  }

  const handlePayment = async (e) => {
    e.preventDefault()
    try {
      await api.post(
        `/customers/${selectedCustomer._id}/payment`,
        { amount: paymentAmount, notes: paymentNotes }
      )
      toast.success('Payment recorded! ✅')
      setShowPaymentModal(false)
      setPaymentAmount('')
      setPaymentNotes('')
      fetchCustomers()
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Error!'
      )
    }
  }

  const totalPendingUdhar = customers.reduce(
    (sum, c) => sum + c.totalUdhar, 0
  )

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
            👥 Customers
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {customers.length} customers
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          + Add Customer
        </button>
      </div>

      {/* Search + Filter */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '16px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
          style={{ flex: 1, minWidth: '200px' }}
        />
        <button
          onClick={() => setFilterUdhar(!filterUdhar)}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            fontWeight: '600',
            fontSize: '13px',
            cursor: 'pointer',
            transition: 'all 0.15s',
            background: filterUdhar
              ? '#F97316'
              : 'white',
            color: filterUdhar
              ? 'white'
              : 'var(--text-muted)',
            border: filterUdhar
              ? '1.5px solid #F97316'
              : '1.5px solid var(--border)'
          }}
        >
          {filterUdhar
            ? '✓ Udhar Only'
            : 'Show Udhar Only'}
        </button>
      </div>

      {/* Total Udhar Banner */}
      {totalPendingUdhar > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
          border: '1px solid #FED7AA',
          borderRadius: '14px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '24px' }}>💰</span>
            <div>
              <p style={{
                fontSize: '12px',
                color: '#92400E',
                fontWeight: '600'
              }}>
                TOTAL PENDING UDHAR
              </p>
              <p style={{
                fontSize: '22px',
                fontWeight: '800',
                color: '#D97706',
                fontFamily: 'Space Grotesk'
              }}>
                ₹{totalPendingUdhar
                  .toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <div style={{
            fontSize: '13px',
            color: '#92400E',
            fontWeight: '600'
          }}>
            {customers.filter(
              c => c.totalUdhar > 0
            ).length} customers pending
          </div>
        </div>
      )}

      {/* Customers Table */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: 'var(--text-muted)'
        }}>
          Loading...
        </div>
      ) : customers.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 0',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '56px' }}>👥</div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            No customers found!
          </p>
          <p style={{
            fontSize: '13px',
            marginTop: '6px'
          }}>
            Add your first customer
          </p>
        </div>
      ) : (
        <div className="card"
          style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
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
                  {['Customer', 'Phone',
                    'Address', 'Udhar Amount',
                    'Status', 'Actions'].map(h => (
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
                {customers.map(customer => (
                  <tr key={customer._id}
                    className="table-row"
                    style={{
                      borderBottom:
                        '1px solid var(--border)'
                    }}>

                    {/* Customer */}
                    <td style={{
                      padding: '14px 16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '15px',
                          flexShrink: 0
                        }}>
                          {customer.name[0]
                            .toUpperCase()}
                        </div>
                        <div>
                          <div style={{
                            fontWeight: '700',
                            color: 'var(--text)'
                          }}>
                            {customer.name}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)'
                          }}>
                            Customer
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td style={{
                      padding: '14px 16px',
                      color: 'var(--text-muted)'
                    }}>
                      📞 {customer.phone}
                    </td>

                    {/* Address */}
                    <td style={{
                      padding: '14px 16px',
                      color: 'var(--text-muted)'
                    }}>
                      {customer.address || '—'}
                    </td>

                    {/* Udhar */}
                    <td style={{
                      padding: '14px 16px'
                    }}>
                      {customer.totalUdhar > 0 ? (
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '800',
                          color: '#DC2626',
                          fontFamily: 'Space Grotesk'
                        }}>
                          ₹{customer.totalUdhar
                            .toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '13px',
                          color: '#10B981',
                          fontWeight: '600'
                        }}>
                          ₹0
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td style={{
                      padding: '14px 16px'
                    }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: customer.totalUdhar > 0
                          ? '#FEE2E2'
                          : '#DCFCE7',
                        color: customer.totalUdhar > 0
                          ? '#DC2626'
                          : '#16A34A'
                      }}>
                        {customer.totalUdhar > 0
                          ? '⚠️ Pending'
                          : '✅ Clear'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{
                      padding: '14px 16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '6px'
                      }}>
                        <button
                          onClick={() =>
                            handleViewDetails(customer)}
                          style={{
                            padding: '5px 12px',
                            background: '#EFF6FF',
                            color: 'var(--primary)',
                            border: '1px solid #BFDBFE',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          View
                        </button>
                        {customer.totalUdhar > 0 && (
                          <button
                            onClick={() => {
                              setSelectedCustomer(
                                customer
                              )
                              setShowPaymentModal(true)
                            }}
                            style={{
                              padding: '5px 12px',
                              background: '#DCFCE7',
                              color: '#16A34A',
                              border: '1px solid #BBF7D0',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            + Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{
            maxWidth: '440px',
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
                👥 Add Customer
              </h2>
              <button
                onClick={() => setShowModal(false)}
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

            <form onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
              {[
                {
                  label: 'Customer Name *',
                  key: 'name',
                  type: 'text',
                  placeholder: 'Ramesh Kumar'
                },
                {
                  label: 'Phone Number *',
                  key: 'phone',
                  type: 'tel',
                  placeholder: '9999999999'
                },
                {
                  label: 'Address',
                  key: 'address',
                  type: 'text',
                  placeholder: 'Gwalior, MP'
                },
              ].map(field => (
                <div key={field.key}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase'
                  }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={formData[field.key]}
                    onChange={e => setFormData({
                      ...formData,
                      [field.key]: e.target.value
                    })}
                    placeholder={field.placeholder}
                    required={field.key !== 'address'}
                    className="input"
                  />
                </div>
              ))}

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: 'var(--text-muted)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    flex: 2,
                    padding: '12px'
                  }}
                >
                  + Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal" style={{
            maxWidth: '420px',
            padding: '28px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk',
                color: 'var(--text)'
              }}>
                💰 Record Payment
              </h2>
              <button
                onClick={() =>
                  setShowPaymentModal(false)}
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

            {/* Customer Info */}
            <div style={{
              background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
              border: '1px solid #FED7AA',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <p style={{
                  fontSize: '12px',
                  color: '#92400E',
                  fontWeight: '600'
                }}>
                  CUSTOMER
                </p>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: 'var(--text)'
                }}>
                  {selectedCustomer.name}
                </p>
                <p style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)'
                }}>
                  {selectedCustomer.phone}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontSize: '12px',
                  color: '#92400E',
                  fontWeight: '600'
                }}>
                  TOTAL UDHAR
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#DC2626',
                  fontFamily: 'Space Grotesk'
                }}>
                  ₹{selectedCustomer.totalUdhar
                    .toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <form onSubmit={handlePayment}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Payment Amount ₹ *
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={e =>
                    setPaymentAmount(e.target.value)}
                  required
                  max={selectedCustomer.totalUdhar}
                  min="1"
                  placeholder="Enter amount..."
                  className="input"
                  style={{ fontSize: '18px' }}
                />
                {paymentAmount && (
                  <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: '#DCFCE7',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#16A34A',
                    fontWeight: '600'
                  }}>
                    Remaining: ₹{
                      selectedCustomer.totalUdhar -
                      parseInt(paymentAmount || 0)
                    }
                  </div>
                )}
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={e =>
                    setPaymentNotes(e.target.value)}
                  placeholder="e.g. Cash payment"
                  className="input"
                />
              </div>

              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button
                  type="button"
                  onClick={() =>
                    setShowPaymentModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1.5px solid var(--border)',
                    borderRadius: '12px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: 'var(--text-muted)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '12px',
                    background: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '14px'
                  }}
                >
                  ✓ Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {showDetails && customerDetails && (
        <div className="modal-overlay">
          <div className="modal" style={{
            maxWidth: '520px',
            padding: '28px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  fontFamily: 'Space Grotesk',
                  color: 'var(--text)'
                }}>
                  {customerDetails.customer.name}
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)'
                }}>
                  📞 {customerDetails.customer.phone}
                </p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
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

            {/* Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                background: '#FEF2F2',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #FECACA'
              }}>
                <p style={{
                  fontSize: '11px',
                  color: '#991B1B',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  Total Udhar
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#DC2626',
                  fontFamily: 'Space Grotesk',
                  marginTop: '4px'
                }}>
                  ₹{customerDetails.totalUdhar
                    .toLocaleString('en-IN')}
                </p>
              </div>
              <div style={{
                background: '#F0FDF4',
                borderRadius: '14px',
                padding: '16px',
                border: '1px solid #BBF7D0'
              }}>
                <p style={{
                  fontSize: '11px',
                  color: '#14532D',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  Total Transactions
                </p>
                <p style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  color: '#16A34A',
                  fontFamily: 'Space Grotesk',
                  marginTop: '4px'
                }}>
                  {customerDetails
                    .transactions.length}
                </p>
              </div>
            </div>

            {/* Transaction History */}
            <h3 style={{
              fontSize: '14px',
              fontWeight: '700',
              color: 'var(--text)',
              marginBottom: '12px'
            }}>
              Transaction History
            </h3>

            <div style={{
              maxHeight: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {customerDetails.transactions
                .length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '32px',
                  color: 'var(--text-muted)'
                }}>
                  <div style={{ fontSize: '36px' }}>
                    🧾
                  </div>
                  <p style={{ marginTop: '8px' }}>
                    No transactions yet!
                  </p>
                </div>
              ) : (
                customerDetails.transactions
                  .map(t => (
                  <div key={t._id} style={{
                    padding: '14px 16px',
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor:
                      t.type === 'udhar_payment'
                        ? '#BBF7D0'
                        : '#FED7AA',
                    background:
                      t.type === 'udhar_payment'
                        ? '#F0FDF4'
                        : '#FFF7ED'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <p style={{
                          fontWeight: '700',
                          fontSize: '13px',
                          color: 'var(--text)'
                        }}>
                          {t.type === 'udhar_payment'
                            ? '✅ Payment Received'
                            : '📋 Udhar Added'}
                        </p>
                        <p style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          marginTop: '3px'
                        }}>
                          {new Date(t.createdAt)
                            .toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          {t.notes &&
                            ` • ${t.notes}`}
                        </p>
                      </div>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color:
                          t.type === 'udhar_payment'
                            ? '#16A34A'
                            : '#DC2626',
                        fontFamily: 'Space Grotesk'
                      }}>
                        {t.type === 'udhar_payment'
                          ? '+' : '-'}
                        ₹{t.totalAmount
                          .toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
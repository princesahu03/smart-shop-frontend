import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { generateBill } from '../components/BillGenerator'
import { useAuth } from '../context/Auth.Context'

export default function Suppliers() {
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddSupplier, setShowAddSupplier] =
    useState(false)
  const [showAddBill, setShowAddBill] =
    useState(false)
  const [showBills, setShowBills] = useState(false)
  const [showCompare, setShowCompare] =
    useState(false)
  const [selectedSupplier, setSelectedSupplier] =
    useState(null)
  const [supplierBills, setSupplierBills] =
    useState([])
  const [compareResults, setCompareResults] =
    useState([])
  const [searchProduct, setSearchProduct] =
    useState('')

  const [supplierForm, setSupplierForm] =
    useState({
      name: '', phone: '', company: ''
    })

  const [billForm, setBillForm] = useState({
    billNumber: '',
    date: new Date()
      .toISOString().split('T')[0],
    items: [
      {
        productName: '',
        quantity: 1,
        price: 0
      }
    ]
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers')
      setSuppliers(res.data.data)
    } catch {
      toast.error('Failed to fetch!')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSupplier = async (e) => {
    e.preventDefault()
    try {
      await api.post('/suppliers', supplierForm)
      toast.success('Supplier added!')
      setShowAddSupplier(false)
      setSupplierForm({
        name: '', phone: '', company: ''
      })
      fetchSuppliers()
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Error!'
      )
    }
  }

  const addBillItem = () => {
    setBillForm({
      ...billForm,
      items: [...billForm.items, {
        productName: '',
        quantity: 1,
        price: 0
      }]
    })
  }

  const removeBillItem = (index) => {
    setBillForm({
      ...billForm,
      items: billForm.items.filter(
        (_, i) => i !== index
      )
    })
  }

  const updateBillItem = (index, field, value) => {
    const newItems = [...billForm.items]
    newItems[index][field] = value
    setBillForm({ ...billForm, items: newItems })
  }

  const billTotal = billForm.items.reduce(
    (sum, item) =>
      sum + (item.price * item.quantity), 0
  )

  const handleAddBill = async (e) => {
    e.preventDefault()
    try {
      await api.post(
        `/suppliers/${selectedSupplier._id}/bills`,
        billForm
      )
      toast.success('Bill added!')
      setShowAddBill(false)
      setBillForm({
        billNumber: '',
        date: new Date()
          .toISOString().split('T')[0],
        items: [{
          productName: '',
          quantity: 1,
          price: 0
        }]
      })
      fetchSuppliers()
    } catch {
      toast.error('Failed to add bill!')
    }
  }

  const handleViewBills = async (supplier) => {
    try {
      const res = await api.get(
        `/suppliers/${supplier._id}/bills`
      )
      setSupplierBills(res.data.data.bills)
      setSelectedSupplier(supplier)
      setShowBills(true)
    } catch {
      toast.error('Failed to fetch bills!')
    }
  }

  const handleCompare = async () => {
    if (!searchProduct.trim()) {
      toast.error('Enter product name!')
      return
    }
    try {
      const res = await api.get(
        '/suppliers/compare',
        { params: { productName: searchProduct } }
      )
      setCompareResults(res.data.data)
      setShowCompare(true)
    } catch {
      toast.error('Comparison failed!')
    }
  }

const handleDownloadSupplierBill = (bill) => {
  
  generateBill({
    transaction: {
      _id: bill.billNumber || 'SUP001',
      createdAt: bill.date,
      products: bill.items.map(item => ({
        product: { name: item.productName },
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      totalAmount: bill.amount,
      paidAmount: bill.amount,
      remainingAmount: 0,
      paymentMethod: 'cash'
    },
    shopInfo: {
      shopName: selectedSupplier?.company ||
        selectedSupplier?.name,
      phone: selectedSupplier?.phone
    },
    customerName: user?.shopName ||
      'Smart Shop'
  })
  toast.success('Bill downloaded! 🧾')
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
            🏪 Suppliers
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {suppliers.length} suppliers
          </p>
        </div>
        <button
          onClick={() => setShowAddSupplier(true)}
          className="btn-primary"
        >
          + Add Supplier
        </button>
      </div>

      {/* Price Comparison Tool */}
      <div className="card" style={{
        padding: '20px',
        marginBottom: '20px',
        background: 'linear-gradient(135deg, #EFF6FF, #F0FDF4)'
      }}>
        <h2 style={{
          fontSize: '15px',
          fontWeight: '700',
          color: 'var(--text)',
          marginBottom: '12px'
        }}>
          🔍 Compare Supplier Prices
        </h2>
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          <input
            type="text"
            value={searchProduct}
            onChange={e =>
              setSearchProduct(e.target.value)}
            placeholder="Enter product name to compare prices..."
            className="input"
            onKeyDown={e => {
              if (e.key === 'Enter')
                handleCompare()
            }}
          />
          <button
            onClick={handleCompare}
            className="btn-primary"
            style={{ whiteSpace: 'nowrap' }}
          >
            🔍 Compare
          </button>
        </div>
      </div>

      {/* Suppliers Grid */}
      {loading ? (
        <p style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          padding: '40px'
        }}>
          Loading...
        </p>
      ) : suppliers.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 0',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '48px' }}>
            🏪
          </div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '12px'
          }}>
            No suppliers yet!
          </p>
          <p style={{ fontSize: '13px' }}>
            Add suppliers to track bills
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {suppliers.map(supplier => (
            <div key={supplier._id}
              className="card"
              style={{ padding: '20px' }}>

              {/* Supplier Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  🏪
                </div>
                <div>
                  <div style={{
                    fontWeight: '700',
                    color: 'var(--text)',
                    fontSize: '15px'
                  }}>
                    {supplier.name}
                  </div>
                  {supplier.company && (
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}>
                      {supplier.company}
                    </div>
                  )}
                  <div style={{
                    fontSize: '12px',
                    color: 'var(--primary)',
                    fontWeight: '500'
                  }}>
                    📞 {supplier.phone}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <div style={{
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: 'var(--primary)'
                  }}>
                    {supplier.bills?.length || 0}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                  }}>
                    Bills
                  </div>
                </div>
                <div style={{
                  background: '#F0FDF4',
                  borderRadius: '10px',
                  padding: '10px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#10B981'
                  }}>
                    ₹{supplier.bills?.reduce(
                      (sum, b) => sum + b.amount, 0
                    ).toLocaleString('en-IN') || 0}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)'
                  }}>
                    Total
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => {
                    setSelectedSupplier(supplier)
                    setShowAddBill(true)
                  }}
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '13px'
                  }}
                >
                  + Add Bill
                </button>
                <button
                  onClick={() =>
                    handleViewBills(supplier)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '13px',
                    border: '1.5px solid var(--primary)',
                    borderRadius: '10px',
                    background: 'white',
                    color: 'var(--primary)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  View Bills
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="modal-overlay">
          <div className="modal"
            style={{ maxWidth: '440px',
              padding: '28px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '18px',
                fontWeight: '700',
                fontFamily: 'Space Grotesk'
              }}>
                Add Supplier
              </h2>
              <button
                onClick={() =>
                  setShowAddSupplier(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSupplier}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
              {[
                {
                  label: 'Supplier Name *',
                  key: 'name',
                  placeholder: 'Ram Traders'
                },
                {
                  label: 'Phone *',
                  key: 'phone',
                  placeholder: '9999999999'
                },
                {
                  label: 'Company',
                  key: 'company',
                  placeholder: 'Company name'
                },
              ].map(field => (
                <div key={field.key}>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    color: 'var(--text)'
                  }}>
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={supplierForm[field.key]}
                    onChange={e =>
                      setSupplierForm({
                        ...supplierForm,
                        [field.key]: e.target.value
                      })}
                    placeholder={field.placeholder}
                    required={
                      field.key !== 'company'
                    }
                    className="input"
                  />
                </div>
              ))}

              <div style={{
                display: 'flex',
                gap: '10px',
                marginTop: '4px'
              }}>
                <button type="button"
                  onClick={() =>
                    setShowAddSupplier(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    border: '1.5px solid var(--border)',
                    borderRadius: '10px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: 'var(--text-muted)'
                  }}>
                  Cancel
                </button>
                <button type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '11px' }}>
                  Add Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddBill && selectedSupplier && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '560px',
              padding: '28px'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  fontFamily: 'Space Grotesk'
                }}>
                  Add Bill
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)'
                }}>
                  {selectedSupplier.name}
                </p>
              </div>
              <button
                onClick={() =>
                  setShowAddBill(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBill}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
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
                    marginBottom: '6px'
                  }}>
                    Bill Number
                  </label>
                  <input
                    type="text"
                    value={billForm.billNumber}
                    onChange={e =>
                      setBillForm({
                        ...billForm,
                        billNumber: e.target.value
                      })}
                    placeholder="INV-001"
                    className="input"
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: '600',
                    marginBottom: '6px'
                  }}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={billForm.date}
                    onChange={e =>
                      setBillForm({
                        ...billForm,
                        date: e.target.value
                      })}
                    className="input"
                  />
                </div>
              </div>

              {/* Items */}
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <label style={{
                    fontSize: '13px',
                    fontWeight: '600'
                  }}>
                    Products
                  </label>
                  <button
                    type="button"
                    onClick={addBillItem}
                    style={{
                      fontSize: '12px',
                      color: 'var(--primary)',
                      fontWeight: '600',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Item
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns:
                      '2fr 80px 90px 36px',
                    gap: '8px',
                    padding: '6px 0'
                  }}>
                    {['Product', 'Qty',
                      'Price ₹', ''].map(h => (
                      <span key={h} style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase'
                      }}>
                        {h}
                      </span>
                    ))}
                  </div>

                  {billForm.items.map(
                    (item, index) => (
                    <div key={index} style={{
                      display: 'grid',
                      gridTemplateColumns:
                        '2fr 80px 90px 36px',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <input
                        type="text"
                        value={item.productName}
                        onChange={e =>
                          updateBillItem(
                            index,
                            'productName',
                            e.target.value
                          )}
                        placeholder="Product name"
                        required
                        className="input"
                        style={{ fontSize: '13px' }}
                      />
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e =>
                          updateBillItem(
                            index,
                            'quantity',
                            parseInt(e.target.value)
                          )}
                        min="1"
                        required
                        className="input"
                        style={{ fontSize: '13px' }}
                      />
                      <input
                        type="number"
                        value={item.price}
                        onChange={e =>
                          updateBillItem(
                            index,
                            'price',
                            parseFloat(e.target.value)
                          )}
                        min="0"
                        step="0.01"
                        required
                        className="input"
                        style={{ fontSize: '13px' }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          removeBillItem(index)}
                        disabled={
                          billForm.items.length === 1
                        }
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          border: 'none',
                          background:
                            billForm.items.length === 1
                              ? '#F1F5F9'
                              : '#FEE2E2',
                          color:
                            billForm.items.length === 1
                              ? '#94A3B8'
                              : '#EF4444',
                          cursor:
                            billForm.items.length === 1
                              ? 'not-allowed'
                              : 'pointer',
                          fontSize: '16px'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: '#EFF6FF',
                borderRadius: '12px',
                border: '1px solid #BFDBFE'
              }}>
                <span style={{
                  fontWeight: '700',
                  color: 'var(--primary)'
                }}>
                  Bill Total:
                </span>
                <span style={{
                  fontWeight: '700',
                  fontSize: '18px',
                  color: 'var(--primary)'
                }}>
                  ₹{billTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div style={{
                display: 'flex',
                gap: '10px'
              }}>
                <button type="button"
                  onClick={() =>
                    setShowAddBill(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    border: '1.5px solid var(--border)',
                    borderRadius: '10px',
                    background: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                    color: 'var(--text-muted)'
                  }}>
                  Cancel
                </button>
                <button type="submit"
                  className="btn-primary"
                  style={{
                    flex: 1,
                    padding: '11px'
                  }}>
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Bills Modal */}
      {showBills && selectedSupplier && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '560px',
              padding: '28px'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  fontFamily: 'Space Grotesk'
                }}>
                  Bills — {selectedSupplier.name}
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)'
                }}>
                  {supplierBills.length} bills
                </p>
              </div>
              <button
                onClick={() => setShowBills(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}>
                ✕
              </button>
            </div>

            {supplierBills.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 0',
                color: 'var(--text-muted)'
              }}>
                <div style={{ fontSize: '40px' }}>
                  🧾
                </div>
                <p style={{ marginTop: '12px' }}>
                  No bills yet!
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '60vh',
                overflowY: 'auto'
              }}>
                {supplierBills.map((bill, i) => (
                  <div key={i} className="card"
                    style={{ padding: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{
                          fontWeight: '700',
                          fontSize: '14px'
                        }}>
                          {bill.billNumber ||
                            `Bill #${i + 1}`}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)'
                        }}>
                          {new Date(bill.date)
                            .toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          fontWeight: '700',
                          color: 'var(--primary)',
                          fontSize: '16px'
                        }}>
                          ₹{bill.amount
                            .toLocaleString('en-IN')}
                        </span>
                        <button
                          onClick={() =>
                            handleDownloadSupplierBill(
                              bill
                            )}
                          style={{
                            padding: '5px 10px',
                            background: '#EFF6FF',
                            color: 'var(--primary)',
                            border: '1px solid #BFDBFE',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          🧾 PDF
                        </button>
                      </div>
                    </div>

                    {/* Bill Items */}
                    <div style={{
                      background: '#F8FAFC',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <table style={{
                        width: '100%',
                        fontSize: '12px',
                        borderCollapse: 'collapse'
                      }}>
                        <thead>
                          <tr style={{
                            background: '#F1F5F9'
                          }}>
                            {['Product', 'Qty',
                              'Price', 'Total']
                              .map(h => (
                              <th key={h} style={{
                                padding: '6px 10px',
                                textAlign: 'left',
                                color: 'var(--text-muted)',
                                fontWeight: '600',
                                fontSize: '11px'
                              }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {bill.items.map(
                            (item, j) => (
                            <tr key={j} style={{
                              borderTop:
                                '1px solid #E2E8F0'
                            }}>
                              <td style={{
                                padding: '6px 10px',
                                fontWeight: '500'
                              }}>
                                {item.productName}
                              </td>
                              <td style={{
                                padding: '6px 10px',
                                color: 'var(--text-muted)'
                              }}>
                                {item.quantity}
                              </td>
                              <td style={{
                                padding: '6px 10px',
                                color: 'var(--text-muted)'
                              }}>
                                ₹{item.price}
                              </td>
                              <td style={{
                                padding: '6px 10px',
                                fontWeight: '700',
                                color: 'var(--primary)'
                              }}>
                                ₹{item.price *
                                  item.quantity}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Price Comparison Modal */}
      {showCompare && (
        <div className="modal-overlay">
          <div className="modal"
            style={{
              maxWidth: '600px',
              padding: '28px'
            }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  fontFamily: 'Space Grotesk'
                }}>
                  🔍 Price Comparison
                </h2>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)'
                }}>
                  "{searchProduct}"
                </p>
              </div>
              <button
                onClick={() =>
                  setShowCompare(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '22px',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}>
                ✕
              </button>
            </div>

            {compareResults.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 0',
                color: 'var(--text-muted)'
              }}>
                <div style={{ fontSize: '40px' }}>
                  🔍
                </div>
                <p style={{ marginTop: '12px' }}>
                  No price data found!
                </p>
                <p style={{ fontSize: '13px' }}>
                  Add bills with this product first
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {/* Best Price Banner */}
                {(() => {
                  const best = compareResults
                    .reduce((min, s) =>
                      (s.lowestPrice < min.lowestPrice)
                        ? s : min,
                      compareResults[0]
                    )
                  return (
                    <div style={{
                      background:
                        'linear-gradient(135deg, #10B981, #059669)',
                      borderRadius: '14px',
                      padding: '16px',
                      color: 'white'
                    }}>
                      <div style={{
                        fontSize: '12px',
                        opacity: 0.85
                      }}>
                        🏆 BEST PRICE
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginTop: '4px'
                      }}>
                        {best.supplier.name}
                      </div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: '800'
                      }}>
                        ₹{best.lowestPrice}
                      </div>
                    </div>
                  )
                })()}

                {/* All Suppliers */}
                {compareResults
                  .sort((a, b) =>
                    a.lowestPrice - b.lowestPrice)
                  .map((result, i) => (
                  <div key={i} className="card"
                    style={{ padding: '16px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start'
                    }}>
                      <div>
                        <div style={{
                          fontWeight: '700',
                          fontSize: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          {result.supplier.name}
                          {i === 0 && (
                            <span style={{
                              background: '#DCFCE7',
                              color: '#16A34A',
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '20px'
                            }}>
                              CHEAPEST
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          marginTop: '2px'
                        }}>
                          {result.supplier.company}
                          {' • '}
                          {result.supplier.phone}
                        </div>
                      </div>
                      <div style={{
                        textAlign: 'right'
                      }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: '800',
                          color: i === 0
                            ? '#10B981'
                            : 'var(--text)'
                        }}>
                          ₹{result.lowestPrice}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)'
                        }}>
                          lowest price
                        </div>
                      </div>
                    </div>

                    {/* Price History */}
                    {result.prices.length > 0 && (
                      <div style={{
                        marginTop: '12px',
                        paddingTop: '12px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)'
                        }}>
                          Avg: <strong>
                            ₹{result.avgPrice
                              ?.toFixed(2)}
                          </strong>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)'
                        }}>
                          Last: <strong>
                            ₹{result.lastPrice}
                          </strong>
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)'
                        }}>
                          Bills: <strong>
                            {result.prices.length}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
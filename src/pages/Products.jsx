import { useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import BarcodeScanner from '../components/BarcodeScanner'
import { useAuth } from '../context/Auth.Context'

export default function Products() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [editProduct, setEditProduct] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    category: 'Food',
    purchasePrice: '',
    sellingPrice: '',
    stock: '',
    minStockAlert: 10,
    expiryDate: '',
    unit: 'piece',
    supplier: ''
  })

  useEffect(() => {
    fetchProducts()
  }, [search, filter])

  const fetchProducts = async () => {
    try {
      const params = {}
      if (search) params.search = search
      if (filter === 'lowStock')
        params.lowStock = true
      if (filter === 'expiring')
        params.expiringSoon = true

      const res = await api.get(
        '/products', { params }
      )
      setProducts(res.data.data.products)
    } catch {
      toast.error('Failed to fetch products!')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editProduct) {
        await api.put(
          `/products/${editProduct._id}`,
          formData
        )
        toast.success('Product updated! ✅')
      } else {
        await api.post('/products', formData)
        toast.success('Product added! 🎉')
      }
      setShowModal(false)
      resetForm()
      fetchProducts()
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Error!'
      )
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      toast.success('Product deleted!')
      fetchProducts()
    } catch {
      toast.error('Delete failed!')
    }
  }

  const handleEdit = (product) => {
    setEditProduct(product)
    setFormData({
      name: product.name,
      barcode: product.barcode || '',
      category: product.category,
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStockAlert: product.minStockAlert,
      expiryDate: product.expiryDate
        ? product.expiryDate.split('T')[0]
        : '',
      unit: product.unit,
      supplier: product.supplier || ''
    })
    setShowModal(true)
  }

  const handleBarcodeScan = async (barcode) => {
    setShowScanner(false)
    try {
      const res = await api.get(
        `/products/barcode/${barcode}`
      )
      handleEdit(res.data.data)
      toast.success(
        `Found: ${res.data.data.name}! ✅`
      )
    } catch {
      setFormData({ ...formData, barcode })
      setShowModal(true)
      toast(`Barcode: ${barcode} — Add product!`, {
        icon: '📷'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      barcode: '',
      category: 'Food',
      purchasePrice: '',
      sellingPrice: '',
      stock: '',
      minStockAlert: 10,
      expiryDate: '',
      unit: 'piece',
      supplier: ''
    })
    setEditProduct(null)
  }

  const isLowStock = (p) =>
    p.stock <= p.minStockAlert

  const isExpiring = (p) => {
    if (!p.expiryDate) return false
    const diff = new Date(p.expiryDate) - new Date()
    return diff > 0 &&
      diff < 30 * 24 * 60 * 60 * 1000
  }

  const isExpired = (p) => {
    if (!p.expiryDate) return false
    return new Date(p.expiryDate) < new Date()
  }

  const profit = (p) =>
    p.sellingPrice - p.purchasePrice

  const profitPercent = (p) =>
    ((profit(p) / p.purchasePrice) * 100).toFixed(1)

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
            📦 Products
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
            marginTop: '4px'
          }}>
            {products.length} products
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowScanner(true)}
            style={{
              padding: '10px 16px',
              border: '1.5px solid var(--primary)',
              borderRadius: '10px',
              background: 'white',
              color: 'var(--primary)',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            📷 Scan
          </button>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="btn-primary"
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Search + Filter */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <input
          type="text"
          placeholder="Search by name or barcode..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input"
          style={{ flex: 1, minWidth: '200px' }}
        />
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'lowStock', label: '⚠️ Low Stock' },
            { value: 'expiring', label: '📅 Expiring' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                background: filter === f.value
                  ? 'var(--primary)'
                  : 'white',
                color: filter === f.value
                  ? 'white'
                  : 'var(--text-muted)',
                border: filter === f.value
                  ? '1.5px solid var(--primary)'
                  : '1.5px solid var(--border)',
                transition: 'all 0.15s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          color: 'var(--text-muted)'
        }}>
          Loading...
        </div>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 0',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontSize: '56px' }}>📦</div>
          <p style={{
            fontSize: '16px',
            fontWeight: '600',
            marginTop: '16px'
          }}>
            No products found!
          </p>
          <p style={{
            fontSize: '13px',
            marginTop: '6px'
          }}>
            Add your first product
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
                  {['Product', 'Category',
                    'Buy ₹', 'Sell ₹',
                    'Profit', 'Stock',
                    'Expiry', 'Actions']
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
                {products.map(product => (
                  <tr key={product._id}
                    className="table-row"
                    style={{
                      borderBottom:
                        '1px solid var(--border)',
                      background: isExpired(product)
                        ? '#FFF5F5'
                        : 'white'
                    }}>

                    {/* Product Name */}
                    <td style={{
                      padding: '12px 16px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: 'var(--text)'
                      }}>
                        {product.name}
                      </div>
                      {product.barcode && (
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                          marginTop: '2px'
                        }}>
                          #{product.barcode}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td style={{
                      padding: '12px 16px'
                    }}>
                      <span style={{
                        padding: '3px 10px',
                        background: '#EFF6FF',
                        color: 'var(--primary)',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600'
                      }}>
                        {product.category}
                      </span>
                    </td>

                    {/* Buy Price */}
                    <td style={{
                      padding: '12px 16px',
                      color: 'var(--text-muted)'
                    }}>
                      ₹{product.purchasePrice}
                    </td>

                    {/* Sell Price */}
                    <td style={{
                      padding: '12px 16px',
                      fontWeight: '600',
                      color: 'var(--text)'
                    }}>
                      ₹{product.sellingPrice}
                    </td>

                    {/* Profit */}
                    <td style={{
                      padding: '12px 16px'
                    }}>
                      <div style={{
                        color: '#10B981',
                        fontWeight: '700'
                      }}>
                        ₹{profit(product)}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#10B981',
                        opacity: 0.7
                      }}>
                        {profitPercent(product)}%
                      </div>
                    </td>

                    {/* Stock */}
                    <td style={{
                      padding: '12px 16px'
                    }}>
                      <div style={{
                        fontWeight: '700',
                        color: isLowStock(product)
                          ? '#EF4444'
                          : 'var(--text)'
                      }}>
                        {product.stock} {product.unit}
                      </div>
                      {isLowStock(product) && (
                        <div style={{
                          fontSize: '11px',
                          color: '#EF4444',
                          marginTop: '2px'
                        }}>
                          ⚠️ Low stock!
                        </div>
                      )}
                    </td>

                    {/* Expiry */}
                    <td style={{
                      padding: '12px 16px'
                    }}>
                      {product.expiryDate ? (
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '600',
                          background: isExpired(product)
                            ? '#FEE2E2'
                            : isExpiring(product)
                            ? '#FEF3C7'
                            : '#DCFCE7',
                          color: isExpired(product)
                            ? '#DC2626'
                            : isExpiring(product)
                            ? '#D97706'
                            : '#16A34A'
                        }}>
                          {isExpired(product)
                            ? '❌ Expired'
                            : new Date(product.expiryDate)
                                .toLocaleDateString('en-IN')}
                        </span>
                      ) : (
                        <span style={{
                          color: 'var(--text-muted)',
                          fontSize: '12px'
                        }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{
                      padding: '12px 16px'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '6px'
                      }}>
                        <button
                          onClick={() =>
                            handleEdit(product)}
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
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(product._id)}
                          style={{
                            padding: '5px 12px',
                            background: '#FEE2E2',
                            color: '#EF4444',
                            border: '1px solid #FECACA',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{
            maxWidth: '520px',
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
                {editProduct
                  ? '✏️ Edit Product'
                  : '📦 Add Product'}
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

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
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
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({
                      ...formData,
                      name: e.target.value
                    })}
                    required
                    placeholder="e.g. Parle-G"
                    className="input"
                  />
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
                    Barcode
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({
                      ...formData,
                      barcode: e.target.value
                    })}
                    placeholder="Scan or type"
                    className="input"
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
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
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({
                      ...formData,
                      category: e.target.value
                    })}
                    className="input"
                  >
                    {['Food', 'Beverages',
                      'Personal Care',
                      'Household', 'Medicine',
                      'Stationery', 'Other']
                      .map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
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
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={e => setFormData({
                      ...formData,
                      unit: e.target.value
                    })}
                    className="input"
                  >
                    {['piece', 'kg', 'liter',
                      'dozen', 'pack'].map(u => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
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
                    Purchase Price ₹ *
                  </label>
                  <input
                    type="number"
                    value={formData.purchasePrice}
                    onChange={e => setFormData({
                      ...formData,
                      purchasePrice: e.target.value
                    })}
                    required
                    min="0"
                    placeholder="0"
                    className="input"
                  />
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
                    Selling Price ₹ *
                  </label>
                  <input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={e => setFormData({
                      ...formData,
                      sellingPrice: e.target.value
                    })}
                    required
                    min="0"
                    placeholder="0"
                    className="input"
                  />
                </div>
              </div>

              {/* Profit Preview */}
              {formData.purchasePrice &&
                formData.sellingPrice && (
                <div style={{
                  padding: '10px 14px',
                  background: profit({
                    purchasePrice:
                      formData.purchasePrice,
                    sellingPrice:
                      formData.sellingPrice
                  }) >= 0
                    ? '#DCFCE7'
                    : '#FEE2E2',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: profit({
                    purchasePrice:
                      formData.purchasePrice,
                    sellingPrice:
                      formData.sellingPrice
                  }) >= 0
                    ? '#16A34A'
                    : '#DC2626'
                }}>
                  Profit: ₹{profit({
                    purchasePrice:
                      Number(formData.purchasePrice),
                    sellingPrice:
                      Number(formData.sellingPrice)
                  })}
                  {' '}({profitPercent({
                    purchasePrice:
                      Number(formData.purchasePrice),
                    sellingPrice:
                      Number(formData.sellingPrice)
                  })}%)
                </div>
              )}

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
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
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({
                      ...formData,
                      stock: e.target.value
                    })}
                    required
                    min="0"
                    placeholder="0"
                    className="input"
                  />
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
                    Min Stock Alert
                  </label>
                  <input
                    type="number"
                    value={formData.minStockAlert}
                    onChange={e => setFormData({
                      ...formData,
                      minStockAlert: e.target.value
                    })}
                    min="0"
                    className="input"
                  />
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
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
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({
                      ...formData,
                      expiryDate: e.target.value
                    })}
                    className="input"
                  />
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
                    Supplier
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={e => setFormData({
                      ...formData,
                      supplier: e.target.value
                    })}
                    placeholder="Supplier name"
                    className="input"
                  />
                </div>
              </div>

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
                  {editProduct
                    ? '✓ Update Product'
                    : '+ Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner */}
      {showScanner && (
        <BarcodeScanner
          onScan={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  )
}
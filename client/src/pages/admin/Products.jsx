import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { AdminNav } from './Dashboard'
import { Spinner } from '../../components/UI'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

export default function AdminProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    api.get(`/products?limit=100&search=${search}`).then(r => setProducts(r.data.products)).finally(() => setLoading(false))
  }, [search])

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return
    setDeleting(id)
    await api.delete(`/products/${id}`)
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/products" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5% 60px' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center' }}>
          <input
            className="input-field"
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button className="btn-gold" onClick={() => navigate('/admin/products/add')}>+ Add Product</button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={40} /></div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, marginBottom: 12 }}>No products found</div>
            <button className="btn-gold" onClick={() => navigate('/admin/products/add')}>Add First Product</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--ink-40)', marginBottom: 16, letterSpacing: '.04em' }}>{products.length} products</div>
            <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 3, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ink-10)' }}>
                    {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid var(--ink-5)' : 'none', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 48, height: 48, borderRadius: 3, overflow: 'hidden', background: '#f5f5f3', flexShrink: 0 }}>
                            {p.images?.[0] && <img src={p.images[0]} alt={p.name} loading="lazy" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px', fontSize: 12, color: 'var(--ink-60)' }}>{p.category}</td>
                      <td style={{ padding: '12px 20px', fontSize: 13, fontWeight: 700 }}>{fmt(p.price)}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: p.stock <= 3 ? '#e65100' : p.stock === 0 ? '#c0392b' : '#2e7d32' }}>{p.stock}</span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-outline" style={{ padding: '6px 14px', fontSize: 11 }}
                            onClick={() => navigate(`/admin/products/edit/${p.id}`)}>Edit</button>
                          <button
                            style={{ padding: '6px 14px', fontSize: 11, fontWeight: 700, background: '#fdecea', color: '#c0392b', border: 'none', borderRadius: 2, cursor: 'pointer', fontFamily: "'Jost',sans-serif", opacity: deleting === p.id ? .5 : 1 }}
                            onClick={() => handleDelete(p.id)}
                            disabled={deleting === p.id}>
                            {deleting === p.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

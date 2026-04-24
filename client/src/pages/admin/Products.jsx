import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { AdminNav } from './Dashboard'
import { Spinner } from '../../components/UI'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

const MATERIAL_TYPES = ['Silver', 'Silver Coated', 'Gold', 'Platinum', 'Diamond']

function MaterialBadge({ type }) {
  const colors = {
    'Silver': { bg: '#E8F5E9', color: '#2E7D32', border: '#A5D6A7' },
    'Silver Coated': { bg: '#ECEFF1', color: '#455A64', border: '#90A4AE' },
    'Gold': { bg: '#FFF8E1', color: '#F57F17', border: '#FFE082' },
    'Platinum': { bg: '#EDE7F6', color: '#4527A0', border: '#B39DDB' },
    'Diamond': { bg: '#E3F2FD', color: '#1565C0', border: '#90CAF9' },
  }
  const s = colors[type] || { bg: '#F5F5F5', color: '#666', border: '#DDD' }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 20, padding: '3px 10px' }}>
      {type || 'Unset'}
    </span>
  )
}

export default function AdminProducts() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [deleting, setDeleting] = useState(null)
  const [togglingMaterial, setTogglingMaterial] = useState(null)
  const [toast, setToast] = useState(null)
  const [filterMaterial, setFilterMaterial] = useState('all')

  // Debounce search so the API call doesn't fire on every keystroke
  // (which caused a loading flash that could disrupt cursor position)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setLoading(true)
    api.get(`/products?limit=200&search=${debouncedSearch}`).then(r => setProducts(r.data.products || [])).finally(() => setLoading(false))
  }, [debouncedSearch])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this product?')) return
    setDeleting(id)
    await api.delete(`/products/${id}`)
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const handleMaterialToggle = async (product, newMaterial) => {
    setTogglingMaterial(product.id)
    try {
      // Update tags: remove old material tags, add new one
      const oldTags = (product.tags || []).filter(t =>
        !['silver', 'silver-coated', 'gold', 'platinum', 'diamond', 'silver coated'].includes(t.toLowerCase())
      )
      const materialTag = newMaterial.toLowerCase().replace(' ', '-')
      const newTags = [...oldTags, materialTag]

      await api.put(`/products/${product.id}`, {
        subcategory: newMaterial,
        tags: newTags,
      })
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, subcategory: newMaterial, tags: newTags } : p))
      showToast(`${product.name} → ${newMaterial}`)
    } catch (e) {
      showToast('Failed to update material type', 'error')
    }
    setTogglingMaterial(null)
  }

  const getMaterialType = (p) => {
    const sub = (p.subcategory || '').toLowerCase()
    const tags = (p.tags || []).map(t => t.toLowerCase())
    if (sub.includes('silver coated') || sub.includes('silver-coated') || tags.includes('silver-coated')) return 'Silver Coated'
    if (sub.includes('gold') || tags.includes('gold')) return 'Gold'
    if (sub.includes('platinum') || tags.includes('platinum')) return 'Platinum'
    if (sub.includes('diamond') || tags.includes('diamond')) return 'Diamond'
    if (sub.includes('silver') || tags.includes('silver')) return 'Silver'
    return null
  }

  const filtered = products.filter(p => {
    if (filterMaterial === 'all') return true
    if (filterMaterial === 'unset') return !getMaterialType(p)
    return getMaterialType(p) === filterMaterial
  })

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/products" />

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)', background: toast.type === 'error' ? '#c0392b' : '#2e7d32', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,.2)', whiteSpace: 'nowrap' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5% 60px' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <input className="input-field" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 180 }} />
          <button className="btn-gold" onClick={() => navigate('/admin/products/add')}>+ Add Product</button>
        </div>

        {/* Material filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {['all', 'Silver', 'Silver Coated', 'Gold', 'Platinum', 'Diamond', 'unset'].map(m => (
            <button key={m} onClick={() => setFilterMaterial(m)} style={{ padding: '6px 14px', borderRadius: 20, border: '1.5px solid', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Jost',sans-serif", transition: 'all .2s', background: filterMaterial === m ? '#880E4F' : '#fff', color: filterMaterial === m ? '#fff' : '#666', borderColor: filterMaterial === m ? '#880E4F' : '#ddd' }}>
              {m === 'all' ? 'All' : m === 'unset' ? 'Unset' : m}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={40} /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, marginBottom: 12 }}>No products found</div>
            <button className="btn-gold" onClick={() => navigate('/admin/products/add')}>Add First Product</button>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: 'var(--ink-40)', marginBottom: 16, letterSpacing: '.04em' }}>{filtered.length} products</div>
            <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 3, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ink-10)' }}>
                    {['Product', 'Category', 'Material Type', 'Price', 'Stock', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => {
                    const currentMaterial = getMaterialType(p)
                    return (
                      <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--ink-5)' : 'none', transition: 'background .15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 3, overflow: 'hidden', background: '#f5f5f3', flexShrink: 0 }}>
                              {p.images?.[0] && <img src={p.images[0]} alt={p.name} loading="lazy" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-60)' }}>{p.category}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <MaterialBadge type={currentMaterial} />
                            <select
                              value={currentMaterial || ''}
                              onChange={e => handleMaterialToggle(p, e.target.value)}
                              disabled={togglingMaterial === p.id}
                              style={{ fontSize: 11, padding: '4px 8px', border: '1.5px solid #E0E0E0', borderRadius: 4, background: '#fff', cursor: 'pointer', fontFamily: "'Jost',sans-serif", color: '#333', width: 'fit-content', opacity: togglingMaterial === p.id ? .5 : 1 }}
                            >
                              <option value="">— Set type —</option>
                              {MATERIAL_TYPES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700 }}>{fmt(p.price)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: p.stock <= 3 ? '#e65100' : p.stock === 0 ? '#c0392b' : '#2e7d32' }}>{p.stock}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn-outline" style={{ padding: '6px 14px', fontSize: 11 }} onClick={() => navigate(`/admin/products/edit/${p.id}`)}>Edit</button>
                            <button style={{ padding: '6px 14px', fontSize: 11, fontWeight: 700, background: '#fdecea', color: '#c0392b', border: 'none', borderRadius: 2, cursor: 'pointer', fontFamily: "'Jost',sans-serif", opacity: deleting === p.id ? .5 : 1 }}
                              onClick={() => handleDelete(p.id)} disabled={deleting === p.id}>
                              {deleting === p.id ? '…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

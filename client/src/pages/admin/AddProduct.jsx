import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../utils/api'
import { AdminNav } from './Dashboard'
import { Spinner } from '../../components/UI'
import { useToast } from '../../context/ToastContext'

const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Sets']

// Defined outside component so it is not recreated on every render
// (re-creating causes React to unmount/remount the input, losing cursor position)
const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>
      {label}{required && ' *'}
    </label>
    {children}
  </div>
)

export default function AdminAddProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useToast()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: 'Rings', subcategory: '', stock: '', tags: '', images: []
  })
  const [manualUrl, setManualUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) {
      setLoading(false)
      return
    }
    api.get(`/products/${id}`).then(r => {
      const p = r.data
      setForm({
        name: p.name || '', 
        description: p.description || '', 
        price: p.price || '',
        originalPrice: p.originalPrice || '', 
        category: p.category || 'Rings',
        subcategory: p.subcategory || '', 
        stock: p.stock || '',
        tags: p.tags?.join(', ') || '', 
        images: p.images || []
      })
    }).catch(err => {
      showToast('Failed to load product')
      navigate('/admin/products')
    }).finally(() => setLoading(false))
  }, [id, isEdit])

  const set = k => e => {
    const val = e.target.value
    setForm(f => ({ ...f, [k]: val }))
  }

  const toggleTag = (tag) => {
    setForm(f => {
      const currentTags = f.tags.split(',').map(t => t.trim()).filter(Boolean)
      if (currentTags.includes(tag)) {
        return { ...f, tags: currentTags.filter(t => t !== tag).join(', ') }
      } else {
        return { ...f, tags: [...currentTags, tag].join(', ') }
      }
    })
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const inputEl = e.target
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('images', f))
      const { data } = await api.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm(f => ({ ...f, images: [...f.images, ...data.map(d => d.url)] }))
      showToast(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`)
    } catch (err) {
      const msg = err.response?.data?.error || ''
      if (msg.includes('not configured') || msg.includes('CLOUDINARY')) {
        showToast('Image upload not configured. Please set CLOUDINARY_URL in server environment variables, or paste image URLs directly below.')
      } else {
        showToast('Upload failed. You can also paste image URLs directly in the field below.')
      }
    }
    finally { setUploading(false); inputEl.value = '' }
  }

  const removeImage = idx => setForm(f => ({ ...f, images: f.images.filter((_, i) => i !== idx) }))

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) { showToast('Please fill name, price & stock'); return }
    setSaving(true)
    try {
      const payload = {
        name: form.name, description: form.description,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : null,
        category: form.category, subcategory: form.subcategory || null,
        stock: parseInt(form.stock),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images: form.images, isActive: true
      }
      if (isEdit) { await api.put(`/products/${id}`, payload); showToast('Product updated') }
      else { await api.post('/products', payload); showToast('Product created') }
      navigate('/admin/products')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save')
    } finally { setSaving(false) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/products" />
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={40} /></div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/products" />
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 5% 60px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Admin</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 36 }}>
          {isEdit ? 'Edit Product' : 'Add New Product'}
        </h1>

        <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 3, padding: 32 }}>
          <Field label="Product Name" required>
            <input className="input-field" placeholder="e.g. Eternal Rose Gold Ring" value={form.name} onChange={set('name')} />
          </Field>

          <Field label="Description">
            <textarea className="input-field" style={{ resize: 'vertical', minHeight: 100 }} rows={4} placeholder="Describe the product…" value={form.description} onChange={set('description')} />
          </Field>

          <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Price (₹) *</label>
              <input className="input-field" type="number" placeholder="45000" value={form.price} onChange={set('price')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Original Price (₹)</label>
              <input className="input-field" type="number" placeholder="52000" value={form.originalPrice} onChange={set('originalPrice')} />
            </div>
          </div>

          <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Category *</label>
              <select className="input-field" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Material Type</label>
              <select className="input-field" value={form.subcategory} onChange={set('subcategory')}>
                <option value="">— None —</option>
                {['Silver', 'Silver Coated', 'Gold', 'Platinum', 'Diamond'].map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Stock *</label>
              <input className="input-field" type="number" placeholder="10" value={form.stock} onChange={set('stock')} />
            </div>
          </div>

          <Field label="Tags (comma-separated)">
            <input className="input-field" placeholder="ring, gold, bestseller, new" value={form.tags} onChange={set('tags')} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {['new arrivals', 'trending products', 'shop by colors', 'shop by bonds'].map(t => {
                const isActive = form.tags.split(',').map(x => x.trim().toLowerCase()).includes(t)
                return (
                  <button 
                    key={t} 
                    onClick={() => toggleTag(t)}
                    style={{ 
                      padding: '4px 10px', borderRadius: 4, fontSize: 10, fontWeight: 700, 
                      textTransform: 'uppercase', letterSpacing: '.05em', cursor: 'pointer',
                      background: isActive ? 'var(--gold)' : 'var(--ink-5)',
                      color: isActive ? '#fff' : 'var(--ink-40)',
                      border: 'none', transition: 'all .2s'
                    }}
                  >
                    {isActive ? '✓ ' : '+ '}{t}
                  </button>
                )
              })}
            </div>
          </Field>

          {/* Images */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 12 }}>Product Images</label>
            {form.images.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {form.images.map((url, i) => (
                  <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 3, overflow: 'hidden', background: '#f5f5f3' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&auto=format&fit=crop&q=80' }} />
                    <button
                      onClick={() => removeImage(i)}
                      style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
            <label style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              padding: '24px 20px', border: '2px dashed var(--ink-10)', borderRadius: 3,
              cursor: 'pointer', transition: 'border-color .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--ink-10)'}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--ink-40)" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style={{ fontSize: 13, color: 'var(--ink-60)', fontWeight: 500 }}>
                {uploading ? 'Uploading…' : 'Click to upload images (requires Cloudinary setup)'}
              </span>
              <span style={{ fontSize: 11, color: 'var(--ink-40)' }}>JPG, PNG, WEBP up to 10MB</span>
              <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
            </label>
            {uploading && <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}><Spinner size={20} /></div>}

            {/* Manual URL input fallback */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-40)', marginBottom: 8, textAlign: 'center' }}>— or paste image URL directly —</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="input-field"
                  placeholder="https://example.com/jewellery-image.jpg"
                  value={manualUrl}
                  onChange={e => setManualUrl(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const url = manualUrl.trim()
                      if (url) {
                        setForm(f => ({ ...f, images: [...f.images, url] }))
                        setManualUrl('')
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  className="btn-outline"
                  style={{ flexShrink: 0, padding: '0 16px' }}
                  onClick={() => {
                    const url = manualUrl.trim()
                    if (url) {
                      setForm(f => ({ ...f, images: [...f.images, url] }))
                      setManualUrl('')
                    }
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn-gold"
              style={{ flex: 1, padding: '15px', fontSize: 13, opacity: (saving || uploading) ? .6 : 1 }}
              onClick={handleSave}
              disabled={saving || uploading}
            >
              {saving
                ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Spinner size={16} color="#fff" /> Saving…</span>
                : isEdit ? 'Update Product' : 'Create Product'
              }
            </button>
            <button className="btn-outline" style={{ padding: '15px 24px' }} onClick={() => navigate('/admin/products')}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../utils/api'
import { AdminNav } from './Dashboard'
import { Spinner } from '../../components/UI'
import { useToast } from '../../context/ToastContext'

const CATEGORIES = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants', 'Sets']

export default function AdminAddProduct() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useToast()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '', description: '', price: '', originalPrice: '',
    category: 'Rings', subcategory: '', stock: '', tags: '', images: []
  })
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    api.get(`/products/${id}`).then(r => {
      const p = r.data
      setForm({
        name: p.name, description: p.description || '', price: p.price,
        originalPrice: p.originalPrice || '', category: p.category,
        subcategory: p.subcategory || '', stock: p.stock,
        tags: p.tags?.join(', ') || '', images: p.images || []
      })
    }).finally(() => setLoading(false))
  }, [id])

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    setUploading(true)
    try {
      const formData = new FormData()
      files.forEach(f => formData.append('images', f))
      const { data } = await api.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setForm(f => ({ ...f, images: [...f.images, ...data.map(d => d.url)] }))
      showToast(`${files.length} image${files.length > 1 ? 's' : ''} uploaded`)
    } catch { showToast('Upload failed') }
    finally { setUploading(false) }
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

  const Field = ({ label, required, children }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>
        {label}{required && ' *'}
      </label>
      {children}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Price (₹) *</label>
              <input className="input-field" type="number" placeholder="45000" value={form.price} onChange={set('price')} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Original Price (₹)</label>
              <input className="input-field" type="number" placeholder="52000" value={form.originalPrice} onChange={set('originalPrice')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Category *</label>
              <select className="input-field" value={form.category} onChange={set('category')}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Stock *</label>
              <input className="input-field" type="number" placeholder="10" value={form.stock} onChange={set('stock')} />
            </div>
          </div>

          <Field label="Tags (comma-separated)">
            <input className="input-field" placeholder="ring, gold, bestseller, new" value={form.tags} onChange={set('tags')} />
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
                {uploading ? 'Uploading to Cloudinary…' : 'Click to upload product images'}
              </span>
              <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} disabled={uploading} />
            </label>
            {uploading && <div style={{ display: 'flex', justifyContent: 'center', marginTop: 12 }}><Spinner size={20} /></div>}
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

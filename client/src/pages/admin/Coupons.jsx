import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { AdminNav } from './Dashboard'
import { Spinner } from '../../components/UI'
import { useToast } from '../../context/ToastContext'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

const EMPTY_FORM = {
  code: '', type: 'percent', value: '', minOrder: '', maxUses: '', expiresAt: '', isActive: true,
}

function CouponForm({ initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.code.trim()) return alert('Coupon code is required')
    if (!form.value) return alert('Discount value is required')
    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: parseFloat(form.value),
      minOrder: parseFloat(form.minOrder) || 0,
      maxUses: form.maxUses ? parseInt(form.maxUses) : null,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      isActive: form.isActive,
    }
    onSave(payload)
  }

  const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--ink-10)', borderRadius: 3, fontSize: 13, fontFamily: "'Jost',sans-serif", outline: 'none', background: '#fff', boxSizing: 'border-box' }
  const labelStyle = { fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 6, display: 'block' }

  return (
    <div style={{ background: '#fff', border: '1.5px solid var(--ink-10)', borderRadius: 4, padding: 28, marginBottom: 28 }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, marginBottom: 24, color: 'var(--ink)' }}>
        {initial ? 'Edit Coupon' : 'Add New Coupon'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={labelStyle}>Coupon Code *</label>
          <input style={inputStyle} placeholder="e.g. WELCOME20" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} />
        </div>
        <div>
          <label style={labelStyle}>Type *</label>
          <select style={inputStyle} value={form.type} onChange={e => set('type', e.target.value)}>
            <option value="percent">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Discount Value * {form.type === 'percent' ? '(%)' : '(₹)'}</label>
          <input style={inputStyle} type="number" min="0" placeholder={form.type === 'percent' ? '20' : '200'} value={form.value} onChange={e => set('value', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Min Order (₹)</label>
          <input style={inputStyle} type="number" min="0" placeholder="0 = no minimum" value={form.minOrder} onChange={e => set('minOrder', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Max Uses</label>
          <input style={inputStyle} type="number" min="1" placeholder="Leave blank = unlimited" value={form.maxUses} onChange={e => set('maxUses', e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>Expires At</label>
          <input style={inputStyle} type="datetime-local" value={form.expiresAt} onChange={e => set('expiresAt', e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <div
          onClick={() => set('isActive', !form.isActive)}
          style={{ width: 44, height: 24, borderRadius: 12, background: form.isActive ? '#880E4F' : '#ddd', cursor: 'pointer', transition: 'background .2s', position: 'relative', flexShrink: 0 }}
        >
          <div style={{ position: 'absolute', top: 3, left: form.isActive ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-60)' }}>Active</span>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn-gold" onClick={handleSubmit} disabled={saving} style={{ opacity: saving ? .6 : 1 }}>
          {saving ? 'Saving…' : initial ? 'Update Coupon' : 'Create Coupon'}
        </button>
        <button className="btn-outline" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default function AdminCoupons() {
  const { showToast } = useToast()
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [toggling, setToggling] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/admin/coupons').then(r => setCoupons(r.data || [])).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (payload) => {
    setSaving(true)
    try {
      const r = await api.post('/admin/coupons', payload)
      setCoupons(prev => [r.data, ...prev])
      setShowForm(false)
      showToast('Coupon created')
    } catch (e) {
      showToast(e?.response?.data?.error || 'Failed to create coupon')
    }
    setSaving(false)
  }

  const handleUpdate = async (payload) => {
    setSaving(true)
    try {
      const r = await api.put(`/coupons/${editing.id}`, payload)
      setCoupons(prev => prev.map(c => c.id === editing.id ? r.data : c))
      setEditing(null)
      showToast('Coupon updated')
    } catch {
      showToast('Failed to update coupon')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon permanently?')) return
    setDeleting(id)
    try {
      await api.delete(`/admin/coupons/${id}`)
      setCoupons(prev => prev.filter(c => c.id !== id))
      showToast('Coupon deleted')
    } catch {
      showToast('Failed to delete')
    }
    setDeleting(null)
  }

  const handleToggle = async (coupon) => {
    setToggling(coupon.id)
    try {
      const r = await api.put(`/coupons/${coupon.id}`, { isActive: !coupon.isActive })
      setCoupons(prev => prev.map(c => c.id === coupon.id ? r.data : c))
      showToast(coupon.isActive ? 'Coupon deactivated' : 'Coupon activated')
    } catch {
      showToast('Failed to update')
    }
    setToggling(null)
  }

  const isExpired = c => c.expiresAt && new Date(c.expiresAt) < new Date()
  const isLimitHit = c => c.maxUses && c.usedCount >= c.maxUses

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/coupons" />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 5% 60px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 4 }}>Discount Management</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 600, color: 'var(--ink)', margin: 0 }}>Coupons</h1>
          </div>
          {!showForm && !editing && (
            <button className="btn-gold" onClick={() => setShowForm(true)}>+ Add Coupon</button>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <CouponForm
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        )}

        {/* Edit form */}
        {editing && (
          <CouponForm
            initial={{
              code: editing.code,
              type: editing.type,
              value: String(editing.value),
              minOrder: String(editing.minOrder || ''),
              maxUses: editing.maxUses ? String(editing.maxUses) : '',
              expiresAt: editing.expiresAt ? new Date(editing.expiresAt).toISOString().slice(0, 16) : '',
              isActive: editing.isActive,
            }}
            onSave={handleUpdate}
            onCancel={() => setEditing(null)}
            saving={saving}
          />
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={40} /></div>
        ) : coupons.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🏷️</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, marginBottom: 12, color: 'var(--ink)' }}>No coupons yet</div>
            <div style={{ fontSize: 13, color: 'var(--ink-40)', marginBottom: 24 }}>Create your first discount coupon to reward customers.</div>
            {!showForm && <button className="btn-gold" onClick={() => setShowForm(true)}>+ Add First Coupon</button>}
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 3, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ink-10)' }}>
                  {['Code', 'Discount', 'Min Order', 'Usage', 'Expires', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {coupons.map((c, i) => {
                  const expired = isExpired(c)
                  const limitHit = isLimitHit(c)
                  const effectivelyInactive = !c.isActive || expired || limitHit
                  return (
                    <tr key={c.id}
                      style={{ borderBottom: i < coupons.length - 1 ? '1px solid var(--ink-5)' : 'none', transition: 'background .15s', opacity: effectivelyInactive ? .65 : 1 }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink)', background: '#f7f4ef', padding: '4px 10px', borderRadius: 3, border: '1px solid var(--ink-10)' }}>
                          {c.code}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 14, fontWeight: 700, color: '#880E4F' }}>
                        {c.type === 'percent' ? `${c.value}%` : fmt(c.value)}
                        <div style={{ fontSize: 10, color: 'var(--ink-40)', fontWeight: 500, marginTop: 2 }}>{c.type === 'percent' ? 'percentage' : 'flat'}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--ink-60)' }}>
                        {c.minOrder > 0 ? fmt(c.minOrder) : <span style={{ color: 'var(--ink-20)' }}>—</span>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: limitHit ? '#c0392b' : 'var(--ink)' }}>
                          {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                        </div>
                        {!c.maxUses && <div style={{ fontSize: 10, color: 'var(--ink-40)' }}>unlimited</div>}
                        {limitHit && <div style={{ fontSize: 10, color: '#c0392b', fontWeight: 700 }}>LIMIT HIT</div>}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: expired ? '#c0392b' : 'var(--ink-60)', fontWeight: expired ? 700 : 400 }}>
                        {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : <span style={{ color: 'var(--ink-20)' }}>Never</span>}
                        {expired && <div style={{ fontSize: 10 }}>EXPIRED</div>}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div
                          onClick={() => !toggling && handleToggle(c)}
                          style={{ width: 44, height: 24, borderRadius: 12, background: c.isActive ? '#880E4F' : '#ddd', cursor: toggling === c.id ? 'wait' : 'pointer', transition: 'background .2s', position: 'relative', opacity: toggling === c.id ? .6 : 1 }}
                        >
                          <div style={{ position: 'absolute', top: 3, left: c.isActive ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--ink-40)', marginTop: 4, fontWeight: 600 }}>{c.isActive ? 'Active' : 'Off'}</div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn-outline" style={{ padding: '6px 12px', fontSize: 11 }}
                            onClick={() => { setEditing(c); setShowForm(false) }}>Edit</button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            disabled={deleting === c.id}
                            style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, background: '#fdecea', color: '#c0392b', border: 'none', borderRadius: 2, cursor: 'pointer', fontFamily: "'Jost',sans-serif", opacity: deleting === c.id ? .5 : 1 }}
                          >
                            {deleting === c.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

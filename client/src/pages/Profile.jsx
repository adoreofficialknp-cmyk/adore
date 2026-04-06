import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../utils/api'

// ── Ring Sizer Component ──────────────────────────────────────────────────
function RingSizer({ onClose }) {
  const [method, setMethod] = useState('circumference') // circumference | diameter
  const [value, setValue] = useState('')

  const RING_SIZES = [
    { us: 5, india: 9, mm: 15.7 }, { us: 5.5, india: 10, mm: 16.1 },
    { us: 6, india: 11, mm: 16.5 }, { us: 6.5, india: 12, mm: 16.9 },
    { us: 7, india: 13, mm: 17.3 }, { us: 7.5, india: 14, mm: 17.7 },
    { us: 8, india: 15, mm: 18.2 }, { us: 8.5, india: 16, mm: 18.6 },
    { us: 9, india: 17, mm: 19.0 }, { us: 9.5, india: 18, mm: 19.4 },
    { us: 10, india: 19, mm: 19.8 }, { us: 10.5, india: 20, mm: 20.2 },
    { us: 11, india: 21, mm: 20.6 }, { us: 11.5, india: 22, mm: 21.0 },
    { us: 12, india: 23, mm: 21.4 },
  ]

  const getResult = () => {
    const v = parseFloat(value)
    if (!v || isNaN(v)) return null
    const mm = method === 'circumference' ? v / Math.PI : v
    const closest = RING_SIZES.reduce((a, b) => Math.abs(b.mm - mm) < Math.abs(a.mm - mm) ? b : a)
    return closest
  }

  const result = getResult()

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 28, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,.2)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 4 }}>Tool</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, margin: 0 }}>Ring Sizer</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-40)', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: 4, padding: '12px 14px', fontSize: 12, color: 'var(--ink-60)', lineHeight: 1.6, marginBottom: 20 }}>
          💡 Use a string or strip of paper, wrap it around your finger, mark where it meets, then measure with a ruler.
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {[{ id: 'circumference', label: 'Circumference (mm)' }, { id: 'diameter', label: 'Diameter (mm)' }].map(m => (
            <button key={m.id} onClick={() => { setMethod(m.id); setValue('') }} style={{ flex: 1, padding: '10px 8px', border: `1.5px solid ${method === m.id ? 'var(--gold)' : 'var(--ink-20)'}`, borderRadius: 4, background: method === m.id ? 'var(--gold-bg)' : '#fff', color: method === m.id ? 'var(--gold)' : 'var(--ink-60)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Jost',sans-serif", transition: 'all .2s' }}>
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>
            Measurement in mm
          </label>
          <input
            type="number"
            className="input-field"
            placeholder={method === 'circumference' ? 'e.g. 52' : 'e.g. 16.5'}
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{ fontSize: 18, fontWeight: 700, textAlign: 'center' }}
          />
        </div>

        {result && (
          <div style={{ background: 'linear-gradient(135deg, var(--gold-bg), #fff)', border: '1.5px solid var(--gold)', borderRadius: 6, padding: '18px 20px', marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 10 }}>Your Ring Size</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32 }}>
              <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{result.india}</div><div style={{ fontSize: 10, color: 'var(--ink-40)', fontWeight: 600, marginTop: 4, letterSpacing: '.08em', textTransform: 'uppercase' }}>India</div></div>
              <div style={{ width: 1, background: 'var(--gold-border)' }} />
              <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{result.us}</div><div style={{ fontSize: 10, color: 'var(--ink-40)', fontWeight: 600, marginTop: 4, letterSpacing: '.08em', textTransform: 'uppercase' }}>US</div></div>
              <div style={{ width: 1, background: 'var(--gold-border)' }} />
              <div><div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{result.mm}</div><div style={{ fontSize: 10, color: 'var(--ink-40)', fontWeight: 600, marginTop: 4, letterSpacing: '.08em', textTransform: 'uppercase' }}>mm dia</div></div>
            </div>
          </div>
        )}

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 10 }}>Size Chart</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ borderBottom: '1px solid var(--ink-10)' }}>
              {['India', 'US', 'Diameter (mm)'].map(h => <th key={h} style={{ padding: '6px 10px', textAlign: 'center', color: 'var(--ink-40)', fontWeight: 700, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {RING_SIZES.map((s, i) => (
                <tr key={i} style={{ background: result?.india === s.india ? 'var(--gold-bg)' : i % 2 === 0 ? '#fafaf8' : '#fff', transition: 'background .2s' }}>
                  <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: result?.india === s.india ? 800 : 600, color: result?.india === s.india ? 'var(--gold)' : 'var(--ink)' }}>{s.india}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'center', color: 'var(--ink-60)' }}>{s.us}</td>
                  <td style={{ padding: '7px 10px', textAlign: 'center', color: 'var(--ink-60)' }}>{s.mm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Edit Profile Modal ────────────────────────────────────────────────────
function EditProfile({ user, onClose, onSaved }) {
  const { showToast } = useToast()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [saving, setSaving] = useState(false)
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Name is required'); return }
    setSaving(true)
    try {
      await api.put('/auth/profile', form)
      showToast('Profile updated successfully!')
      onSaved(form)
      onClose()
    } catch {
      showToast('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 600 }}>Edit Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-40)', padding: 4 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Full Name *</label>
          <input className="input-field" value={form.name} onChange={set('name')} placeholder="Your full name" />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Email</label>
          <input className="input-field" value={user?.email} disabled style={{ background: 'var(--gold-bg)', color: 'var(--ink-40)', cursor: 'not-allowed' }} />
          <div style={{ fontSize: 11, color: 'var(--ink-40)', marginTop: 4 }}>Email cannot be changed</div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Phone Number</label>
          <input className="input-field" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="btn-gold" style={{ flex: 2 }} disabled={saving} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, isAdmin, updateUser } = useAuth()
  const { showToast } = useToast()
  const [showRingSizer, setShowRingSizer] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [localUser, setLocalUser] = useState(user)

  const handleLogout = () => {
    logout()
    showToast('Signed out. See you soon!')
    navigate('/')
  }

  const handleProfileSaved = (updates) => {
    setLocalUser(u => ({ ...u, ...updates }))
    updateUser(updates)   // sync to AuthContext + localStorage
  }

  const MENU = [
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>, label: 'My Orders', path: '/orders' },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, label: 'Wishlist', path: '/wishlist' },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.81L23 6H6"/></svg>, label: 'My Cart', path: '/cart' },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>, label: 'Custom Jewellery', path: '/custom-jewellery' },
    ...(isAdmin ? [{ icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Admin Dashboard', path: '/admin', gold: true }] : []),
  ]

  const INFO_MENU = [
    { label: 'Notifications', icon: '🔔', path: '/notifications' },
    { label: 'Help & Support', icon: '💬', path: '/help' },
    { label: 'Privacy Policy', icon: '🔐', path: '/privacy' },
    { label: '💍 Ring Sizer Tool', icon: '', path: null, action: () => setShowRingSizer(true), gold: true },
  ]

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%', maxWidth: 680, margin: '0 auto' }}>
      {showRingSizer && <RingSizer onClose={() => setShowRingSizer(false)} />}
      {showEditProfile && <EditProfile user={localUser} onClose={() => setShowEditProfile(false)} onSaved={handleProfileSaved} />}

      <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Account</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 36, lineHeight: 1.1 }}>My Profile</h1>

      {/* User card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 28, background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: 3, marginBottom: 32 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: '#fff',
        }}>
          {localUser?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{localUser?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: localUser?.phone ? 4 : 0 }}>{localUser?.email}</div>
          {localUser?.phone && <div style={{ fontSize: 13, color: 'var(--ink-60)' }}>{localUser.phone}</div>}
          {isAdmin && (
            <span style={{ display: 'inline-block', marginTop: 8, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 10px', background: 'var(--gold)', color: '#fff', borderRadius: 2 }}>
              Admin
            </span>
          )}
        </div>
        <button
          onClick={() => setShowEditProfile(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'transparent', border: '1.5px solid var(--gold-border)', borderRadius: 3, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: 'var(--gold)', fontFamily: "'Jost',sans-serif", letterSpacing: '.08em', textTransform: 'uppercase', flexShrink: 0, transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--gold)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Edit
        </button>
      </div>

      {/* Main menu */}
      <div style={{ borderTop: '1px solid var(--ink-10)', marginBottom: 8 }}>
        {MENU.map(item => (
          <button
            key={item.label}
            onClick={() => item.path !== '#' && navigate(item.path)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 0',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              borderBottom: '1px solid var(--ink-10)',
              background: 'none', cursor: 'pointer', textAlign: 'left',
              color: item.gold ? 'var(--gold)' : 'var(--ink)', fontFamily: "'Jost',sans-serif",
              transition: 'color .2s',
            }}
            onMouseEnter={e => { if (!item.gold) e.currentTarget.style.color = 'var(--gold)' }}
            onMouseLeave={e => { if (!item.gold) e.currentTarget.style.color = 'var(--ink)' }}
          >
            <span style={{ color: item.gold ? 'var(--gold)' : 'var(--ink-40)', display: 'flex', flexShrink: 0 }}>{item.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{item.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ))}
      </div>

      {/* Info menu */}
      <div style={{ borderTop: '1px solid var(--ink-10)', marginBottom: 32 }}>
        {INFO_MENU.map(item => (
          <button
            key={item.label}
            onClick={() => item.action ? item.action() : item.path && navigate(item.path)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 0',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              borderBottom: '1px solid var(--ink-5)',
              background: 'none', cursor: 'pointer', textAlign: 'left',
              color: item.gold ? 'var(--gold)' : 'var(--ink-60)', fontFamily: "'Jost',sans-serif",
              transition: 'color .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = item.gold ? 'var(--gold)' : 'var(--ink-60)'}
          >
            {item.icon && <span style={{ fontSize: 16 }}>{item.icon}</span>}
            <span style={{ fontSize: 13, fontWeight: item.gold ? 700 : 500, flex: 1 }}>{item.label}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          width: '100%', padding: '14px', background: 'transparent',
          border: '1.5px solid rgba(192,57,43,.3)', borderRadius: 2, cursor: 'pointer',
          fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
          color: '#c0392b', fontFamily: "'Jost',sans-serif", transition: 'all .2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c0392b' }}
      >
        Sign Out
      </button>
      <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-40)', marginTop: 16, letterSpacing: '.04em' }}>ADORE Fine Jewellery · v1.0.0</div>
    </div>
  )
}

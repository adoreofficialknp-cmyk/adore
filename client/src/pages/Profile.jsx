import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, isAdmin } = useAuth()
  const { showToast } = useToast()

  const handleLogout = () => {
    logout()
    showToast('Signed out. See you soon!')
    navigate('/')
  }

  const MENU = [
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>, label: 'My Orders', path: '/orders' },
    { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, label: 'Wishlist', path: '/wishlist' },
    ...(isAdmin ? [{ icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Admin Dashboard', path: '/admin', gold: true }] : []),
  ]

  const INFO_MENU = [
    { label: 'Delivery Addresses', path: '#' },
    { label: 'Payment Methods', path: '#' },
    { label: 'Notifications', path: '#' },
    { label: 'Help & Support', path: '#' },
    { label: 'Terms & Privacy', path: '#' },
  ]

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%', maxWidth: 680, margin: '0 auto' }}>
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
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{user?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-60)' }}>{user?.email}</div>
          {isAdmin && (
            <span style={{ display: 'inline-block', marginTop: 8, fontSize: 10, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 10px', background: 'var(--gold)', color: '#fff', borderRadius: 2 }}>
              Admin
            </span>
          )}
        </div>
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
              background: 'none', cursor: item.path !== '#' ? 'pointer' : 'default', textAlign: 'left',
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
            style={{
              width: '100%', display: 'flex', alignItems: 'center',
              padding: '16px 0',
              borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              borderBottom: '1px solid var(--ink-5)',
              background: 'none', cursor: 'pointer', textAlign: 'left',
              color: 'var(--ink-60)', fontFamily: "'Jost',sans-serif",
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{item.label}</span>
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

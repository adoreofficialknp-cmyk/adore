import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const SAMPLE_NOTIFS = [
  { id: 1, type: 'order', icon: '📦', title: 'Order Shipped!', body: 'Your order #ADR8821 has been dispatched and is on its way.', time: '2 hours ago', read: false },
  { id: 2, type: 'offer', icon: '🎉', title: 'Exclusive Offer for You', body: 'Use ADORE10 to get 10% off on your next purchase. Valid till Sunday.', time: '1 day ago', read: false },
  { id: 3, type: 'order', icon: '✅', title: 'Order Delivered', body: 'Your order #ADR8790 has been delivered. We hope you love it!', time: '3 days ago', read: true },
  { id: 4, type: 'system', icon: '💎', title: 'New Collection Launched', body: 'Our Bridal 2025 collection is now live. Explore stunning new pieces.', time: '5 days ago', read: true },
  { id: 5, type: 'offer', icon: '🏷️', title: 'Flash Sale Alert', body: 'Diwali sale ends in 24 hours. Up to 20% off on festive picks!', time: '1 week ago', read: true },
]

export default function Notifications() {
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState(SAMPLE_NOTIFS)
  const [prefs, setPrefs] = useState({
    orders: true, offers: true, newArrivals: false, reminders: true
  })

  const markAllRead = () => setNotifs(n => n.map(i => ({ ...i, read: true })))
  const markRead = id => setNotifs(n => n.map(i => i.id === id ? { ...i, read: true } : i))
  const deleteNotif = id => setNotifs(n => n.filter(i => i.id !== id))
  const unreadCount = notifs.filter(n => !n.read).length
  const togglePref = k => setPrefs(p => ({ ...p, [k]: !p[k] }))

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%', maxWidth: 680, margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-60)', fontSize: 13, fontWeight: 600, fontFamily: "'Jost',sans-serif", marginBottom: 28, padding: 0 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 4 }}>Inbox</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1 }}>
            Notifications
            {unreadCount > 0 && (
              <span style={{ fontSize: 14, fontWeight: 700, background: 'var(--gold)', color: '#fff', borderRadius: 12, padding: '2px 10px', marginLeft: 12, fontFamily: "'Jost',sans-serif", verticalAlign: 'middle' }}>{unreadCount}</span>
            )}
          </h1>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ fontSize: 12, fontWeight: 700, color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '.06em', fontFamily: "'Jost',sans-serif", textTransform: 'uppercase' }}>
            Mark all read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div style={{ marginBottom: 40, border: '1px solid var(--ink-10)', borderRadius: 4, overflow: 'hidden' }}>
        {notifs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No notifications yet</div>
            <div style={{ fontSize: 13, color: 'var(--ink-40)' }}>You're all caught up!</div>
          </div>
        ) : (
          notifs.map((n, i) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                display: 'flex', gap: 14, padding: '16px 18px',
                background: n.read ? '#fff' : 'var(--gold-bg)',
                borderBottom: i < notifs.length - 1 ? '1px solid var(--ink-5)' : 'none',
                cursor: 'pointer', transition: 'background .2s', position: 'relative'
              }}
            >
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: n.read ? 'var(--ink-5)' : 'var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {n.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: n.read ? 600 : 700, color: 'var(--ink)' }}>{n.title}</div>
                  {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0, marginTop: 4 }} />}
                </div>
                <div style={{ fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.5, marginBottom: 6 }}>{n.body}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-40)', letterSpacing: '.04em' }}>{n.time}</div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-20)', padding: 4, alignSelf: 'flex-start', flexShrink: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#e53935'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-20)'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Preferences */}
      <div>
        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Preferences</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(20px,2vw,28px)', fontWeight: 600, marginBottom: 20 }}>Notification Settings</h2>
        <div style={{ border: '1px solid var(--ink-10)', borderRadius: 4, overflow: 'hidden' }}>
          {[
            { key: 'orders', label: 'Order Updates', desc: 'Shipping, delivery and return updates' },
            { key: 'offers', label: 'Offers & Promotions', desc: 'Exclusive discounts and flash sales' },
            { key: 'newArrivals', label: 'New Arrivals', desc: 'Be first to know about new collections' },
            { key: 'reminders', label: 'Wishlist Reminders', desc: 'Price drops on your saved items' },
          ].map((p, i, arr) => (
            <div key={p.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--ink-5)' : 'none', background: '#fff' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-40)' }}>{p.desc}</div>
              </div>
              <button
                onClick={() => togglePref(p.key)}
                style={{
                  width: 46, height: 26, borderRadius: 13,
                  background: prefs[p.key] ? 'var(--gold)' : 'var(--ink-20)',
                  border: 'none', cursor: 'pointer', position: 'relative',
                  transition: 'background .2s', flexShrink: 0,
                }}
              >
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', background: '#fff',
                  position: 'absolute', top: 3,
                  left: prefs[p.key] ? 22 : 3,
                  transition: 'left .2s',
                  boxShadow: '0 1px 4px rgba(0,0,0,.15)',
                }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

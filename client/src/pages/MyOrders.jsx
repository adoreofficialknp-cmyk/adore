import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Spinner, EmptyState, Icons } from '../components/UI'

const STATUS_COLOR = {
  PENDING: { bg: '#fff8e1', text: '#e65100' },
  CONFIRMED: { bg: '#e3f2fd', text: '#1565c0' },
  PROCESSING: { bg: '#e3f2fd', text: '#1565c0' },
  SHIPPED: { bg: '#e8f5e9', text: '#2e7d32' },
  DELIVERED: { bg: '#e8f5e9', text: '#1b5e20' },
  CANCELLED: { bg: '#fdecea', text: '#c0392b' },
  RETURNED: { bg: '#f3e5f5', text: '#6a1b9a' },
}

const fmt = n => `₹${Number(n)?.toLocaleString('en-IN') || 0}`

export default function MyOrders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Spinner size={40} />
    </div>
  )

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%', maxWidth: 800, margin: '0 auto' }}>
      <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Account</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 36, lineHeight: 1.1 }}>My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>}
          title="No orders yet"
          subtitle="Your orders will appear here once you shop"
          action={<button className="btn-gold" onClick={() => navigate('/shop')}>Start Shopping</button>}
        />
      ) : (
        <div style={{ borderTop: '1px solid var(--ink-10)' }}>
          {orders.map(order => {
            const sc = STATUS_COLOR[order.status] || STATUS_COLOR.PENDING
            return (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                style={{
                  padding: '24px 0', borderBottom: '1px solid var(--ink-10)', cursor: 'pointer',
                  transition: 'opacity .2s',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '.75'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: 'monospace', marginBottom: 4, letterSpacing: '.04em' }}>
                      #{order.id.slice(-8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--ink-60)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 2, background: sc.bg, color: sc.text }}>
                      {order.status}
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{fmt(order.total)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {order.items.slice(0, 4).map((item, i) => (
                      <div key={i} style={{ width: 52, height: 52, borderRadius: 3, overflow: 'hidden', background: '#f5f5f3', flexShrink: 0 }}>
                        {item.image && <img src={item.image} alt={item.name} loading="lazy" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&auto=format&fit=crop&q=80' }} />}
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div style={{ width: 52, height: 52, borderRadius: 3, background: 'var(--gold-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--ink-60)', flexShrink: 0 }}>
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: 'var(--ink-40)', fontSize: 12 }}>
                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    {Icons.chevRight}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

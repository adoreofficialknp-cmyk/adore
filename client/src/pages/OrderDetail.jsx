import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Spinner, Icons } from '../components/UI'

const fmt = n => `₹${Number(n)?.toLocaleString('en-IN') || 0}`

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
const STATUS_COLOR = {
  PENDING:    { bg: '#fff8e1', text: '#e65100' },
  CONFIRMED:  { bg: '#e3f2fd', text: '#1565c0' },
  PROCESSING: { bg: '#e3f2fd', text: '#1565c0' },
  SHIPPED:    { bg: '#e8f5e9', text: '#2e7d32' },
  DELIVERED:  { bg: '#e8f5e9', text: '#1b5e20' },
  CANCELLED:  { bg: '#fdecea', text: '#c0392b' },
  RETURNED:   { bg: '#f3e5f5', text: '#6a1b9a' },
}

const STEP_ICONS = {
  PENDING:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  CONFIRMED:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  PROCESSING: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>,
  SHIPPED:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  DELIVERED:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
}

export default function OrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data)).finally(() => setLoading(false))
  }, [id])

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return
    setCancelling(true)
    try {
      const { data } = await api.put(`/orders/${id}/cancel`)
      setOrder(data)
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot cancel this order')
    } finally { setCancelling(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Spinner size={40} />
    </div>
  )
  if (!order) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--ink-60)', fontSize: 14 }}>
      Order not found
    </div>
  )

  const stepIdx = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'CANCELLED'
  const sc = STATUS_COLOR[order.status] || STATUS_COLOR.PENDING

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%', maxWidth: 860, margin: '0 auto' }}>
      {/* Back */}
      <button
        onClick={() => navigate('/orders')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-60)', fontSize: 13, fontWeight: 600, fontFamily: "'Jost',sans-serif", marginBottom: 28, padding: 0 }}
      >
        {Icons.back} My Orders
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Order Details</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,3vw,36px)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1, marginBottom: 6 }}>
            #{order.id.slice(-8).toUpperCase()}
          </h1>
          <div style={{ fontSize: 13, color: 'var(--ink-60)' }}>
            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '6px 16px', borderRadius: 2, background: sc.bg, color: sc.text }}>
          {order.status}
        </span>
      </div>

      <div className="order-detail-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 40, alignItems: 'start' }}>
        {/* Left column */}
        <div>
          {/* Tracking timeline */}
          {!isCancelled && (
            <div style={{ marginBottom: 40, padding: 28, border: '1px solid var(--gold-border)', borderRadius: 3, background: 'var(--gold-bg)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.06em', marginBottom: 24, color: 'var(--ink)' }}>Order Tracking</div>
              <div style={{ position: 'relative' }}>
                {STATUS_STEPS.map((step, i) => {
                  const done = i <= stepIdx
                  const curr = i === stepIdx
                  return (
                    <div key={step} style={{ display: 'flex', gap: 16, marginBottom: i < STATUS_STEPS.length - 1 ? 0 : 0, position: 'relative' }}>
                      {/* Connector line */}
                      {i < STATUS_STEPS.length - 1 && (
                        <div style={{
                          position: 'absolute', left: 17, top: 36, width: 2, height: 32,
                          background: done && i < stepIdx ? 'var(--gold)' : 'var(--ink-10)',
                          zIndex: 0,
                        }} />
                      )}
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `2px solid ${curr ? 'var(--gold)' : done ? 'var(--gold)' : 'var(--ink-10)'}`,
                        background: curr ? 'var(--gold)' : done ? 'rgba(184,151,90,.12)' : '#fff',
                        color: curr ? '#fff' : done ? 'var(--gold)' : 'var(--ink-20)',
                        position: 'relative', zIndex: 1,
                        marginBottom: i < STATUS_STEPS.length - 1 ? 32 : 0,
                      }}>
                        {STEP_ICONS[step]}
                      </div>
                      <div style={{ paddingTop: 8, flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: done ? 'var(--ink)' : 'var(--ink-40)', letterSpacing: '.04em' }}>
                          {step.charAt(0) + step.slice(1).toLowerCase()}
                        </div>
                        {curr && <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600, marginTop: 2 }}>Current status</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Items */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, fontFamily: "'Cormorant Garamond',serif" }}>Items Ordered</div>
            <div style={{ borderTop: '1px solid var(--ink-10)' }}>
              {order.items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--ink-10)', alignItems: 'center' }}>
                  <div style={{ width: 64, height: 64, borderRadius: 3, overflow: 'hidden', background: '#f5f5f3', flexShrink: 0 }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} loading="lazy" crossOrigin="anonymous"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&auto=format&fit=crop&q=80' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-60)' }}>
                      {item.size ? `Size: ${item.size} · ` : ''}Qty: {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{fmt(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery address */}
          {order.address && (
            <div style={{ padding: 20, border: '1px solid var(--ink-10)', borderRadius: 3, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 12 }}>Delivery Address</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{order.address.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.7 }}>
                {order.address.line1}
                {order.address.line2 ? `, ${order.address.line2}` : ''}<br />
                {order.address.city}, {order.address.state} — {order.address.pincode}
              </div>
              {order.address.phone && (
                <div style={{ fontSize: 13, color: 'var(--ink-60)', marginTop: 6 }}>📞 {order.address.phone}</div>
              )}
            </div>
          )}
        </div>

        {/* Right column — summary */}
        <div style={{ position: 'sticky', top: 100 }}>
          <div style={{ padding: 24, border: '1px solid var(--gold-border)', borderRadius: 3, background: 'var(--gold-bg)', marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16 }}>Order Summary</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-60)', marginBottom: 10 }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmt(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#2e7d32', marginBottom: 10 }}>
                <span>Discount</span>
                <span style={{ fontWeight: 700 }}>−{fmt(order.discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-60)', marginBottom: 10 }}>
              <span>Shipping</span>
              <span style={{ fontWeight: 600, color: order.shipping === 0 ? '#2e7d32' : 'var(--ink)' }}>
                {order.shipping === 0 ? 'FREE' : fmt(order.shipping || 0)}
              </span>
            </div>
            <div style={{ borderTop: '1px dashed var(--gold-border)', paddingTop: 14, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700 }}>
              <span>Total</span>
              <span>{fmt(order.total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div style={{ padding: 20, border: '1px solid var(--ink-10)', borderRadius: 3, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 10 }}>Payment</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, textTransform: 'capitalize' }}>{order.paymentMethod || 'N/A'}</div>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: 2,
              background: order.paymentStatus === 'PAID' ? '#e8f5e9' : '#fff8e1',
              color: order.paymentStatus === 'PAID' ? '#2e7d32' : '#e65100',
            }}>
              {order.paymentStatus === 'PAID' ? '✓ Paid' : 'Pending'}
            </span>
          </div>

          {/* Cancel */}
          {['PENDING', 'CONFIRMED'].includes(order.status) && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              style={{
                width: '100%', padding: '13px', background: 'transparent',
                border: '1.5px solid rgba(192,57,43,.3)', borderRadius: 2, cursor: 'pointer',
                fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                color: '#c0392b', fontFamily: "'Jost',sans-serif", transition: 'all .2s',
                opacity: cancelling ? .6 : 1,
              }}
              onMouseEnter={e => { if (!cancelling) { e.currentTarget.style.background = '#c0392b'; e.currentTarget.style.color = '#fff' }}}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#c0392b' }}
            >
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}

          <button
            onClick={() => navigate('/shop')}
            className="btn-outline"
            style={{ width: '100%', marginTop: 10 }}
          >
            Continue Shopping
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .order-detail-grid { grid-template-columns: 1fr !important; }
          .order-detail-grid > div:last-child { position: static !important; }
        }
      `}</style>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { Spinner } from '../components/UI'

const fmt = n => `₹${Number(n)?.toLocaleString('en-IN') || 0}`

export default function OrderSuccess() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { fetchCart } = useCart()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const payment = searchParams.get('payment')
    const cfOrderId = searchParams.get('cfOrderId')

    const init = async () => {
      if (payment === 'cashfree' && cfOrderId) {
        try { await api.post('/payments/cashfree/verify', { cfOrderId, orderId: id }) } catch {}
      }
      const { data } = await api.get(`/orders/${id}`)
      setOrder(data)
      fetchCart()
      setLoading(false)
    }
    init()
  }, [id])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Spinner size={40} />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: 'clamp(32px,5vw,64px) 5%', textAlign: 'center' }}>
      {/* Animated checkmark */}
      <div style={{
        width: 96, height: 96, borderRadius: '50%', marginBottom: 28,
        background: 'linear-gradient(135deg, var(--gold-bg), #e8f5e9)',
        border: '2px solid var(--gold-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn .4s ease',
      }}>
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 12 }}>
        Order Confirmed
      </div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(32px,4vw,52px)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.15, marginBottom: 12 }}>
        Thank you for your order!
      </h1>
      <p style={{ fontSize: 14, color: 'var(--ink-60)', marginBottom: 36, maxWidth: 400 }}>
        Your beautiful jewellery is being prepared with care. You'll receive a confirmation shortly.
      </p>

      {order && (
        <div style={{ width: '100%', maxWidth: 440, border: '1px solid var(--gold-border)', borderRadius: 3, background: 'var(--gold-bg)', marginBottom: 36, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gold-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 4 }}>Order ID</div>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: 'monospace', letterSpacing: '.04em' }}>#{order.id.slice(-8).toUpperCase()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 4 }}>Total Paid</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>{fmt(order.total)}</div>
            </div>
          </div>

          {/* Items preview */}
          {order.items?.length > 0 && (
            <div style={{ padding: '16px 24px', display: 'flex', gap: 10, overflowX: 'auto' }}>
              {order.items.slice(0, 4).map((item, i) => (
                <div key={i} style={{ width: 52, height: 52, borderRadius: 3, overflow: 'hidden', background: '#fff', flexShrink: 0, border: '1px solid var(--gold-border)' }}>
                  {item.image && <img src={item.image} alt={item.name} loading="lazy" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&auto=format&fit=crop&q=80' }} />}
                </div>
              ))}
              {order.items.length > 4 && (
                <div style={{ width: 52, height: 52, borderRadius: 3, background: '#fff', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--ink-60)', flexShrink: 0 }}>
                  +{order.items.length - 4}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 360 }}>
        <button
          className="btn-dark"
          style={{ padding: '15px' }}
          onClick={() => navigate('/orders')}
        >
          View My Orders
        </button>
        <button
          className="btn-outline"
          style={{ padding: '14px' }}
          onClick={() => navigate('/')}
        >
          Continue Shopping
        </button>
      </div>

      {/* Certification strip */}
      <div style={{ marginTop: 48, display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['BIS Hallmarked', 'IGI Certified', 'Free Insured Shipping', '30-Day Returns'].map(t => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--ink-40)', fontWeight: 600 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            {t}
          </div>
        ))}
      </div>
    </div>
  )
}



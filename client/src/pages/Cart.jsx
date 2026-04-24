import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import api from '../utils/api'
import { EmptyState, Spinner, Icons } from '../components/UI'

const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

export default function Cart() {
  const navigate = useNavigate()
  const { cart, loading, updateItem, removeItem, subtotal } = useCart()
  const { showToast } = useToast()
  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponMsg, setCouponMsg] = useState(null)

  const validateCoupon = async () => {
    try {
      const { data } = await api.post('/coupons/validate', { code: coupon, orderTotal: subtotal })
      setDiscount(data.discount)
      setCouponMsg({ ok: true, text: `${coupon.toUpperCase()} applied — you save ${fmt(data.discount)}` })
    } catch (err) {
      setCouponMsg({ ok: false, text: err.response?.data?.error || 'Invalid coupon' })
      setDiscount(0)
    }
  }

  const total = subtotal - discount
  const isFreeShip = subtotal >= 2999
  const shipping = isFreeShip ? 0 : 99
  const items = cart?.items || []

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Spinner size={40} />
    </div>
  )

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Shopping</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 36, lineHeight: 1.1 }}>
        Your Cart {items.length > 0 && <span style={{ fontSize: '0.6em', color: 'var(--ink-40)' }}>({items.length})</span>}
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
          title="Your cart is empty"
          subtitle="Add some beautiful jewellery to get started"
          action={<button className="btn-gold" onClick={() => navigate('/shop')}>Shop Now</button>}
        />
      ) : (
        <div className="cart-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: 40, alignItems: 'start' }}>
          {/* Items list */}
          <div>
            <div style={{ borderTop: '1px solid var(--ink-10)' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 20, padding: '24px 0', borderBottom: '1px solid var(--ink-10)', alignItems: 'flex-start' }}>
                  <div
                    onClick={() => navigate(`/product/${item.productId}`)}
                    style={{ width: 100, height: 100, borderRadius: 3, overflow: 'hidden', background: '#f5f5f3', flexShrink: 0, cursor: 'pointer' }}
                  >
                    <img
                      src={item.product.images?.[0]}
                      alt={item.product.name}
                      loading="lazy" crossOrigin="anonymous"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&auto=format&fit=crop&q=80' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 4 }}>{item.product.category}</div>
                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</div>
                    {item.size && <div style={{ fontSize: 12, color: 'var(--ink-60)', marginBottom: 12 }}>Size: {item.size}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1.5px solid var(--ink-10)', borderRadius: 2, overflow: 'hidden' }}>
                        <button onClick={() => updateItem(item.id, item.quantity - 1)} style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>{Icons.minus}</button>
                        <span style={{ width: 32, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)} style={{ width: 36, height: 36, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>{Icons.plus}</button>
                      </div>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{fmt(item.price * item.quantity)}</span>
                      <button
                        onClick={() => { removeItem(item.id); showToast('Item removed') }}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-40)', display: 'flex', padding: 4, transition: 'color .2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#c0392b'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-40)'}
                      >
                        {Icons.trash}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary sidebar */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div style={{ border: '1px solid var(--gold-border)', borderRadius: 3, padding: 28, background: 'var(--gold-bg)' }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, letterSpacing: '.02em' }}>Order Summary</div>

              {/* Coupon */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className="input-field"
                  placeholder="Promo code"
                  value={coupon}
                  onChange={e => { setCoupon(e.target.value); setCouponMsg(null) }}
                  style={{ textTransform: 'uppercase', flex: 1, fontSize: 12 }}
                />
                <button className="btn-gold" onClick={validateCoupon} style={{ padding: '0 16px', flexShrink: 0 }}>Apply</button>
              </div>
              {couponMsg && (
                <div style={{ fontSize: 12, marginBottom: 16, color: couponMsg.ok ? '#2e7d32' : '#c0392b', fontWeight: 600 }}>{couponMsg.text}</div>
              )}
              <div style={{ fontSize: 10, color: 'var(--ink-40)', marginBottom: 20, letterSpacing: '.04em' }}>Try: ADORE10 · WELCOME500 · LUXURY20</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10, color: 'var(--ink-60)' }}>
                <span>Subtotal</span><span style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 10, color: '#2e7d32' }}>
                  <span>Discount</span><span style={{ fontWeight: 700 }}>−{fmt(discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: isFreeShip ? 0 : 8, color: 'var(--ink-60)' }}>
                <span>Shipping</span>
                <span style={{ fontWeight: 700, color: isFreeShip ? '#2e7d32' : 'var(--ink)' }}>{isFreeShip ? 'FREE' : fmt(shipping)}</span>
              </div>
              {!isFreeShip && (
                <div style={{ fontSize: 11, color: 'var(--ink-40)', marginBottom: 8 }}>Add {fmt(2999 - subtotal)} more for free shipping</div>
              )}
              <div style={{ borderTop: '1px dashed var(--gold-border)', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', fontSize: 17, fontWeight: 700 }}>
                <span>Total</span><span>{fmt(total + shipping)}</span>
              </div>

              <button
                className="btn-dark"
                style={{ width: '100%', marginTop: 20, padding: '15px' }}
                onClick={() => navigate('/checkout', { state: { discount, couponCode: discount > 0 ? coupon.toUpperCase() : null } })}
              >
                Proceed to Checkout →
              </button>
              <button
                onClick={() => navigate('/shop')}
                style={{ width: '100%', marginTop: 10, padding: '13px', background: 'transparent', border: '1.5px solid var(--ink-10)', borderRadius: 2, cursor: 'pointer', fontSize: 12, fontWeight: 600, letterSpacing: '.06em', color: 'var(--ink-60)', fontFamily: "'Jost',sans-serif" }}
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .cart-layout-grid { grid-template-columns: 1fr !important; }
          .cart-layout-grid > div:last-child { position: static !important; }
        }
      `}</style>
    </div>
  )
}

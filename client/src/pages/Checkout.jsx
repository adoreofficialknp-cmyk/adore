import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner, Icons } from '../components/UI'

const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

// ── Load Razorpay script dynamically ──────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// ── Load Cashfree script dynamically ─────────────────────────────────────
function loadCashfreeScript() {
  return new Promise((resolve) => {
    if (window.Cashfree) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const PAY_METHODS = [
  { id: 'razorpay',  label: 'Razorpay',          sub: 'Cards, UPI, Netbanking & Wallets',   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { id: 'cashfree',  label: 'Cashfree',           sub: 'UPI, Cards & Netbanking',            icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { id: 'cod',       label: 'Cash on Delivery',   sub: 'Pay when your order arrives',        icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg> },
]

export default function Checkout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { cart, subtotal, clearCart } = useCart()
  const { showToast } = useToast()

  const { discount = 0, couponCode = null } = location.state || {}
  const [payMethod, setPayMethod] = useState('razorpay')
  const [placing, setPlacing] = useState(false)
  const [apiConfig, setApiConfig] = useState({})
  const [address, setAddress] = useState({
    name: user?.name || '', phone: '', line1: '', line2: '', city: '', state: '', pincode: ''
  })

  useEffect(() => {
    const fetchApiConfig = async () => {
      try {
        // Use the public config endpoint — /admin/config is admin-only and returns 403 for regular users
        const { data } = await api.get('/config/public')
        setApiConfig(data)
      } catch (err) {
        console.error('Failed to fetch payment config', err)
      }
    }
    fetchApiConfig()
  }, [])

  const shipping = subtotal >= 2999 ? 0 : 99
  const total = subtotal - discount + shipping
  const items = cart?.items || []

  const setAddr = k => e => setAddress(a => ({ ...a, [k]: e.target.value }))

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.state || !address.pincode) {
      showToast('Please fill all required address fields')
      return
    }

    // Check if online payment method is configured (using public config flags)
    if (payMethod === 'razorpay' && !apiConfig.razorpay_configured) {
      showToast('Razorpay is not accepting payments right now.', 'error')
      return
    }
    if (payMethod === 'cashfree' && !apiConfig.cashfree_configured) {
      showToast('Cashfree is not accepting payments right now.', 'error')
      return
    }

    setPlacing(true)
    try {
      const { data: order } = await api.post('/orders', {
        paymentMethod: payMethod,
        couponCode,
        notes: '',
        address: { name: address.name, phone: address.phone, line1: address.line1, line2: address.line2, city: address.city, state: address.state, pincode: address.pincode }
      })

      if (payMethod === 'razorpay') {
        await handleRazorpay(order)
      } else if (payMethod === 'cashfree') {
        await handleCashfree(order)
      } else {
        // COD - order is already confirmed in backend
        showToast('Order placed!')
        clearCart()
        navigate(`/order/success/${order.id}`)
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to place order')
      setPlacing(false)
    }
  }

  const handleRazorpay = async (order) => {
    // Load Razorpay script if not already loaded
    const loaded = await loadRazorpayScript()
    if (!loaded) {
      showToast('Razorpay failed to load. Please check your internet connection.')
      setPlacing(false)
      return
    }

    try {
      const { data } = await api.post('/payments/razorpay/create-order', { orderId: order.id })
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'ADORE Fine Jewellery',
        description: 'Your order',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=64&h=64&fit=crop',
        prefill: { name: user.name, email: user.email, contact: address.phone },
        theme: { color: '#B8975A' },
        handler: async (response) => {
          try {
            await api.post('/payments/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.id
            })
            showToast('Payment successful!')
            clearCart()
            navigate(`/order/success/${order.id}`)
          } catch {
            showToast('Payment verification failed')
            setPlacing(false)
          }
        },
        modal: { ondismiss: () => setPlacing(false) }
      })
      rzp.open()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to initiate payment')
      setPlacing(false)
    }
  }

  const handleCashfree = async (order) => {
    const loaded = await loadCashfreeScript()
    if (!loaded) {
      showToast('Cashfree failed to load. Please try another payment method.')
      setPlacing(false)
      return
    }
    try {
      const { data } = await api.post('/payments/cashfree/create-session', { orderId: order.id })
      const cashfree = window.Cashfree({ mode: import.meta.env.PROD ? 'production' : 'sandbox' })
      cashfree.checkout({
        paymentSessionId: data.paymentSessionId,
        returnUrl: `${window.location.origin}/order/success/${order.id}?payment=cashfree&cfOrderId=${data.cfOrderId}`,
      }).then(result => {
        if (result.error) { showToast(result.error.message || 'Payment failed'); setPlacing(false) }
      })
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to initiate payment')
      setPlacing(false)
    }
  }

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%', maxWidth: 1040, margin: '0 auto' }}>

      <button
        onClick={() => navigate('/cart')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-60)', fontSize: 13, fontWeight: 600, fontFamily: "'Jost',sans-serif", marginBottom: 28, padding: 0 }}
      >
        {Icons.back} Back to Cart
      </button>

      <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Secure Checkout</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 36, lineHeight: 1.1 }}>
        Complete Your Order
      </h1>

      <div className="checkout-layout-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 48, alignItems: 'start' }}>
        {/* Left — forms */}
        <div>
          {/* Delivery address */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gold)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
              Delivery Address
            </div>
            <div className="checkout-address-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Full Name *</label>
                <input className="input-field" placeholder="Your full name" value={address.name} onChange={setAddr('name')} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Phone Number *</label>
                <input className="input-field" type="tel" placeholder="+91 98765 43210" value={address.phone} onChange={setAddr('phone')} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Address Line 1 *</label>
                <input className="input-field" placeholder="House / Flat / Building" value={address.line1} onChange={setAddr('line1')} />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Address Line 2</label>
                <input className="input-field" placeholder="Street / Area / Landmark (optional)" value={address.line2} onChange={setAddr('line2')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>City *</label>
                <input className="input-field" placeholder="City" value={address.city} onChange={setAddr('city')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>State *</label>
                <input className="input-field" placeholder="State" value={address.state} onChange={setAddr('state')} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>PIN Code *</label>
                <input className="input-field" placeholder="PIN Code" value={address.pincode} onChange={setAddr('pincode')} maxLength={6} />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--gold)', color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>2</div>
              Payment Method
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PAY_METHODS.map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setPayMethod(opt.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
                    border: `1.5px solid ${payMethod === opt.id ? 'var(--gold)' : 'var(--ink-10)'}`,
                    borderRadius: 3, cursor: 'pointer',
                    background: payMethod === opt.id ? 'var(--gold-bg)' : '#fff',
                    transition: 'all .2s',
                  }}
                >
                  <span style={{ color: payMethod === opt.id ? 'var(--gold)' : 'var(--ink-40)', display: 'flex' }}>{opt.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-60)' }}>{opt.sub}</div>
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${payMethod === opt.id ? 'var(--gold)' : 'var(--ink-20)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {payMethod === opt.id && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)' }} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — summary */}
        <div style={{ position: 'sticky', top: 100 }}>
          <div style={{ border: '1px solid var(--gold-border)', borderRadius: 3, background: 'var(--gold-bg)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gold-border)', fontSize: 14, fontWeight: 700 }}>
              Order Summary ({items.length} item{items.length !== 1 ? 's' : ''})
            </div>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 12, padding: '12px 24px', borderBottom: '1px solid var(--gold-border)', alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 3, overflow: 'hidden', background: '#f5f5f3', flexShrink: 0 }}>
                    <img src={item.product.images?.[0]} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=100&auto=format&fit=crop&q=80' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-60)' }}>Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ''}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{fmt(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-60)', marginBottom: 10 }}>
                <span>Subtotal</span><span style={{ fontWeight: 600, color: 'var(--ink)' }}>{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#2e7d32', marginBottom: 10 }}>
                  <span>Discount</span><span style={{ fontWeight: 700 }}>−{fmt(discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-60)', marginBottom: 10 }}>
                <span>Shipping</span>
                <span style={{ fontWeight: 700, color: shipping === 0 ? '#2e7d32' : 'var(--ink)' }}>
                  {shipping === 0 ? 'FREE' : fmt(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <div style={{ fontSize: 11, color: 'var(--ink-40)', marginBottom: 10 }}>
                  Add {fmt(2999 - subtotal)} more for free shipping
                </div>
              )}
              <div style={{ borderTop: '1px dashed var(--gold-border)', paddingTop: 14, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700 }}>
                <span>Total</span><span>{fmt(total)}</span>
              </div>

              <button
                className="btn-gold"
                style={{ width: '100%', marginTop: 20, padding: '15px', fontSize: 13, opacity: (placing || items.length === 0) ? .6 : 1 }}
                onClick={handlePlaceOrder}
                disabled={placing || items.length === 0}
              >
                {placing
                  ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><Spinner size={16} color="#fff" /> Processing…</span>
                  : `Place Order · ${fmt(total)}`
                }
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14, fontSize: 11, color: 'var(--ink-40)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                256-bit SSL Encrypted · Secure Checkout
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .checkout-layout-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
          .checkout-layout-grid > div:last-child {
            position: static !important;
          }
          .checkout-address-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}
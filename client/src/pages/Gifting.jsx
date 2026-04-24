import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

// ── Premium SVG Icons ───────────────────────────────────────────────────────
const SVG = {
  giftBox: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12"/>
      <rect x="2" y="7" width="20" height="5"/>
      <line x1="12" y1="22" x2="12" y2="7"/>
      <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
    </svg>
  ),
  flower: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 7.5a4.5 4.5 0 114.5 4.5M12 7.5A4.5 4.5 0 117.5 12M12 7.5V3m0 9a4.5 4.5 0 104.5 4.5M12 12a4.5 4.5 0 10-4.5 4.5M12 12v9m0-9a4.5 4.5 0 004.5 4.5M12 21a4.5 4.5 0 01-4.5-4.5"/>
    </svg>
  ),
  hamper: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  express: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  ),
  standard: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" rx="1"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  diamond: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h12l4 6-10 13L2 9z"/>
      <path d="M2 9h20M6 3l4 6m4 0l4-6"/>
    </svg>
  ),
  card: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  shield: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </svg>
  ),
  returns: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
    </svg>
  ),
  check: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  arrow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
}

// ── Gift Bundles Data ───────────────────────────────────────────────────────
const GIFT_BUNDLES = [
  {
    id: 'vip-gold',
    tag: 'Best Seller',
    svgIcon: SVG.giftBox,
    title: 'VIP Gift Box',
    subtitle: 'The Ultimate Luxury Experience',
    desc: 'A signature black & gold keepsake box lined with velvet, holding your chosen jewellery piece, handwritten message card, ribbon seal & authenticity certificate.',
    features: ['Premium velvet-lined keepsake box', 'Hand-tied satin ribbon', 'Personalised message card', 'Authenticity & BIS certificate', 'Tissue paper & scented sachet'],
    price: 499,
    color: '#B8860B',
    gradientFrom: '#2D1A00',
    gradientTo: '#1A0010',
    img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&auto=format&fit=crop&q=85',
    badge: 'VIP',
    badgeBg: '#B8860B',
  },
  {
    id: 'flowers-choc',
    tag: 'Most Gifted',
    svgIcon: SVG.flower,
    title: 'Flowers & Chocolate',
    subtitle: 'Romance in Every Detail',
    desc: 'A dozen premium red roses paired with handcrafted Belgian chocolates, beautifully arranged alongside your jewellery in our signature gift box.',
    features: ['12 premium long-stem red roses', 'Belgian chocolates (200g)', 'Signature Adore gift box included', 'Fresh flower care card', 'Same-day prep available'],
    price: 1299,
    color: '#C2185B',
    gradientFrom: '#1A0010',
    gradientTo: '#2D0A1E',
    img: 'https://images.unsplash.com/photo-1548532928-b34e3be62062?w=800&auto=format&fit=crop&q=85',
    badge: 'Romantic',
    badgeBg: '#C2185B',
  },
  {
    id: 'complete-hamper',
    tag: 'Premium Choice',
    svgIcon: SVG.hamper,
    title: 'Complete Gift Hamper',
    subtitle: 'Everything, Perfectly Curated',
    desc: 'Our most complete gifting experience — jewellery + VIP box + flowers + chocolates + a surprise luxury add-on, all wrapped in our premium hamper.',
    features: ['VIP keepsake box (black & gold)', '12 premium red roses', 'Belgian chocolates (300g)', 'Surprise luxury add-on gift', 'Express delivery priority'],
    price: 1799,
    color: '#880E4F',
    gradientFrom: '#0D001A',
    gradientTo: '#1A0010',
    img: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&auto=format&fit=crop&q=85',
    badge: 'Complete',
    badgeBg: '#880E4F',
  },
]

const OCCASIONS = [
  { label: 'Birthday', filter: 'birthday' },
  { label: 'Anniversary', filter: 'anniversary' },
  { label: 'Wedding', filter: 'wedding' },
  { label: "Valentine's", filter: 'valentine' },
  { label: "Mother's Day", filter: 'mother' },
  { label: 'Diwali', filter: 'festive' },
  { label: 'Just Because', filter: 'all' },
]

const DELIVERY_OPTIONS = [
  {
    id: 'express',
    svgIcon: SVG.express,
    title: 'Express Delivery',
    subtitle: 'Delivered in 24–48 hours',
    details: 'Order before 2 PM for next-day delivery in metro cities. Full tracking from dispatch to doorstep. Insured & tamper-proof packaging.',
    price: 199,
    badge: 'FAST',
    badgeColor: '#C2185B',
    highlights: ['Delivered in 24–48 hrs', 'Real-time tracking', 'Insured packaging', 'Available in 50+ cities'],
  },
  {
    id: 'standard',
    svgIcon: SVG.standard,
    title: 'Standard Delivery',
    subtitle: 'Delivered in 4–7 business days',
    details: 'Secure, fully insured shipping across India. Eco-friendly packaging. Tracking updates via SMS & email.',
    price: 0,
    badge: 'FREE',
    badgeColor: '#16A34A',
    highlights: ['4–7 business days', 'SMS & email tracking', 'Eco-friendly packaging', 'Pan-India delivery'],
  },
]

const WHY_GIFT = [
  { svgIcon: SVG.diamond,  title: 'Certified Quality',   desc: 'Every piece is BIS hallmarked & comes with a certificate of authenticity.' },
  { svgIcon: SVG.giftBox,  title: 'Luxury Packaging',    desc: 'Signature gift box with velvet interior, ribbon, and your message card.' },
  { svgIcon: SVG.standard, title: 'Safe & Insured',      desc: 'Fully insured transit with tamper-proof packaging. Real-time tracking.' },
  { svgIcon: SVG.card,     title: 'Personal Touch',      desc: 'Hand-written message card by our in-house calligraphy team.' },
  { svgIcon: SVG.returns,  title: 'Easy Returns',        desc: '30-day hassle-free returns — even for gifted pieces, no questions asked.' },
  { svgIcon: SVG.express,  title: 'Express Available',   desc: 'Same-day & next-day options in 50+ cities. Never miss a moment.' },
]

const STEPS = [
  { num: 1, svgIcon: SVG.diamond, label: 'Pick Your Jewellery',  img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=120&auto=format&fit=crop&q=80' },
  { num: 2, svgIcon: SVG.giftBox, label: 'Choose a Gift Bundle', img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=120&auto=format&fit=crop&q=80' },
  { num: 3, svgIcon: SVG.express, label: 'Select Delivery',      img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=120&auto=format&fit=crop&q=80' },
  { num: 4, svgIcon: SVG.card,    label: 'Add a Message',        img: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=120&auto=format&fit=crop&q=80' },
]

// ── Delivery Selector ───────────────────────────────────────────────────────
function DeliverySelector({ selected, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
      {DELIVERY_OPTIONS.map(opt => {
        const active = selected === opt.id
        return (
          <div key={opt.id} onClick={() => onSelect(opt.id)} style={{
            border: `2px solid ${active ? '#C2185B' : 'rgba(255,255,255,.1)'}`,
            borderRadius: 12, padding: '22px 20px', cursor: 'pointer',
            background: active ? 'rgba(194,24,91,.1)' : 'rgba(255,255,255,.03)',
            transition: 'all .25s', position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 14, right: 14, background: opt.badgeColor, color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: '.12em', padding: '3px 9px', borderRadius: 20 }}>
              {opt.badge}
            </div>
            <div style={{ color: active ? '#C2185B' : 'rgba(255,255,255,.4)', marginBottom: 14 }}>{opt.svgIcon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>{opt.title}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 14, lineHeight: 1.5 }}>{opt.subtitle}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', lineHeight: 1.7, marginBottom: 14 }}>{opt.details}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {opt.highlights.map(h => (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: active ? '#F8BBD0' : 'rgba(255,255,255,.35)' }}>
                  <span style={{ color: active ? '#C2185B' : 'rgba(255,255,255,.2)' }}>{SVG.check}</span>
                  {h}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 18, fontSize: 18, fontWeight: 800, color: active ? '#F8BBD0' : 'rgba(255,255,255,.5)', fontFamily: "'Cormorant Garamond', serif" }}>
              {opt.price === 0 ? 'FREE' : `₹${opt.price}`}
            </div>
            {active && (
              <div style={{ position: 'absolute', top: 14, left: 14, width: 20, height: 20, borderRadius: '50%', background: '#C2185B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {SVG.check}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Gift Product Card ───────────────────────────────────────────────────────
function GiftProductCard({ product, onPress, onAddToCart, wishlisted, onWishlist }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div onClick={onPress} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 10, overflow: 'hidden', cursor: 'pointer',
        background: 'rgba(255,255,255,.05)',
        border: `1.5px solid ${hovered ? 'rgba(248,187,208,.35)' : 'rgba(255,255,255,.08)'}`,
        transition: 'all .25s', transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? '0 12px 32px rgba(0,0,0,.4)' : '0 2px 8px rgba(0,0,0,.2)',
      }}>
      <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#111' }}>
        <img src={product.images?.[0]} alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
          loading="lazy"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 50%)' }} />
        <button onClick={e => { e.stopPropagation(); onWishlist() }}
          style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.12)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={wishlisted ? '#C2185B' : 'none'} stroke={wishlisted ? '#C2185B' : '#fff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
          </svg>
        </button>
        <div style={{ position: 'absolute', top: 10, left: 10, background: '#C2185B', color: '#fff', fontSize: 8, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>
          Giftable
        </div>
      </div>
      <div style={{ padding: '14px 14px 16px' }}>
        <div style={{ fontSize: 10, color: '#F8BBD0', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 5, opacity: .7 }}>{product.category}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>{product.name}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#F8BBD0' }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
          {product.originalPrice && <span style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', textDecoration: 'line-through' }}>₹{Number(product.originalPrice).toLocaleString('en-IN')}</span>}
        </div>
        <button onClick={e => { e.stopPropagation(); onAddToCart() }}
          style={{ width: '100%', padding: '10px 0', background: 'rgba(194,24,91,.15)', color: '#F8BBD0', border: '1.5px solid rgba(194,24,91,.35)', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: "'Jost', sans-serif", transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          onMouseEnter={e => { e.currentTarget.style.background = '#C2185B'; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(194,24,91,.15)'; e.currentTarget.style.color = '#F8BBD0' }}
        >
          Add to Gift {SVG.arrow}
        </button>
      </div>
    </div>
  )
}

// ── Main Gifting Page ───────────────────────────────────────────────────────
export default function Gifting() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState([])
  const [selectedOccasion, setSelectedOccasion] = useState('all')
  const [selectedDelivery, setSelectedDelivery] = useState('standard')
  const [selectedBundle, setSelectedBundle] = useState(null)
  const [giftMessage, setGiftMessage] = useState('')

  useEffect(() => {
    api.get('/products?limit=8&sort=rating&order=desc')
      .then(r => setProducts(r.data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false))
    if (user) {
      api.get('/wishlist').then(r => setWishlist(r.data.map(w => w.productId))).catch(() => {})
    }
  }, [user])

  const handleCart = async (p) => {
    if (!user) { navigate('/login'); return }
    await addToCart(p.id)
    showToast(`${p.name} added to cart!`)
  }

  const handleWishlist = async (p) => {
    if (!user) { navigate('/login'); return }
    await api.post('/wishlist/toggle', { productId: p.id })
    setWishlist(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])
    showToast(wishlist.includes(p.id) ? 'Removed from wishlist' : 'Added to wishlist')
  }

  return (
    <div style={{ background: '#0D001A', minHeight: '100vh', fontFamily: "'Jost', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #1A0010 0%, #2D0A1E 50%, #0D001A 100%)', padding: 'clamp(56px,8vw,100px) 5% 0' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .04, backgroundImage: 'radial-gradient(circle, #FFB6C1 1px, transparent 1px)', backgroundSize: '30px 30px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -120, left: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(194,24,91,.14) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, right: '5%', width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(184,134,11,.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Hero text + image split */}
        <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center', maxWidth: 1100, margin: '0 auto', paddingBottom: 'clamp(48px,6vw,72px)' }} className="gift-hero-grid">
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(194,24,91,.12)', border: '1px solid rgba(194,24,91,.25)', borderRadius: 24, padding: '6px 18px', marginBottom: 22 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F8BBD0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              <span style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F8BBD0', fontWeight: 700 }}>Premium Gifting</span>
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(38px,5.5vw,68px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', lineHeight: 1.05, marginBottom: 18 }}>
              Gift Something<br />
              <span style={{ color: '#F8BBD0' }}>Unforgettable</span>
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,.5)', maxWidth: 420, lineHeight: 1.8, marginBottom: 32 }}>
              Handcrafted jewellery paired with luxury packaging, fresh roses & Belgian chocolates — curated for someone extraordinary.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => document.getElementById('gift-builder')?.scrollIntoView({ behavior: 'smooth' })}
                style={{ background: '#C2185B', color: '#fff', border: 'none', padding: '14px 36px', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 6, fontFamily: "'Jost', sans-serif", transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#AD1457'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#C2185B'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                Build Your Gift Set
              </button>
              <button onClick={() => navigate('/shop')}
                style={{ background: 'transparent', color: '#F8BBD0', border: '1.5px solid rgba(248,187,208,.3)', padding: '13px 28px', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 6, fontFamily: "'Jost', sans-serif", transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,187,208,.07)'; e.currentTarget.style.borderColor = 'rgba(248,187,208,.55)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248,187,208,.3)' }}
              >
                Shop Jewellery
              </button>
            </div>
            {/* Quick stats */}
            <div style={{ display: 'flex', gap: 28, marginTop: 36, flexWrap: 'wrap' }}>
              {[
                { icon: SVG.giftBox, label: 'VIP Gift Boxes' },
                { icon: SVG.flower,  label: 'Fresh Flowers' },
                { icon: SVG.express, label: 'Express 24hr' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#C2185B', opacity: .8 }}>{s.icon}</span>
                  <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Hero image collage */}
          <div style={{ position: 'relative', height: 480 }} className="gift-hero-imgs">
            <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500&auto=format&fit=crop&q=85"
              alt="VIP Gift Box" style={{ position: 'absolute', top: 0, right: 0, width: '72%', height: '65%', objectFit: 'cover', borderRadius: 12, border: '2px solid rgba(255,255,255,.08)', boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
            <img src="https://images.unsplash.com/photo-1548532928-b34e3be62062?w=400&auto=format&fit=crop&q=85"
              alt="Flowers" style={{ position: 'absolute', bottom: 20, left: 0, width: '55%', height: '50%', objectFit: 'cover', borderRadius: 12, border: '2px solid rgba(255,255,255,.08)', boxShadow: '0 16px 48px rgba(0,0,0,.5)' }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
            <img src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&auto=format&fit=crop&q=85"
              alt="Jewellery" style={{ position: 'absolute', bottom: 60, right: 10, width: '38%', height: '38%', objectFit: 'cover', borderRadius: 10, border: '2px solid rgba(194,24,91,.3)', boxShadow: '0 8px 24px rgba(194,24,91,.2)' }}
              onError={e => { e.currentTarget.style.display = 'none' }}
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) 5%', background: 'rgba(255,255,255,.015)', borderTop: '1px solid rgba(255,255,255,.05)', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#F8BBD0', fontWeight: 700, marginBottom: 10, opacity: .6 }}>How It Works</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(22px,3.5vw,36px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', margin: 0 }}>Four Simple Steps to a Perfect Gift</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="steps-grid">
            {STEPS.map((step, i) => (
              <div key={step.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, padding: '24px 16px', borderRadius: 10, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', textAlign: 'center', position: 'relative' }}>
                {/* Step image */}
                <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(194,24,91,.3)', flexShrink: 0 }}>
                  <img src={step.img} alt={step.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.currentTarget.style.display='none'} />
                </div>
                {/* SVG icon overlay */}
                <div style={{ color: '#C2185B', opacity: .9 }}>{step.svgIcon}</div>
                <div style={{ fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 700 }}>Step {step.num}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>{step.label}</div>
                {i < STEPS.length - 1 && (
                  <div style={{ position: 'absolute', right: -7, top: '40%', color: 'rgba(255,255,255,.15)', fontSize: 20 }}>›</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Gift Bundles ─────────────────────────────────────────────────── */}
      <section id="gift-builder" style={{ padding: 'clamp(40px,5vw,72px) 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#F8BBD0', fontWeight: 700, marginBottom: 12, opacity: .6 }}>Step 2</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px,4vw,48px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', marginBottom: 10 }}>Choose Your Gift Bundle</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', maxWidth: 420, margin: '0 auto' }}>Each bundle is an add-on to your jewellery purchase. Select the experience you want to create.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' }}>
          {GIFT_BUNDLES.map(bundle => {
            const isSelected = selectedBundle === bundle.id
            return (
              <div key={bundle.id} onClick={() => setSelectedBundle(isSelected ? null : bundle.id)}
                style={{
                  position: 'relative', borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                  border: `2px solid ${isSelected ? bundle.color : 'rgba(255,255,255,.07)'}`,
                  background: `linear-gradient(160deg, ${bundle.gradientFrom} 0%, ${bundle.gradientTo} 100%)`,
                  transition: 'all .3s',
                  transform: isSelected ? 'translateY(-6px)' : 'translateY(0)',
                  boxShadow: isSelected ? `0 16px 48px ${bundle.color}28` : '0 4px 16px rgba(0,0,0,.4)',
                }}>
                {/* Image */}
                <div style={{ height: 190, overflow: 'hidden', position: 'relative' }}>
                  <img src={bundle.img} alt={bundle.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .5, transition: 'transform .4s', transform: isSelected ? 'scale(1.05)' : 'scale(1)' }}
                    onError={e => { e.currentTarget.onerror=null; e.currentTarget.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 20%, ${bundle.gradientFrom} 100%)` }} />
                  <div style={{ position: 'absolute', top: 14, left: 14, background: bundle.badgeBg, color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: '.1em', padding: '4px 10px', borderRadius: 20 }}>{bundle.badge}</div>
                  {bundle.tag && <div style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(8px)', color: '#F8BBD0', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', padding: '4px 10px', borderRadius: 20, textTransform: 'uppercase' }}>{bundle.tag}</div>}
                </div>
                <div style={{ padding: '22px 22px 24px' }}>
                  <div style={{ color: isSelected ? bundle.color : 'rgba(255,255,255,.4)', marginBottom: 12 }}>{bundle.svgIcon}</div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 600, fontStyle: 'italic', color: '#fff', marginBottom: 4 }}>{bundle.title}</h3>
                  <div style={{ fontSize: 11, color: bundle.color, fontWeight: 700, letterSpacing: '.08em', marginBottom: 12, textTransform: 'uppercase' }}>{bundle.subtitle}</div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.7, marginBottom: 16 }}>{bundle.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
                    {bundle.features.map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: isSelected ? '#F8BBD0' : 'rgba(255,255,255,.4)' }}>
                        <span style={{ color: isSelected ? bundle.color : 'rgba(255,255,255,.2)', flexShrink: 0 }}>{SVG.check}</span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 2 }}>Add-on from</div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: bundle.color }}>₹{bundle.price.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ padding: '10px 20px', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: isSelected ? bundle.color : 'rgba(255,255,255,.05)', color: isSelected ? '#fff' : 'rgba(255,255,255,.4)', border: `1.5px solid ${isSelected ? bundle.color : 'rgba(255,255,255,.1)'}`, transition: 'all .2s' }}>
                      {isSelected ? '✓ Selected' : 'Select'}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Shop Jewellery for Gifting ────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,72px) 5%', background: 'rgba(255,255,255,.015)', borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#F8BBD0', fontWeight: 700, marginBottom: 12, opacity: .6 }}>Step 1</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px,4vw,48px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', marginBottom: 10 }}>Pick the Perfect Jewellery</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', maxWidth: 400, margin: '0 auto 24px' }}>Every piece is 925 hallmarked, beautifully packaged, and certified.</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {OCCASIONS.map(occ => {
              const active = selectedOccasion === occ.filter
              return (
                <button key={occ.filter} onClick={() => setSelectedOccasion(occ.filter)}
                  style={{ padding: '7px 16px', borderRadius: 24, fontSize: 12, fontWeight: 600, cursor: 'pointer', background: active ? '#C2185B' : 'rgba(255,255,255,.05)', color: active ? '#fff' : 'rgba(255,255,255,.45)', border: `1.5px solid ${active ? '#C2185B' : 'rgba(255,255,255,.08)'}`, fontFamily: "'Jost', sans-serif", transition: 'all .2s' }}
                >
                  {occ.label}
                </button>
              )
            })}
          </div>
        </div>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ borderRadius: 10, overflow: 'hidden', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.05)' }}>
                <div style={{ aspectRatio: '1', background: 'rgba(255,255,255,.06)' }} />
                <div style={{ padding: 14 }}><div style={{ height: 12, background: 'rgba(255,255,255,.06)', borderRadius: 6, marginBottom: 8 }} /><div style={{ height: 10, background: 'rgba(255,255,255,.04)', borderRadius: 6, width: '60%' }} /></div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, maxWidth: 1100, margin: '0 auto' }}>
            {products.map(p => (
              <GiftProductCard key={p.id} product={p} onPress={() => navigate(`/product/${p.id}`)} onAddToCart={() => handleCart(p)} wishlisted={wishlist.includes(p.id)} onWishlist={() => handleWishlist(p)} />
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <button onClick={() => navigate('/shop')}
            style={{ background: 'transparent', color: '#F8BBD0', border: '1.5px solid rgba(248,187,208,.2)', padding: '13px 36px', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 6, fontFamily: "'Jost', sans-serif", transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,187,208,.07)'; e.currentTarget.style.borderColor = 'rgba(248,187,208,.45)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248,187,208,.2)' }}
          >
            Browse Full Collection
          </button>
        </div>
      </section>

      {/* ── Delivery Options ─────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,72px) 5%', borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#F8BBD0', fontWeight: 700, marginBottom: 12, opacity: .6 }}>Step 3</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(26px,4vw,44px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', marginBottom: 10 }}>Choose Your Delivery</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', maxWidth: 380, margin: '0 auto' }}>We make sure every gift arrives in perfect, pristine condition.</p>
          </div>
          <DeliverySelector selected={selectedDelivery} onSelect={setSelectedDelivery} />
          {selectedDelivery === 'express' && (
            <div style={{ marginTop: 16, padding: '14px 18px', background: 'rgba(194,24,91,.07)', border: '1px solid rgba(194,24,91,.18)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#C2185B', flexShrink: 0 }}>{SVG.express}</span>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.6 }}>
                <strong style={{ color: '#F8BBD0' }}>Express available in 50+ cities.</strong> Order before 2:00 PM today for next-day delivery. Same-day available in select metros.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Gift Message ─────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) 5%', background: 'rgba(255,255,255,.015)', borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#F8BBD0', fontWeight: 700, marginBottom: 12, opacity: .6 }}>Step 4</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', marginBottom: 10 }}>Add a Personal Message</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.35)', maxWidth: 360, margin: '0 auto' }}>Hand-written on our premium gilt-edged card and placed inside the gift box.</p>
          </div>
          <div style={{ position: 'relative' }}>
            <textarea value={giftMessage} onChange={e => setGiftMessage(e.target.value.slice(0, 200))}
              placeholder="Write something from the heart..."
              rows={5}
              style={{ width: '100%', boxSizing: 'border-box', padding: '18px 20px', background: 'rgba(255,255,255,.04)', border: '1.5px solid rgba(255,255,255,.08)', borderRadius: 10, color: '#fff', fontSize: 14, lineHeight: 1.7, fontFamily: "'Jost', sans-serif", resize: 'vertical', outline: 'none', transition: 'border-color .2s' }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(194,24,91,.45)'}
              onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'}
            />
            <div style={{ position: 'absolute', bottom: 12, right: 14, fontSize: 10, color: 'rgba(255,255,255,.2)', fontFamily: 'monospace' }}>{giftMessage.length}/200</div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            {['Happy Birthday!', 'With all my love', 'You deserve this', 'Forever & always'].map(s => (
              <button key={s} onClick={() => setGiftMessage(s)}
                style={{ padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', color: 'rgba(255,255,255,.4)', fontSize: 11, cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(194,24,91,.1)'; e.currentTarget.style.color = '#F8BBD0'; e.currentTarget.style.borderColor = 'rgba(194,24,91,.25)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.04)'; e.currentTarget.style.color = 'rgba(255,255,255,.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Summary CTA ──────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,72px) 5%', background: 'linear-gradient(135deg, #1A0010 0%, #2D0A1E 100%)', borderTop: '1px solid rgba(255,255,255,.05)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
            <div style={{ color: '#C2185B', opacity: .8 }}><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg></div>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', marginBottom: 14 }}>Your Gift is Ready to Build</h2>
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '20px 24px', marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', marginBottom: 14 }}>Your Selection Summary</div>
            {[
              { label: 'Gift Bundle', value: selectedBundle ? GIFT_BUNDLES.find(b => b.id === selectedBundle)?.title : 'Not selected' },
              { label: 'Delivery', value: selectedDelivery === 'express' ? 'Express (24–48 hrs) — ₹199' : 'Standard (4–7 days) — FREE' },
              { label: 'Gift Message', value: giftMessage ? 'Added' : 'Not added' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,.4)' }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F8BBD0' }}>{row.value}</span>
              </div>
            ))}
            {selectedBundle && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Bundle Add-on</span>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, color: '#C2185B' }}>+ ₹{GIFT_BUNDLES.find(b => b.id === selectedBundle)?.price.toLocaleString('en-IN')}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/shop')}
              style={{ background: '#C2185B', color: '#fff', border: 'none', padding: '14px 40px', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 6, fontFamily: "'Jost', sans-serif", transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#AD1457'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#C2185B'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Shop & Add Gift
            </button>
            <button onClick={() => navigate('/custom-jewellery')}
              style={{ background: 'transparent', color: '#F8BBD0', border: '1.5px solid rgba(248,187,208,.22)', padding: '13px 28px', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 6, fontFamily: "'Jost', sans-serif", transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,187,208,.07)'; e.currentTarget.style.borderColor = 'rgba(248,187,208,.45)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248,187,208,.22)' }}
            >
              Custom Gift Piece
            </button>
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.18)', marginTop: 20, lineHeight: 1.6 }}>Gift bundles are confirmed at checkout. All jewellery is BIS hallmarked & insured during transit.</p>
        </div>
      </section>

      {/* ── Why Gift From ADORE ───────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) 5%', borderTop: '1px solid rgba(255,255,255,.04)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px,3.5vw,40px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', margin: 0 }}>Why Gift From ADORE?</h2>
          </div>
          {/* Feature cards with image strip */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="why-gift-top">
            {[
              { img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&auto=format&fit=crop&q=80', title: 'Luxury Packaging', desc: 'Signature velvet-lined gift box with hand-tied satin ribbon, personalised card & scented sachet.' },
              { img: 'https://images.unsplash.com/photo-1548532928-b34e3be62062?w=600&auto=format&fit=crop&q=80', title: 'Flowers & Treats Included', desc: 'Premium roses & Belgian chocolates available as add-ons — create a multi-sensory gifting moment.' },
            ].map((item, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 200, background: '#111', cursor: 'default' }}>
                <img src={item.img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .45 }} onError={e => e.currentTarget.style.display='none'} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,0,26,.9) 0%, rgba(13,0,26,.4) 60%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px 20px' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 600, fontStyle: 'italic', color: '#fff', marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {WHY_GIFT.map((item, i) => (
              <div key={i} style={{ padding: '20px 18px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)', borderRadius: 10, transition: 'background .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(194,24,91,.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.03)'}
              >
                <div style={{ color: '#C2185B', opacity: .7, marginBottom: 12 }}>{item.svgIcon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#F8BBD0', marginBottom: 6, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>{item.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .gift-hero-grid { grid-template-columns: 1fr !important; }
          .gift-hero-imgs { display: none !important; }
          .steps-grid { grid-template-columns: repeat(2,1fr) !important; }
          .why-gift-top { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}

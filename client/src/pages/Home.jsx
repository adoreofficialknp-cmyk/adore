import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { GridProductCard, ProductCard, SectionHeader, Spinner, SkeletonCard } from '../components/UI'

// ── Constants ─────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    tag: 'New Collection · 2025',
    title: 'Eternal\nElegance',
    sub: 'Handcrafted in 18K gold with certified diamonds',
    img: 'https://images.unsplash.com/photo-1599459182681-c938b7f65b6d?w=1600&auto=format&fit=crop&q=85',
    cat: 'Necklaces',
    cta: 'Shop Necklaces',
  },
  {
    tag: 'Bestseller',
    title: 'Golden\nMoments',
    sub: 'Rings that tell your love story',
    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&auto=format&fit=crop&q=85',
    cat: 'Rings',
    cta: 'Shop Rings',
  },
  {
    tag: 'Fine Jewellery',
    title: 'Crafted\nWith Love',
    sub: 'Earrings for every occasion',
    img: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=1600&auto=format&fit=crop&q=85',
    cat: 'Earrings',
    cta: 'Shop Earrings',
  },
]

const CATEGORIES = [
  { label: 'Rings', img: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&auto=format&fit=crop&q=80' },
  { label: 'Necklaces', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80' },
  { label: 'Earrings', img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=80' },
  { label: 'Bracelets', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop&q=80' },
  { label: 'Pendants', img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=500&auto=format&fit=crop&q=80' },
]

const TRUST_ITEMS = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    label: 'BIS Hallmarked',
    desc: 'Government certified gold & silver purity on every piece',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
      </svg>
    ),
    label: 'IGI Certified',
    desc: 'International Gemological Institute certified diamonds',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    label: '30-Day Returns',
    desc: 'Hassle-free returns & exchanges, no questions asked',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    label: 'Free Shipping',
    desc: 'Complimentary insured delivery on all orders above ₹2,999',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    label: 'Secure Payments',
    desc: 'Bank-grade 256-bit SSL encryption on all transactions',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    label: '24/7 Support',
    desc: 'Expert jewellery consultants available round the clock',
  },
]

const CERTIFICATIONS = [
  { name: 'BIS Hallmark', detail: 'Bureau of Indian Standards', color: '#1B5E20' },
  { name: 'IGI Certified', detail: 'International Gemological Institute', color: '#1A237E' },
  { name: '18K / 22K Gold', detail: 'Tested & Verified Purity', color: '#B8975A' },
  { name: '925 Silver', detail: 'Sterling Silver Standard', color: '#546E7A' },
]

// ── Countdown Timer ────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - Date.now()
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return time
}

function CountdownBox({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 52 }}>
      <div style={{
        background: 'rgba(0,0,0,.35)',
        border: '1px solid rgba(212,175,90,.3)',
        borderRadius: 4,
        padding: '8px 12px',
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 28,
        fontWeight: 700,
        color: '#FFD700',
        minWidth: 52,
        textAlign: 'center',
        lineHeight: 1,
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <span style={{ fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.55)', fontWeight: 600 }}>{label}</span>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [slide, setSlide] = useState(0)
  const [products, setProducts] = useState([])
  const [trending, setTrending] = useState([])
  const [festive, setFestive] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const slideTimer = useRef(null)

  // Festive sale: persisted target so timer runs correctly across renders
  const festiveTarget = useMemo(() => {
    try {
      const stored = sessionStorage.getItem('adore_festive_target')
      if (stored) {
        const t = parseInt(stored)
        if (t > Date.now()) return new Date(t)
      }
    } catch {}
    const t = Date.now() + 3 * 86400000 + 8 * 3600000 + 22 * 60000
    try { sessionStorage.setItem('adore_festive_target', String(t)) } catch {}
    return new Date(t)
  }, [])
  const countdown = useCountdown(festiveTarget)

  const resetSlideTimer = useCallback(() => {
    clearInterval(slideTimer.current)
    slideTimer.current = setInterval(() => setSlide(s => (s + 1) % HERO_SLIDES.length), 5000)
  }, [])

  useEffect(() => {
    resetSlideTimer()
    return () => clearInterval(slideTimer.current)
  }, [resetSlideTimer])

  // Preload hero images
  useEffect(() => {
    HERO_SLIDES.forEach(s => { const img = new Image(); img.src = s.img })
  }, [])

  useEffect(() => {
    Promise.all([
      api.get('/products?limit=8&sort=createdAt&order=desc'),
      api.get('/products?limit=8&sort=rating&order=desc'),
      api.get('/products?limit=6&sort=price&order=desc'),
    ]).then(([n, t, f]) => {
      setProducts(n.data.products || [])
      setTrending(t.data.products || [])
      setFestive(f.data.products || [])
    }).catch(() => {}).finally(() => setLoading(false))

    if (user) {
      api.get('/wishlist').then(r => setWishlist((r.data || []).map(w => w.productId))).catch(() => {})
    }
  }, [user])

  const handleSlide = (idx) => { setSlide(idx); resetSlideTimer() }
  const prevSlide = () => { setSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length); resetSlideTimer() }
  const nextSlide = () => { setSlide(s => (s + 1) % HERO_SLIDES.length); resetSlideTimer() }

  const handleCart = async (p) => {
    if (!user) { navigate('/login'); throw new Error('not_logged_in') }
    await addToCart(p.id)
    showToast(`${p.name} added to cart`)
  }

  const handleWishlist = async (p) => {
    if (!user) { navigate('/login'); return }
    try {
      await api.post('/wishlist/toggle', { productId: p.id })
      const inWl = wishlist.includes(p.id)
      setWishlist(prev => inWl ? prev.filter(id => id !== p.id) : [...prev, p.id])
      showToast(inWl ? 'Removed from wishlist' : 'Added to wishlist')
    } catch {}
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    showToast('Subscribed successfully!')
  }

  const s = HERO_SLIDES[slide]

  return (
    <div>
      {/* ── 1. HERO SLIDER ─────────────────────────────────────────────── */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', background: '#111', height: 'clamp(420px, 60vh, 680px)' }}>
        {/* Slides */}
        <div style={{ position: 'absolute', inset: 0, transition: 'opacity .6s ease' }}>
          {HERO_SLIDES.map((sl, i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0,
              opacity: i === slide ? 1 : 0,
              transition: 'opacity .7s ease',
              pointerEvents: i === slide ? 'auto' : 'none',
            }}>
              <img
                src={sl.img} alt={sl.title}
                loading="eager" crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .65 }}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&auto=format&fit=crop&q=80' }}
              />
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.1) 65%)' }} />

        {/* Content */}
        <div style={{
          position: 'relative', zIndex: 2, height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '0 max(5%, 24px)',
        }}>
          <div key={slide} className="animate-fade-up">
            <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--gold-light)', fontWeight: 600, marginBottom: 16 }}>{s.tag}</div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(44px, 7vw, 80px)',
              fontWeight: 600, color: '#fff', lineHeight: 1.05,
              fontStyle: 'italic', whiteSpace: 'pre-line',
              marginBottom: 16,
            }}>{s.title}</h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', letterSpacing: '.03em', marginBottom: 32, maxWidth: 380 }}>{s.sub}</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <button className="btn-gold" onClick={() => navigate(`/shop?category=${s.cat}`)}>{s.cta}</button>
              <button
                onClick={() => navigate('/shop')}
                style={{
                  background: 'transparent', color: '#fff',
                  border: '1.5px solid rgba(255,255,255,.45)',
                  padding: '14px 28px', fontSize: 12, fontWeight: 600,
                  letterSpacing: '.1em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: 2, fontFamily: "'Jost', sans-serif",
                  transition: 'border-color .2s',
                }}
              >
                View All
              </button>
            </div>
          </div>
        </div>

        {/* Prev / Next arrows */}
        {[{ fn: prevSlide, dir: 'left', pts: '15 18 9 12 15 6' }, { fn: nextSlide, dir: 'right', pts: '9 18 15 12 9 6' }].map(({ fn, dir, pts }) => (
          <button
            key={dir}
            onClick={fn}
            style={{
              position: 'absolute', top: '50%', [dir]: 24,
              transform: 'translateY(-50%)',
              width: 42, height: 42, borderRadius: '50%',
              background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', backdropFilter: 'blur(4px)', zIndex: 3,
              transition: 'background .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.22)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.12)'}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={pts} />
            </svg>
          </button>
        ))}

        {/* Dots */}
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 3 }}>
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i} onClick={() => handleSlide(i)}
              style={{
                width: slide === i ? 24 : 6, height: 6,
                borderRadius: 3, background: slide === i ? 'var(--gold)' : 'rgba(255,255,255,.35)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all .3s',
              }}
            />
          ))}
        </div>
      </section>

      {/* ── 2. MARQUEE ─────────────────────────────────────────────────── */}
      <div style={{ background: 'var(--gold)', overflow: 'hidden', padding: '10px 0' }}>
        <div style={{ display: 'inline-flex', gap: 48, animation: 'marquee 28s linear infinite', whiteSpace: 'nowrap' }}>
          {[...Array(2)].map((_, ri) =>
            ['Free shipping on orders above ₹2,999', '◆', 'BIS Hallmarked Jewellery', '◆', '30-Day Easy Returns', '◆', 'Use code ADORE10 for 10% off', '◆', 'IGI Certified Diamonds', '◆', 'EMI options available', '◆'].map((item, i) => (
              <span key={`${ri}-${i}`} style={{ fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#fff', fontWeight: item === '◆' ? 400 : 600, opacity: item === '◆' ? .5 : 1 }}>
                {item}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── 3. CATEGORIES ──────────────────────────────────────────────── */}
      <section style={{ background: 'var(--gold-bg)', padding: 'clamp(40px,5vw,64px) 5%' }}>
        <SectionHeader title="Shop by Category" onViewAll={() => navigate('/shop')} />
        <div className="home-cats" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 16,
        }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat.label}
              onClick={() => navigate(`/shop?category=${cat.label}`)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            >
              <div style={{
                width: '100%', aspectRatio: '1', borderRadius: '50%',
                overflow: 'hidden', border: '2px solid var(--gold-border)',
                transition: 'border-color .2s, transform .2s',
                background: '#f0ebe3',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'scale(1.04)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gold-border)'; e.currentTarget.style.transform = 'scale(1)' }}
              >
                <img src={cat.img} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" crossOrigin="anonymous" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80' }} />
              </div>
              <span style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-60)' }}>{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. FESTIVAL SALE ───────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #3B0000 0%, #7B1C1C 40%, #4A0E00 100%)',
        padding: 'clamp(40px,5vw,64px) 5%',
      }}>
        {/* Decorative background pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: .06,
          backgroundImage: `repeating-linear-gradient(45deg, #FFD700 0, #FFD700 1px, transparent 0, transparent 50%)`,
          backgroundSize: '20px 20px',
        }} />
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,180,0,.06)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,100,0,.06)' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: '#FFB347', fontWeight: 600, marginBottom: 10 }}>
                ✦ Limited Time Offer ✦
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>
                Diwali Jewellery Sale
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', letterSpacing: '.03em' }}>Up to 20% off on premium collections</p>
            </div>

            {/* Countdown */}
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', marginBottom: 10, textAlign: 'center' }}>Sale ends in</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <CountdownBox value={countdown.d} label="Days" />
                <span style={{ color: '#FFD700', fontSize: 24, fontWeight: 700, marginTop: 6, lineHeight: 1 }}>:</span>
                <CountdownBox value={countdown.h} label="Hours" />
                <span style={{ color: '#FFD700', fontSize: 24, fontWeight: 700, marginTop: 6, lineHeight: 1 }}>:</span>
                <CountdownBox value={countdown.m} label="Mins" />
                <span style={{ color: '#FFD700', fontSize: 24, fontWeight: 700, marginTop: 6, lineHeight: 1 }}>:</span>
                <CountdownBox value={countdown.s} label="Secs" />
              </div>
            </div>
          </div>

          {/* Promo badges */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
            {[{ code: 'ADORE10', off: '10% OFF', min: 'Min. ₹5,000' }, { code: 'WELCOME500', off: '₹500 OFF', min: 'Min. ₹3,000' }, { code: 'LUXURY20', off: '20% OFF', min: 'Min. ₹50,000' }].map(c => (
              <div key={c.code} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'rgba(0,0,0,.3)',
                border: '1px dashed rgba(255,215,0,.35)',
                borderRadius: 4, padding: '10px 16px',
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#FFD700', letterSpacing: '.04em' }}>{c.off}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', letterSpacing: '.08em' }}>{c.min}</div>
                </div>
                <div style={{ width: 1, height: 32, background: 'rgba(255,215,0,.2)' }} />
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.14em', color: '#fff', fontFamily: 'monospace' }}>{c.code}</div>
              </div>
            ))}
          </div>

          {/* Products */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : festive.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
              {festive.slice(0, 6).map(p => (
                <div key={p.id} style={{ background: 'rgba(255,255,255,.96)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#f5f5f3' }}>
                    <img src={p.images?.[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" crossOrigin="anonymous" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80' }} />
                    <span className="badge-festive" style={{ position: 'absolute', top: 8, left: 8 }}>Diwali Pick</span>
                  </div>
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-40)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>{p.category}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>₹{Number(p.price).toLocaleString('en-IN')}</span>
                      {p.originalPrice && <span style={{ fontSize: 12, color: 'var(--ink-40)', textDecoration: 'line-through' }}>₹{Number(p.originalPrice).toLocaleString('en-IN')}</span>}
                    </div>
                    <button
                      onClick={() => handleCart(p)}
                      style={{
                        width: '100%', padding: '9px 0',
                        background: '#7B1C1C', color: '#FFD700',
                        border: 'none', cursor: 'pointer', borderRadius: 2,
                        fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                        fontFamily: "'Jost', sans-serif",
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => navigate('/shop')}
              style={{
                background: 'transparent', color: '#FFD700',
                border: '1.5px solid rgba(255,215,0,.5)',
                padding: '14px 40px', fontSize: 12, fontWeight: 700,
                letterSpacing: '.12em', textTransform: 'uppercase',
                cursor: 'pointer', borderRadius: 2, fontFamily: "'Jost', sans-serif",
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,215,0,.1)'; e.currentTarget.style.borderColor = '#FFD700' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,215,0,.5)' }}
            >
              Shop All Festive Picks →
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. NEW ARRIVALS ─────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) 5%' }}>
        <SectionHeader title="New Arrivals" subtitle="Just landed" onViewAll={() => navigate('/shop')} />
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
            {products.map(p => (
              <GridProductCard
                key={p.id} product={p}
                onPress={() => navigate(`/product/${p.id}`)}
                onAddToCart={() => handleCart(p)}
                onBuyNow={() => { handleCart(p).then(() => navigate("/checkout")).catch(() => {}) }}
                onWishlist={() => handleWishlist(p)}
                wishlisted={wishlist.includes(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 5b. SHOP BY GENDER ──────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) clamp(16px,5%,80px)', background: '#fff', overflowX: 'hidden' }}>
        <SectionHeader title="Shop by Style" subtitle="Curated for you" onViewAll={() => navigate('/shop')} />
        <div className="home-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            {
              label: 'For Her',
              sub: 'Rings, Necklaces, Earrings & more',
              img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80',
              filter: 'Women',
            },
            {
              label: 'For Him',
              sub: 'Chains, Bracelets, Rings & more',
              img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
              filter: 'Men',
            },
          ].map(g => (
            <div key={g.label} onClick={() => navigate(`/shop?gender=${g.filter}`)}
              style={{ position: 'relative', borderRadius: 3, overflow: 'hidden', cursor: 'pointer',
                height: 'clamp(200px, 35vw, 420px)', background: '#111' }}>
              <img src={g.img} alt={g.label} loading="lazy" crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .65,
                  transition: 'transform .5s ease', display: 'block' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80' }}
              />
              <div style={{ position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 55%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: 'clamp(16px,3vw,32px)' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,3vw,38px)',
                  fontWeight: 600, fontStyle: 'italic', color: '#fff', marginBottom: 8 }}>{g.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginBottom: 16 }}>{g.sub}</div>
                <span className="btn-gold" style={{ alignSelf: 'flex-start', padding: '10px 24px', fontSize: 11 }}>
                  Explore →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5c. SHOP BY BOND ────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) clamp(16px,5%,80px)', background: 'var(--gold-bg)', overflowX: 'hidden' }}>
        <SectionHeader title="Shop by Bond" subtitle="Gifts that go beyond jewellery" onViewAll={() => navigate('/shop/bond/all')} />
        <div style={{ overflowX: 'auto', paddingBottom: 8, marginBottom: -8 }}>
          <div style={{ display: 'flex', gap: 16, width: 'max-content', padding: '4px 0' }}>
            {[
              { label: 'For Mother',     img: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80', tag: 'mother' },
              { label: 'For Father',     img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80', tag: 'father' },
              { label: 'For Wife',       img: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400&auto=format&fit=crop&q=80', tag: 'wife' },
              { label: 'For Girlfriend', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80', tag: 'girlfriend' },
              { label: 'For Boyfriend',  img: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?w=400&auto=format&fit=crop&q=80', tag: 'boyfriend' },
              { label: 'For Sister',     img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80', tag: 'sister' },
              { label: 'For Brother',    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', tag: 'brother' },
              { label: 'For Son',        img: 'https://images.unsplash.com/photo-1519456264917-42d0aa2e0625?w=400&auto=format&fit=crop&q=80', tag: 'son' },
              { label: 'For Daughter',   img: 'https://images.unsplash.com/photo-1518621845945-eb03bd89a58a?w=400&auto=format&fit=crop&q=80', tag: 'daughter' },
              { label: 'For Friend',     img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&auto=format&fit=crop&q=80', tag: 'friend' },
            ].map(b => (
              <div key={b.tag} onClick={() => navigate(`/shop/bond/${b.tag}`)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
                <div style={{
                  width: 'clamp(100px,12vw,140px)', height: 'clamp(100px,12vw,140px)',
                  borderRadius: '50%', overflow: 'hidden',
                  border: '2.5px solid var(--gold-border)',
                  background: '#f0ebe3', transition: 'border-color .2s, transform .2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'scale(1.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--gold-border)'; e.currentTarget.style.transform = 'scale(1)' }}
                >
                  <img src={b.img} alt={b.label} loading="lazy" crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80' }}
                  />
                </div>
                <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-60)', textAlign: 'center', maxWidth: 110 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. TRUST & PROMISE STRIP ────────────────────────────────────── */}
      <section style={{ background: 'var(--gold-bg)', padding: 'clamp(40px,5vw,64px) 5%' }}>
        <SectionHeader title="The ADORE Promise" subtitle="Why choose us" centered />
        <div className="home-trust" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 1, background: 'var(--gold-border)',
          border: '1px solid var(--gold-border)',
        }}>
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} style={{
              background: '#fff', padding: '28px 24px',
              display: 'flex', alignItems: 'flex-start', gap: 16,
              transition: 'background .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-bg)'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'var(--gold-bg)', border: '1px solid var(--gold-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--gold)', flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6, letterSpacing: '.02em' }}>{item.label}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7. PROMO BANNER ─────────────────────────────────────────────── */}
      <section className="promo-banners" style={{ padding: '0 5% clamp(40px,5vw,64px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          {
            img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&auto=format&fit=crop&q=80',
            tag: 'New Brides', title: 'Bridal\nCollection',
            cta: 'Explore', cat: 'Necklaces',
          },
          {
            img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&auto=format&fit=crop&q=80',
            tag: 'Best Seller', title: 'Solitaire\nRings',
            cta: 'Shop Now', cat: 'Rings',
          },
        ].map((b, i) => (
          <div
            key={i}
            onClick={() => navigate(`/shop?category=${b.cat}`)}
            style={{
              position: 'relative', overflow: 'hidden', cursor: 'pointer',
              borderRadius: 3, height: 'clamp(200px, 30vw, 340px)',
              background: '#111',
            }}
          >
            <img src={b.img} alt={b.title} loading="lazy" crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .6, transition: 'transform .5s ease, opacity .3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.opacity = '.5' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '.6' }}
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 28 }}>
              <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: 8, fontWeight: 600 }}>{b.tag}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', whiteSpace: 'pre-line', lineHeight: 1.15, marginBottom: 16 }}>{b.title}</div>
              <span style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                {b.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── 8. TRENDING NOW ─────────────────────────────────────────────── */}
      <section style={{ padding: '0 5% clamp(40px,5vw,64px)', background: '#fafaf8' }}>
        <SectionHeader title="Trending Now" subtitle="Most loved" onViewAll={() => navigate('/shop?sort=rating')} />
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
            {trending.map(p => (
              <GridProductCard
                key={p.id} product={p}
                onPress={() => navigate(`/product/${p.id}`)}
                onAddToCart={() => handleCart(p)}
                onBuyNow={() => { handleCart(p).then(() => navigate("/checkout")).catch(() => {}) }}
                onWishlist={() => handleWishlist(p)}
                wishlisted={wishlist.includes(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 9. TRUST & CERTIFICATION ────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) 5%', borderTop: '1px solid rgba(28,28,30,.06)' }}>
        <SectionHeader title="Certified & Trusted" subtitle="Our guarantees" centered />

        {/* Certification badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
          {CERTIFICATIONS.map((cert, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '18px 20px',
              border: '1.5px solid',
              borderColor: cert.color + '30',
              borderRadius: 4,
              background: cert.color + '08',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: cert.color + '15',
                border: `1.5px solid ${cert.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={cert.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: cert.color, letterSpacing: '.02em', marginBottom: 3 }}>{cert.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-60)', lineHeight: 1.4 }}>{cert.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Full-width certification visual */}
        <div className="commitment-grid" style={{
          background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A3B 100%)',
          borderRadius: 4, padding: 'clamp(32px, 5vw, 56px)',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 32, alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold-light)', marginBottom: 12, fontWeight: 600 }}>Our Commitment</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 600, color: '#fff', lineHeight: 1.2, marginBottom: 16, fontStyle: 'italic' }}>
              Every piece is tested,<br />certified & guaranteed
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.8, maxWidth: 380 }}>
              Each ADORE piece undergoes rigorous quality testing at government-approved labs. Our gold is BIS hallmarked, our diamonds are IGI/GIA certified, and every gemstone is lab-verified for authenticity.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { val: '100%', lbl: 'BIS Certified' },
              { val: '18K+', lbl: 'Gold Standard' },
              { val: '50,000+', lbl: 'Happy Customers' },
              { val: '5★', lbl: 'Avg Rating' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,255,255,.1)',
                borderRadius: 4, padding: '20px 16px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: 'var(--gold-light)', marginBottom: 6 }}>{stat.val}</div>
                <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', fontWeight: 600 }}>{stat.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9b. SHOP BY COLOR ───────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) 5%', background: '#fff' }}>
        <SectionHeader title="Shop by Color" subtitle="Find your shade" onViewAll={() => navigate('/shop')} />
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, marginBottom: -8 }}>
          {[
            { label: 'Yellow Gold', color: '#D4AF37', hex: 'Yellow Gold', img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&auto=format&fit=crop&q=80' },
            { label: 'Rose Gold', color: '#B76E79', hex: 'Rose Gold', img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&auto=format&fit=crop&q=80' },
            { label: 'White Gold', color: '#E8E8E8', hex: 'White Gold', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80' },
            { label: 'Silver', color: '#C0C0C0', hex: 'Silver', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&auto=format&fit=crop&q=80' },
            { label: 'Diamond', color: '#B9F2FF', hex: 'Diamond', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=80' },
            { label: 'Ruby Red', color: '#9B111E', hex: 'Ruby', img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&auto=format&fit=crop&q=80' },
            { label: 'Emerald', color: '#50C878', hex: 'Emerald', img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&auto=format&fit=crop&q=80' },
            { label: 'Sapphire', color: '#0F52BA', hex: 'Sapphire', img: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=400&auto=format&fit=crop&q=80' },
          ].map(c => (
            <div
              key={c.label}
              onClick={() => navigate(`/shop?color=${encodeURIComponent(c.hex)}`)}
              style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', width: 90 }}
            >
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                overflow: 'hidden', position: 'relative',
                border: '3px solid transparent',
                boxShadow: '0 2px 12px rgba(0,0,0,.12)',
                transition: 'transform .25s, box-shadow .25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = `0 4px 20px ${c.color}55` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.12)' }}
              >
                <img src={c.img} alt={c.label} loading="lazy" crossOrigin="anonymous"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: c.color, opacity: 0.45, mixBlendMode: 'color' }} />
              </div>
              <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-60)', textAlign: 'center', lineHeight: 1.3 }}>{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9c. RING SIZER CTA ──────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(32px,4vw,48px) 5%', background: 'var(--gold-bg)', borderTop: '1px solid var(--gold-border)', borderBottom: '1px solid var(--gold-border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', border: '1.5px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>💍</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Not sure about your ring size?</div>
              <div style={{ fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.5 }}>Use our free Ring Sizer tool — get your exact size in seconds.</div>
            </div>
          </div>
          <button className="btn-gold" onClick={() => navigate('/profile')} style={{ flexShrink: 0 }}>
            Open Ring Sizer →
          </button>
        </div>
      </section>

      {/* ── 9d. CUSTOM JEWELLERY CTA ─────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A3B 60%, #0D1B2A 100%)',
        padding: 'clamp(48px,6vw,80px) 5%',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .04, backgroundImage: 'radial-gradient(circle, #B8975A 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--gold-light)', fontWeight: 600, marginBottom: 14 }}>✦ Bespoke Jewellery ✦</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,4.5vw,56px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
            Design Your Dream Piece
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', maxWidth: 520, margin: '0 auto 32px', lineHeight: 1.8 }}>
            Work with our master artisans to create jewellery that tells your unique story. From concept to creation — fully bespoke, certified, and delivered to your door.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-gold" style={{ padding: '15px 40px', fontSize: 13 }} onClick={() => navigate('/custom-jewellery')}>
              Start Your Request →
            </button>
            <button onClick={() => navigate('/custom-jewellery')} style={{ background: 'transparent', color: 'rgba(255,255,255,.7)', border: '1.5px solid rgba(255,255,255,.25)', padding: '15px 32px', fontSize: 12, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, fontFamily: "'Jost',sans-serif", transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.6)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,.25)'; e.currentTarget.style.color = 'rgba(255,255,255,.7)' }}
            >
              Learn More
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 40, flexWrap: 'wrap' }}>
            {[{ val: '3–6 weeks', lbl: 'Delivery Time' }, { val: '100%', lbl: 'Certified' }, { val: '₹5k+', lbl: 'Starting Budget' }].map(s => (
              <div key={s.lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 700, color: 'var(--gold-light)', marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. NEWSLETTER ──────────────────────────────────────────────── */}
      <section style={{
        background: 'var(--ink)', padding: 'clamp(48px,6vw,72px) 5%',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 14 }}>Stay in the loop</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', lineHeight: 1.15, marginBottom: 12 }}>
            Exclusive offers &<br />new arrivals first
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 28, lineHeight: 1.6 }}>
            Subscribe and get ₹500 off on your first order.
          </p>
          {subscribed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: 'var(--gold)', fontSize: 15 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              You're subscribed! Check your inbox for ₹500 off.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 0, maxWidth: 440, margin: '0 auto', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 2, overflow: 'hidden' }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                style={{
                  flex: 1, padding: '14px 18px', background: 'rgba(255,255,255,.07)',
                  border: 'none', color: '#fff', fontSize: 14, outline: 'none',
                  fontFamily: "'Jost', sans-serif",
                }}
              />
              <button type="submit" className="btn-gold" style={{ borderRadius: 0, flexShrink: 0 }}>Subscribe</button>
            </form>
          )}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', marginTop: 14, letterSpacing: '.04em' }}>No spam, unsubscribe anytime.</p>
        </div>
      </section>

      <style>{`
        @media (max-width: 600px) {
          .home-two-col { grid-template-columns: 1fr !important; }
          .promo-banners { grid-template-columns: 1fr !important; }
          .commitment-grid { grid-template-columns: 1fr !important; }
          .commitment-grid > div:last-child { grid-template-columns: 1fr 1fr !important; }
          .home-cats { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 380px) {
          .home-cats { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  )
}

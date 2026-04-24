import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Stars, Spinner, Icons, GridProductCard } from '../components/UI'

const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

/* ── Delivery Dates ───────────────────────────────────────────────────────── */
function DeliveryDates() {
  const formatDate = (daysToAdd) => {
    const now = new Date()
    const isAfter5PM = now.getHours() >= 17
    const base = new Date(now)
    base.setDate(base.getDate() + daysToAdd + (isAfter5PM ? 1 : 0))
    return base.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })
  }

  const normalDate = formatDate(3)
  const expressDate = formatDate(1)

  return (
    <div style={{ marginBottom: 20, padding: '12px 14px', background: '#f9faf8', borderRadius: 6, border: '1px solid #ece9e0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5a7a5a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
          </svg>
          <span style={{ fontSize: 13, color: 'var(--ink-60)', fontFamily: "'Jost',sans-serif" }}>
            Delivery by{' '}
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{normalDate}</span>
            <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--ink-40)', fontWeight: 400 }}>Standard (Free)</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#c07a2a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span style={{ fontSize: 13, color: 'var(--ink-60)', fontFamily: "'Jost',sans-serif" }}>
            Get it by{' '}
            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{expressDate}</span>
            <span style={{ marginLeft: 6, fontSize: 11, color: '#c07a2a', fontWeight: 600 }}>Express (+₹99)</span>
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Image Zoom Lightbox ──────────────────────────────────────────────────── */
function ImageLightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const [scale, setScale] = useState(1)
  const [translate, setTranslate] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [pinchDist, setPinchDist] = useState(null)

  useEffect(() => { setScale(1); setTranslate({ x: 0, y: 0 }) }, [idx])

  const close = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length)
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + images.length) % images.length)
      if (e.key === '+' || e.key === '=') setScale(s => Math.min(4, s + 0.5))
      if (e.key === '-') setScale(s => { const n = Math.max(1, s - 0.5); if (n === 1) setTranslate({ x: 0, y: 0 }); return n })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [images.length, close])

  const handleWheel = e => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.25 : 0.25
    setScale(s => { const n = Math.min(4, Math.max(1, s + delta)); if (n <= 1) setTranslate({ x: 0, y: 0 }); return n })
  }

  const handleMouseDown = e => {
    if (scale <= 1) return
    setDragging(true)
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y })
  }
  const handleMouseMove = e => {
    if (!dragging) return
    setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
  }
  const handleMouseUp = () => setDragging(false)

  const handleTouchMove = e => {
    if (e.touches.length === 2) {
      e.preventDefault()
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (pinchDist) {
        const ratio = dist / pinchDist
        setScale(s => Math.min(4, Math.max(1, s * ratio)))
      }
      setPinchDist(dist)
    }
  }
  const handleTouchEnd = () => setPinchDist(null)

  const FALLBACK = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&auto=format&fit=crop&q=80'

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) close() }}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}
    >
      {/* Close */}
      <button onClick={close} style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>✕</button>

      {/* Hint */}
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', fontSize: 11, color: 'rgba(255,255,255,.4)', fontFamily: "'Jost',sans-serif", letterSpacing: '.06em', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
        Tap image to zoom · Scroll / pinch · ← → to navigate
      </div>

      {/* Prev / Next */}
      {images.length > 1 && (
        <>
          <button onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>‹</button>
          <button onClick={() => setIdx(i => (i + 1) % images.length)}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.12)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}>›</button>
        </>
      )}

      {/* Main image */}
      <div
        style={{ overflow: 'hidden', maxWidth: '82vw', maxHeight: '80vh', borderRadius: 4, cursor: scale > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in' }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={e => {
          e.stopPropagation()
          if (scale === 1) { setScale(2.5) }
          else if (!dragging) { setScale(1); setTranslate({ x: 0, y: 0 }) }
        }}
      >
        <img
          src={images[idx] || FALLBACK}
          alt=""
          crossOrigin="anonymous"
          draggable={false}
          style={{
            display: 'block', maxWidth: '82vw', maxHeight: '80vh', objectFit: 'contain',
            transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
            transition: dragging ? 'none' : 'transform .22s ease',
          }}
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK }}
        />
      </div>

      {/* Zoom controls */}
      <div style={{ position: 'absolute', bottom: images.length > 1 ? 108 : 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 2, alignItems: 'center' }}>
        <button onClick={() => setScale(s => { const n = Math.max(1, s - 0.5); if (n === 1) setTranslate({ x: 0, y: 0 }); return n })} disabled={scale <= 1}
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', cursor: scale <= 1 ? 'default' : 'pointer', color: '#fff', fontSize: 22, opacity: scale <= 1 ? .35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <button onClick={() => { setScale(1); setTranslate({ x: 0, y: 0 }) }}
          style={{ height: 36, padding: '0 16px', borderRadius: 18, background: 'rgba(255,255,255,.12)', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: "'Jost',sans-serif", letterSpacing: '.06em', minWidth: 56 }}>{Math.round(scale * 100)}%</button>
        <button onClick={() => setScale(s => Math.min(4, s + 0.5))} disabled={scale >= 4}
          style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: 'none', cursor: scale >= 4 ? 'default' : 'pointer', color: '#fff', fontSize: 22, opacity: scale >= 4 ? .35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, padding: '8px 12px', background: 'rgba(0,0,0,.5)', borderRadius: 40, maxWidth: '90vw', overflowX: 'auto' }}>
          {images.map((img, i) => (
            <div key={i} onClick={e => { e.stopPropagation(); setIdx(i) }}
              style={{ width: 48, height: 48, borderRadius: 4, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', border: `2px solid ${i === idx ? 'var(--gold)' : 'transparent'}`, opacity: i === idx ? 1 : .5, transition: 'all .2s' }}>
              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Main ProductDetail ───────────────────────────────────────────────────── */
export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [mainImg, setMainImg] = useState(0)
  const [size, setSize] = useState(null)
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const [adding, setAdding] = useState(false)
  const [similar, setSimilar] = useState([])
  const [simWishlist, setSimWishlist] = useState([])
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const openLightbox = i => { setLightboxIndex(i); setLightboxOpen(true) }

  useEffect(() => {
    setLoading(true)
    setMainImg(0)
    setSimilar([])
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data)
      setLoading(false)
      api.get(`/products?category=${encodeURIComponent(r.data.category)}&limit=8`)
        .then(res => {
          const filtered = (res.data.products || []).filter(p => p.id !== id)
          setSimilar(filtered.slice(0, 8))
        }).catch(() => {})
    }).catch(() => { navigate('/shop') })

    if (user) {
      api.get('/wishlist').then(r => {
        const ids = (r.data || []).map(w => w.productId)
        setWishlisted(ids.includes(id))
        setSimWishlist(ids)
      }).catch(() => {})
    }
  }, [id, user])

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try { await addToCart(id, qty, size); showToast('Added to cart') }
    catch { showToast('Failed to add') }
    finally { setAdding(false) }
  }

  const handleBuyNow = async () => {
    if (!user) { navigate('/login'); return }
    setAdding(true)
    try { await addToCart(id, qty, size); navigate('/checkout') }
    catch { showToast('Something went wrong') }
    finally { setAdding(false) }
  }

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return }
    await api.post('/wishlist/toggle', { productId: id })
    setWishlisted(w => !w)
    showToast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const handleSimCart = async (p) => {
    if (!user) { navigate('/login'); throw new Error('not_logged_in') }
    await addToCart(p.id)
    showToast(`${p.name} added to cart`)
  }

  const handleSimWishlist = async (p) => {
    if (!user) { navigate('/login'); return }
    try {
      await api.post('/wishlist/toggle', { productId: p.id })
      setSimWishlist(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])
      showToast(simWishlist.includes(p.id) ? 'Removed from wishlist' : 'Added to wishlist')
    } catch {}
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Spinner size={40} />
    </div>
  )

  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  const isOOS = product.stock === 0
  const SIZES = ['6', '7', '8', '9', '10', '11', '12']
  const needsSize = ['Rings', 'Bracelets'].includes(product.category)
  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80']

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* ── Sticky Footer ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid var(--ink-10)',
        padding: '10px 16px',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {fmt(product.price)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink-40)', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            Free shipping
          </div>
        </div>
        <button
          className="btn-dark"
          style={{ flex: '0 0 auto', padding: '0 20px', height: 46, fontSize: 13, opacity: (isOOS || adding) ? .5 : 1 }}
          disabled={isOOS || adding}
          onClick={handleAddToCart}
        >
          {isOOS ? 'Out of Stock' : adding ? '…' : '+ Cart'}
        </button>
        {!isOOS && (
          <button
            className="btn-gold"
            style={{ flex: '0 0 auto', padding: '0 20px', height: 46, fontSize: 13, opacity: adding ? .5 : 1 }}
            disabled={adding}
            onClick={handleBuyNow}
          >
            Buy Now
          </button>
        )}
      </div>
      {lightboxOpen && <ImageLightbox images={images} startIndex={lightboxIndex} onClose={() => setLightboxOpen(false)} />}

      <div style={{ padding: 'clamp(24px,4vw,48px) 5%' }}>
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-60)', fontSize: 13, fontWeight: 600, fontFamily: "'Jost',sans-serif", marginBottom: 28, padding: 0 }}
        >
          {Icons.back} Back to Shop
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'clamp(32px,5vw,64px)', alignItems: 'start' }}>
          {/* Images */}
          <div>
            {/* Main image — click opens lightbox */}
            <div
              onClick={() => openLightbox(mainImg)}
              style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', background: '#f5f5f3', aspectRatio: '1', marginBottom: 12, cursor: 'zoom-in' }}
            >
              <img
                src={images[mainImg]}
                alt={product.name}
                loading="eager" crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity .3s' }}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80' }}
              />
              {discount > 0 && (
                <span className="badge-off" style={{ position: 'absolute', top: 16, left: 16 }}>{discount}% OFF</span>
              )}
              {isOOS && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.08em', color: 'var(--ink-60)' }}>OUT OF STOCK</span>
                </div>
              )}
              {/* Zoom badge */}
              <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,.45)', color: '#fff', borderRadius: 20, padding: '5px 12px', fontSize: 11, fontFamily: "'Jost',sans-serif", fontWeight: 600, letterSpacing: '.04em', pointerEvents: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>
                Tap to zoom
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleWishlist() }}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'rgba(255,255,255,.95)', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: wishlisted ? '#e53935' : 'rgba(28,28,30,.5)',
                  boxShadow: '0 2px 12px rgba(0,0,0,.12)',
                }}
              >
                {Icons.heart(wishlisted)}
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setMainImg(i)}
                    style={{
                      width: 72, height: 72, borderRadius: 3, overflow: 'hidden',
                      cursor: 'pointer', flexShrink: 0,
                      border: `2px solid ${mainImg === i ? 'var(--gold)' : 'transparent'}`,
                      background: '#f5f5f3',
                    }}
                  >
                    <img src={img} alt="" loading="lazy" crossOrigin="anonymous"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&auto=format&fit=crop&q=80' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info — untouched */}
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 10 }}>{product.category}</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3vw,38px)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.2, marginBottom: 16 }}>{product.name}</h1>

            <Stars rating={product.rating} count={product.reviewCount} style={{ marginBottom: 16 }} />

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 700, color: 'var(--ink)' }}>{fmt(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span style={{ fontSize: 16, color: 'var(--ink-40)', textDecoration: 'line-through' }}>{fmt(product.originalPrice)}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 2, letterSpacing: '.04em' }}>{discount}% OFF</span>
                </>
              )}
            </div>

            {product.description && (
              <p style={{ fontSize: 14, color: 'var(--ink-60)', lineHeight: 1.8, marginBottom: 16 }}>{product.description}</p>
            )}

            <DeliveryDates />

            {needsSize && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-60)' }}>Select Size</div>
                  <button onClick={() => navigate('/profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--gold)', fontWeight: 700, fontFamily: "'Jost',sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
                    💍 Find your size
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SIZES.map(s => (
                    <button key={s} onClick={() => setSize(s)}
                      style={{ width: 44, height: 44, borderRadius: 3, border: '1.5px solid', borderColor: size === s ? 'var(--gold)' : 'var(--ink-10)', background: size === s ? 'var(--gold)' : '#fff', color: size === s ? '#fff' : 'var(--ink)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif", transition: 'all .2s' }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-60)' }}>Quantity</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1.5px solid var(--ink-10)', borderRadius: 2, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>{Icons.minus}</button>
                <span style={{ width: 36, textAlign: 'center', fontSize: 14, fontWeight: 700 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink)' }}>{Icons.plus}</button>
              </div>
              <div style={{ fontSize: 12, color: product.stock <= 5 ? '#e65100' : 'var(--ink-40)', fontWeight: 600 }}>
                {product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
              </div>
            </div>

            {/* Buttons shown inline only when OOS (sticky footer is hidden then) */}
            {isOOS && (
              <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                <button className="btn-dark" style={{ flex: 1, opacity: .5 }} disabled>
                  Out of Stock
                </button>
              </div>
            )}

            {product.reviews?.length > 0 && (
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Cormorant Garamond',serif", marginBottom: 16, borderTop: '1px solid var(--ink-10)', paddingTop: 24 }}>
                  Reviews ({product.reviewCount})
                </div>
                {product.reviews.slice(0, 5).map(r => (
                  <div key={r.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--ink-5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{r.user.name[0]}</div>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>{r.user.name}</span>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    {r.title && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{r.title}</div>}
                    {r.body && <div style={{ fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.6 }}>{r.body}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Free Shipping Banner */}
      <div style={{ background: '#FFF0F5', borderTop: '1px solid #F8BBD0', borderBottom: '1px solid #F8BBD0', padding: '18px 5%' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px 24px' }}>
          {[
            { icon: '🚚', title: 'Free Shipping', sub: 'Complimentary on every order' },
            { icon: '↩️', title: '30-Day Returns', sub: 'Easy hassle-free returns' },
            { icon: '🔒', title: 'Secure Payments', sub: 'Razorpay encrypted checkout' },
            { icon: '✓', title: 'BIS Hallmarked', sub: 'Certified purity guaranteed' },
          ].map(b => (
            <div key={b.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 20, lineHeight: 1, marginTop: 1, flexShrink: 0 }}>{b.icon}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#880E4F', letterSpacing: '.04em', lineHeight: 1.3 }}>{b.title}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-60)', lineHeight: 1.4, marginTop: 2 }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Similar Products */}
      {similar.length > 0 && (
        <section style={{ padding: 'clamp(32px,5vw,56px) 5%', background: 'var(--gold-bg)', borderTop: '1px solid var(--gold-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 6 }}>You May Also Like</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,3vw,32px)', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>More {product.category}</h2>
            </div>
            <button onClick={() => navigate(`/shop?category=${product.category}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-60)', fontFamily: "'Jost',sans-serif" }}>
              View all {Icons.chevRight}
            </button>
          </div>
          <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, alignItems: 'start' }}>
            {similar.map(p => (
              <GridProductCard key={p.id} product={p}
                onPress={() => navigate(`/product/${p.id}`)}
                onAddToCart={() => handleSimCart(p)}
                onBuyNow={() => handleSimCart(p).then(() => navigate('/checkout')).catch(() => {})}
                onWishlist={() => handleSimWishlist(p)}
                wishlisted={simWishlist.includes(p.id)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

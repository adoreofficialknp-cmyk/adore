import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { GridProductCard, SkeletonCard, EmptyState } from '../components/UI'

const BOND_META = {
  mother:     { label: 'For Mother',     desc: "Timeless pieces that honour the woman who gave you everything", icon: '🌸', img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1400&auto=format&fit=crop&q=85' },
  father:     { label: 'For Father',     desc: "Strong, classic jewellery for the man who built your world",   icon: '🌟', img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1400&auto=format&fit=crop&q=85' },
  wife:       { label: 'For Wife',       desc: "Express your forever love with something she'll treasure",      icon: '💍', img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1400&auto=format&fit=crop&q=85' },
  girlfriend: { label: 'For Girlfriend', desc: "Romantic jewellery that says everything words can't",          icon: '💝', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1400&auto=format&fit=crop&q=85' },
  boyfriend:  { label: 'For Boyfriend',  desc: "Thoughtful pieces for the man who matters most",               icon: '💎', img: 'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=1400&auto=format&fit=crop&q=85' },
  sister:     { label: 'For Sister',     desc: "Celebrate the bond that nothing can break",                    icon: '✨', img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1400&auto=format&fit=crop&q=85' },
  brother:    { label: 'For Brother',    desc: "Classic and bold jewellery for your favourite person",         icon: '🏅', img: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=1400&auto=format&fit=crop&q=85' },
  son:        { label: 'For Son',        desc: "Mark life's milestones with something he'll keep forever",     icon: '⭐', img: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=1400&auto=format&fit=crop&q=85' },
  daughter:   { label: 'For Daughter',   desc: "Beautiful pieces for the light of your life",                  icon: '🌺', img: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=1400&auto=format&fit=crop&q=85' },
  friend:     { label: 'For Friend',     desc: "Because the best friendships deserve the finest gifts",        icon: '🎁', img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1400&auto=format&fit=crop&q=85' },
  all:        { label: 'Shop by Bond',   desc: "Gifts that go beyond jewellery — they carry your feeling",    icon: '💛', img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1400&auto=format&fit=crop&q=85' },
}

const IMG_FALLBACK = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80'

export default function BondShop() {
  const { bond } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const LIMIT = 12

  const meta = BOND_META[bond] || BOND_META.all

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: LIMIT, page })
      if (bond && bond !== 'all') params.set('tag', bond)
      const { data } = await api.get(`/products?${params}`)
      setProducts(prev => page === 1 ? (data.products || []) : [...prev, ...(data.products || [])])
      setTotal(data.total || 0)
    } catch { setProducts([]); setTotal(0) }
    finally { setLoading(false) }
  }, [bond, page])

  useEffect(() => { setPage(1) }, [bond])
  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => {
    if (user) api.get('/wishlist').then(r => setWishlist(r.data.map(w => w.productId))).catch(() => {})
  }, [user])

  const handleAddToCart = async (p) => {
    if (!user) { navigate('/login'); throw new Error('not_logged_in') }
    await addToCart(p.id)
    showToast(`${p.name} added to cart`)
  }

  const handleWishlist = async (p) => {
    if (!user) { navigate('/login'); return }
    await api.post('/wishlist/toggle', { productId: p.id })
    setWishlist(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])
    showToast(wishlist.includes(p.id) ? 'Removed from wishlist' : 'Added to wishlist')
  }

  const hasMore = products.length < total

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%', maxWidth: 1200, margin: '0 auto' }}>

      {/* Hero banner */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 4,
        height: 'clamp(180px, 30vw, 320px)', marginBottom: 40, background: '#111',
      }}>
        <img
          src={meta.img}
          alt={meta.label}
          loading="eager"
          crossOrigin="anonymous"
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .55, transition: 'opacity .4s' }}
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = IMG_FALLBACK }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(0,0,0,.75) 0%, rgba(0,0,0,.15) 70%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(24px,5%,56px)',
        }}>
          <div style={{ fontSize: 28, marginBottom: 8, lineHeight: 1 }}>{meta.icon}</div>
          <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold-light)', fontWeight: 600, marginBottom: 10 }}>
            Gift Guide
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,4vw,52px)', fontWeight: 600, color: '#fff', lineHeight: 1.1, marginBottom: 10 }}>
            {meta.label}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', maxWidth: 420, lineHeight: 1.6 }}>{meta.desc}</p>
        </div>
      </div>

      {/* Bond chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid var(--ink-10)' }}>
        {Object.entries(BOND_META).map(([key, val]) => (
          <button
            key={key}
            onClick={() => navigate(`/shop/bond/${key}`)}
            style={{
              padding: '8px 16px', borderRadius: 20, border: '1.5px solid',
              borderColor: bond === key ? 'var(--gold)' : 'var(--ink-10)',
              background: bond === key ? 'var(--gold)' : 'transparent',
              color: bond === key ? '#fff' : 'var(--ink-60)',
              fontSize: 12, fontWeight: 600, letterSpacing: '.04em',
              cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all .2s',
              whiteSpace: 'nowrap',
            }}
          >
            {val.icon} {val.label}
          </button>
        ))}
      </div>

      {/* Count */}
      {!loading && (
        <div style={{ fontSize: 12, color: 'var(--ink-40)', marginBottom: 20, letterSpacing: '.04em' }}>
          {total} {total === 1 ? 'item' : 'items'} found
        </div>
      )}

      {/* Grid */}
      {loading && page === 1 ? (
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>}
          title="No jewellery found for this bond"
          subtitle="Try another category or browse all our collections"
          action={<button className="btn-gold" onClick={() => navigate('/shop')}>Browse All</button>}
        />
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }} className="product-grid">
            {products.map(p => (
              <GridProductCard
                key={p.id} product={p}
                onPress={() => navigate(`/product/${p.id}`)}
                onAddToCart={() => handleAddToCart(p)}
                onBuyNow={() => handleAddToCart(p).then(() => navigate('/checkout')).catch(() => navigate('/checkout'))}
                onWishlist={() => handleWishlist(p)}
                wishlisted={wishlist.includes(p.id)}
              />
            ))}
          </div>
          {hasMore && (
            <div style={{ textAlign: 'center', marginTop: 48 }}>
              <button className="btn-outline" onClick={() => setPage(p => p + 1)} disabled={loading} style={{ minWidth: 180 }}>
                {loading ? 'Loading…' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

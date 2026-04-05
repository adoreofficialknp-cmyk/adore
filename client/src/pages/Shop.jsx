import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { GridProductCard, Spinner, SkeletonCard } from '../components/UI'

const CATS = ['All', 'Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Pendants']
const SORTS = [
  { label: 'Newest', value: 'createdAt' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
  { label: 'Rating', value: 'rating' },
]

export default function Shop() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [wishlist, setWishlist] = useState([])
  const [cat, setCat] = useState(searchParams.get('category') || 'All')
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const gender = searchParams.get('gender') || null
  const LIMIT = 12

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        limit: LIMIT,
        page,
        ...(cat !== 'All' && { category: cat }),
        ...(search && { search }),
        ...(gender && { gender }),
        sort: sort === 'price_asc' || sort === 'price_desc' ? 'price' : sort,
        order: sort === 'price_asc' ? 'asc' : 'desc'
      })
      const { data } = await api.get(`/products?${params}`)
      setProducts(prev => page === 1 ? data.products : [...prev, ...data.products])
      setTotal(data.total)
    } finally { setLoading(false) }
  }, [cat, sort, search, page, gender])

  useEffect(() => { setPage(1) }, [cat, sort, search])
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

  const GENDER_BANNER = {
    Women: {
      img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1400&auto=format&fit=crop&q=85',
      label: 'For Her', sub: 'Rings, Necklaces, Earrings & more',
    },
    Men: {
      img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1400&auto=format&fit=crop&q=85',
      label: 'For Him', sub: 'Chains, Bracelets, Rings & more',
    },
  }
  const genderMeta = gender ? GENDER_BANNER[gender] : null

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%' }}>

      {/* Gender hero banner (only when filtered) */}
      {genderMeta && (
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: 4,
          height: 'clamp(160px, 25vw, 280px)', marginBottom: 36, background: '#111',
        }}>
          <img
            src={genderMeta.img} alt={genderMeta.label}
            loading="eager" crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .55 }}
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1400&auto=format&fit=crop&q=80' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, rgba(0,0,0,.72) 0%, rgba(0,0,0,.1) 65%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: 'clamp(24px,5%,56px)',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold-light)', fontWeight: 600, marginBottom: 10 }}>Collection</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,4vw,52px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>
              {genderMeta.label}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', lineHeight: 1.5 }}>{genderMeta.sub}</p>
          </div>
        </div>
      )}

      {/* Page title (shown when no gender banner) */}
      {!genderMeta && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>
            {cat !== 'All' ? cat : 'All Collections'}
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1 }}>
            {cat === 'All' ? 'Shop Jewellery' : cat}
          </h1>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: 220 }}>
          <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="input-field" placeholder="Search jewellery…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 42 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SORTS.map(s => (
            <button key={s.value} onClick={() => setSort(s.value)} style={{
              padding: '8px 16px', borderRadius: 2, border: '1.5px solid',
              borderColor: sort === s.value ? 'var(--gold)' : 'var(--ink-10)',
              background: sort === s.value ? 'var(--gold)' : 'transparent',
              color: sort === s.value ? '#fff' : 'var(--ink-60)',
              fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all .2s',
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 32, overflowX: 'auto', paddingBottom: 4, borderBottom: '1px solid var(--ink-10)' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '10px 20px', borderRadius: 2, border: 'none',
            background: cat === c ? 'var(--ink)' : 'transparent',
            color: cat === c ? '#fff' : 'var(--ink-60)',
            fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
            cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Jost', sans-serif", transition: 'all .2s',
          }}>{c}</button>
        ))}
      </div>

      {!loading && (
        <div style={{ fontSize: 12, color: 'var(--ink-40)', marginBottom: 20, letterSpacing: '.04em' }}>
          {total} {total === 1 ? 'item' : 'items'} found
        </div>
      )}

      {loading && page === 1 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, marginBottom: 12 }}>No jewellery found</div>
          <div style={{ fontSize: 14, color: 'var(--ink-60)', marginBottom: 24 }}>Try a different category or search term</div>
          <button className="btn-gold" onClick={() => { setCat('All'); setSearch('') }}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
            {products.map(p => (
              <GridProductCard key={p.id} product={p}
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

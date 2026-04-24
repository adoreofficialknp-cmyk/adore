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
  const color = searchParams.get('color') || null
  const material = searchParams.get('material') || null
  const minPrice = searchParams.get('minPrice') || null
  const maxPrice = searchParams.get('maxPrice') || null
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
        ...(color && { color }),
        ...(material && { material }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
        sort: sort === 'price_asc' || sort === 'price_desc' ? 'price' : sort,
        order: sort === 'price_asc' ? 'asc' : 'desc'
      })
      const { data } = await api.get(`/products?${params}`)
      setProducts(prev => page === 1 ? data.products : [...prev, ...data.products])
      setTotal(data.total)
    } finally { setLoading(false) }
  }, [cat, sort, search, page, gender, color, material, minPrice, maxPrice])

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
    <div style={{ padding: 'clamp(16px,3vw,48px) clamp(12px,4%,5%)' }}>

      {/* Gender hero banner */}
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
            background: 'linear-gradient(to right, rgba(45,10,30,.82) 0%, rgba(0,0,0,.1) 65%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            padding: 'clamp(24px,5%,56px)',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F8BBD0', fontWeight: 600, marginBottom: 10 }}>Collection</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,4vw,52px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', lineHeight: 1.1, marginBottom: 8 }}>
              {genderMeta.label}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.65)', lineHeight: 1.5 }}>{genderMeta.sub}</p>
          </div>
        </div>
      )}

      {/* Page title */}
      {!genderMeta && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 600, marginBottom: 8 }}>
            {material ? `${material} Jewellery` : color ? `${color} Collection` : cat !== 'All' ? cat : 'All Collections'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(20px,2.5vw,32px)', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.1 }}>
              {material ? `${material} Jewellery` : color ? `Shop by ${color}` : cat === 'All' ? 'Shop Jewellery' : cat}
            </h1>
            {color && (
              <button onClick={() => navigate('/shop')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#FFF0F5', border: '1px solid #F48FB1', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#C2185B', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                {color} ×
              </button>
            )}
            {material && (
              <button onClick={() => navigate('/shop')} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#FFF0F5', border: '1px solid #F48FB1', borderRadius: 20, fontSize: 12, fontWeight: 600, color: '#C2185B', cursor: 'pointer', fontFamily: "'Jost',sans-serif" }}>
                {material} ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Search + sort */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 160 }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-40)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input className="input-field" placeholder="Search jewellery…" value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34, paddingTop: 9, paddingBottom: 9, fontSize: 13 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', overflowX: 'auto' }}>
          {SORTS.map(s => (
            <button key={s.value} onClick={() => setSort(s.value)} style={{
              padding: '7px 10px', borderRadius: 2, border: '1.5px solid',
              borderColor: sort === s.value ? '#D4A96A' : 'var(--ink-10)',
              background: sort === s.value ? '#D4A96A' : 'transparent',
              color: sort === s.value ? '#4A2C0A' : 'var(--ink-60)',
              fontSize: 10, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase',
              cursor: 'pointer', fontFamily: "'Jost', sans-serif", transition: 'all .2s',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>{s.label}</button>
          ))}
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 4, borderBottom: '1px solid var(--ink-10)', scrollbarWidth: 'none' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '7px 13px', borderRadius: 2, border: 'none',
            background: cat === c ? '#D4A96A' : 'transparent',
            color: cat === c ? '#4A2C0A' : 'var(--ink-60)',
            fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, marginBottom: 12 }}>No jewellery found</div>
          <div style={{ fontSize: 14, color: 'var(--ink-60)', marginBottom: 24 }}>Try a different category or search term</div>
          <button className="btn-pink" onClick={() => { setCat('All'); setSearch('') }}>Clear Filters</button>
        </div>
      ) : (
        <>
          <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
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

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Stars, Spinner, Icons, GridProductCard } from '../components/UI'

const fmt = n => `₹${Number(n).toLocaleString('en-IN')}`

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

  useEffect(() => {
    setLoading(true)
    setMainImg(0)
    setSimilar([])
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data)
      setLoading(false)
      // Fetch similar products by same category
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

  return (
    <div>
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
            <div style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', background: '#f5f5f3', aspectRatio: '1', marginBottom: 12 }}>
              <img
                src={product.images?.[mainImg] || product.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80'}
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
              <button
                onClick={handleWishlist}
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
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
                {product.images.map((img, i) => (
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
                    <img src={img} alt="" loading="lazy" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&auto=format&fit=crop&q=80' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
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
              <p style={{ fontSize: 14, color: 'var(--ink-60)', lineHeight: 1.8, marginBottom: 24 }}>{product.description}</p>
            )}

            {/* Size selector */}
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
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      style={{
                        width: 44, height: 44, borderRadius: 3, border: '1.5px solid',
                        borderColor: size === s ? 'var(--gold)' : 'var(--ink-10)',
                        background: size === s ? 'var(--gold)' : '#fff',
                        color: size === s ? '#fff' : 'var(--ink)',
                        fontSize: 13, fontWeight: 700, cursor: 'pointer',
                        fontFamily: "'Jost',sans-serif", transition: 'all .2s',
                      }}
                    >{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
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

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
              <button
                className="btn-dark"
                style={{ flex: 1, opacity: (isOOS || adding) ? .5 : 1 }}
                disabled={isOOS || adding}
                onClick={handleAddToCart}
              >
                {adding ? 'Adding…' : isOOS ? 'Out of Stock' : '+ Add to Cart'}
              </button>
              <button
                className="btn-gold"
                style={{ flex: 1, opacity: (isOOS || adding) ? .5 : 1 }}
                disabled={isOOS || adding}
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '20px', background: 'var(--gold-bg)', borderRadius: 3, marginBottom: 28 }}>
              {[
                { icon: '✓', text: 'BIS Hallmarked & IGI Certified' },
                { icon: '✓', text: 'Free Shipping above ₹2,999' },
                { icon: '✓', text: '30-Day Easy Returns' },
                { icon: '✓', text: 'Secure Payment Gateway' },
              ].map(t => (
                <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--gold)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{t.icon}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-60)', lineHeight: 1.4 }}>{t.text}</span>
                </div>
              ))}
            </div>

            {/* Reviews */}
            {product.reviews?.length > 0 && (
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'Cormorant Garamond',serif", marginBottom: 16, borderTop: '1px solid var(--ink-10)', paddingTop: 24 }}>
                  Reviews ({product.reviewCount})
                </div>
                {product.reviews.slice(0, 5).map(r => (
                  <div key={r.id} style={{ padding: '16px 0', borderBottom: '1px solid var(--ink-5)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>
                          {r.user.name[0]}
                        </div>
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

      {/* ── Similar Products ─────────────────────────────────────────────── */}
      {similar.length > 0 && (
        <section style={{ padding: 'clamp(32px,5vw,56px) 5%', background: 'var(--gold-bg)', borderTop: '1px solid var(--gold-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 6 }}>You May Also Like</div>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,3vw,32px)', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
                More {product.category}
              </h2>
            </div>
            <button
              onClick={() => navigate(`/shop?category=${product.category}`)}
              style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-60)', fontFamily: "'Jost',sans-serif" }}
            >
              View all {Icons.chevRight}
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20 }}>
            {similar.map(p => (
              <GridProductCard
                key={p.id}
                product={p}
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

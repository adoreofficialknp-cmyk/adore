import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { EmptyState, Spinner, Icons } from '../components/UI'

const fmt = n => `₹${Number(n)?.toLocaleString('en-IN') || 0}`

export default function Wishlist() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { showToast } = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/wishlist').then(r => setItems(r.data)).finally(() => setLoading(false))
  }, [])

  const handleRemove = async (productId) => {
    await api.post('/wishlist/toggle', { productId })
    setItems(prev => prev.filter(i => i.productId !== productId))
    showToast('Removed from wishlist')
  }

  const handleAddToCart = async (item) => {
    await addToCart(item.productId)
    showToast(`${item.product.name} added to cart`)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Spinner size={40} />
    </div>
  )

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%' }}>
      <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Saved Items</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 36, lineHeight: 1.1 }}>
        Wishlist {items.length > 0 && <span style={{ fontSize: '0.6em', color: 'var(--ink-40)' }}>({items.length})</span>}
      </h1>

      {items.length === 0 ? (
        <EmptyState
          icon={Icons.heart(false)}
          title="Your wishlist is empty"
          subtitle="Save your favourite pieces here"
          action={<button className="btn-gold" onClick={() => navigate('/shop')}>Explore Jewellery</button>}
        />
      ) : (
        <div className="product-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {items.map(({ productId, product }) => (
            <div key={productId}>
              <div
                onClick={() => navigate(`/product/${productId}`)}
                style={{ position: 'relative', aspectRatio: '.88', borderRadius: 3, overflow: 'hidden', background: '#f5f5f3', marginBottom: 12, cursor: 'pointer' }}
              >
                <img
                  src={product.images?.[0]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s' }}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80' }}
                  onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                />
                <button
                  onClick={e => { e.stopPropagation(); handleRemove(productId) }}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'rgba(255,255,255,.95)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#e53935', boxShadow: '0 2px 8px rgba(0,0,0,.12)',
                  }}
                >
                  {Icons.heart(true)}
                </button>
              </div>
              <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 4 }}>{product.category}</div>
              <div
                onClick={() => navigate(`/product/${productId}`)}
                style={{ fontSize: 14, fontWeight: 500, marginBottom: 6, cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >{product.name}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{fmt(product.price)}</div>
              <button
                className={product.stock === 0 ? 'btn-outline' : 'btn-dark'}
                disabled={product.stock === 0}
                style={{ width: '100%', padding: '10px 0', opacity: product.stock === 0 ? .5 : 1 }}
                onClick={() => handleAddToCart({ productId, product })}
              >
                {product.stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

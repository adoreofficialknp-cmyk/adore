// ── Spinner ────────────────────────────────────────────────────────────────
export function Spinner({ size = 24, color = '#C2185B' }) {
  return (
    <svg className="spinner" width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.5" strokeOpacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

// ── Icon set ────────────────────────────────────────────────────────────────
export const Icons = {
  back: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
  heart: (filled) => <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  cart: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  share: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  star: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  chevRight: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
  minus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  trash: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
}

// ── TopBar ─────────────────────────────────────────────────────────────────
export function TopBar({ title, onBack, right }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px', height: 56,
      borderBottom: '1px solid rgba(28,28,30,.08)',
      background: '#fff', flexShrink: 0,
    }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--ink)', fontSize: 14, fontWeight: 600,
          fontFamily: "'Jost', sans-serif", padding: '4px 0',
        }}
      >
        {Icons.back}
        {title}
      </button>
      {right && <div>{right}</div>}
    </div>
  )
}

// ── Section Header ─────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, onViewAll, centered }) {
  return (
    <div style={{
      display: 'flex', alignItems: centered ? 'center' : 'flex-end',
      justifyContent: centered ? 'center' : 'space-between',
      marginBottom: 32, flexDirection: centered ? 'column' : 'row',
      gap: centered ? 8 : 0, textAlign: centered ? 'center' : 'left',
    }}>
      <div>
        {subtitle && (
          <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 600, marginBottom: 8 }}>{subtitle}</div>
        )}
        <h2 className="section-title">{title}</h2>
      </div>
      {onViewAll && !centered && (
        <button
          onClick={onViewAll}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase',
            fontWeight: 700, color: 'var(--ink-60)',
            fontFamily: "'Jost', sans-serif", padding: '4px 0',
            whiteSpace: 'nowrap',
          }}
        >
          View all {Icons.chevRight}
        </button>
      )}
    </div>
  )
}

// ── Product Card (horizontal scroll) ───────────────────────────────────────
export function ProductCard({ product, onPress, onAddToCart, onWishlist, wishlisted }) {
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`
  const isNew = product.tags?.includes('new')
  const isBest = product.tags?.includes('bestseller')
  const isOOS = product.stock === 0
  const isLow = product.stock > 0 && product.stock <= 3
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0

  return (
    <div onClick={onPress} style={{ cursor: 'pointer', flexShrink: 0, width: 170 }}>
      <div style={{
        position: 'relative', width: 170, height: 190,
        borderRadius: 3, overflow: 'hidden',
        background: '#f5f5f3', marginBottom: 12,
      }}>
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80'}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s ease' }}
          loading="lazy"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        {discount > 0 && <span className="badge-off" style={{ position: 'absolute', top: 10, left: 10 }}>{discount}% OFF</span>}
        {isNew && !discount && <span className="badge-new" style={{ position: 'absolute', top: 10, left: 10 }}>New</span>}
        {isBest && !isNew && !discount && <span className="badge-off" style={{ position: 'absolute', top: 10, left: 10 }}>Best</span>}
        {isOOS && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--ink-60)' }}>OUT OF STOCK</span></div>}
        <button
          onClick={e => { e.stopPropagation(); onWishlist?.() }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: wishlisted ? '#e53935' : 'rgba(28,28,30,.5)',
            boxShadow: '0 2px 8px rgba(0,0,0,.12)',
          }}
        >
          {Icons.heart(wishlisted)}
        </button>
      </div>
      <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 4 }}>{product.category}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{fmt(product.price)}</span>
        {product.originalPrice && <span style={{ fontSize: 12, color: 'var(--ink-40)', textDecoration: 'line-through' }}>{fmt(product.originalPrice)}</span>}
      </div>
      <button
        disabled={isOOS}
        onClick={e => { e.stopPropagation(); !isOOS && onAddToCart?.() }}
        style={{
          width: '100%', padding: '9px 0',
          border: '1.5px solid rgba(28,28,30,.14)',
          background: 'none', cursor: isOOS ? 'not-allowed' : 'pointer',
          fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
          color: isOOS ? 'var(--ink-40)' : 'var(--ink)',
          fontFamily: "'Jost', sans-serif",
          borderRadius: 2, transition: 'all .2s',
        }}
        onMouseEnter={e => { if (!isOOS) { e.target.style.background = 'var(--ink)'; e.target.style.color = '#fff'; e.target.style.borderColor = 'var(--ink)' }}}
        onMouseLeave={e => { e.target.style.background = 'none'; e.target.style.color = isOOS ? 'var(--ink-40)' : 'var(--ink)'; e.target.style.borderColor = 'rgba(28,28,30,.14)' }}
      >
        {isOOS ? 'Out of Stock' : isLow ? `Only ${product.stock} left` : '+ Add to Cart'}
      </button>
    </div>
  )
}

// ── Grid Product Card ──────────────────────────────────────────────────────
// Fixed: uses fixed height image box instead of aspect-ratio to prevent overlap in 2-col grid
export function GridProductCard({ product, onPress, onAddToCart, onBuyNow, onWishlist, wishlisted }) {
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`
  const isOOS = product.stock === 0
  const isLow = product.stock > 0 && product.stock <= 3
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0
  const isNew = product.tags?.includes('new')

  return (
    <div onClick={onPress} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
      {/* Image box — fixed aspect ratio prevents overlap */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1.1', borderRadius: 3, overflow: 'hidden', background: '#f5f5f3', marginBottom: 8, flexShrink: 0 }}>
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'}
          alt={product.name}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s ease' }}
          loading="lazy"
          onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80' }}
          onMouseEnter={e => e.target.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.target.style.transform = 'scale(1)'}
        />
        {discount > 0 && <span className="badge-off" style={{ position: 'absolute', top: 6, left: 6 }}>{discount}% OFF</span>}
        {isNew && !discount && <span className="badge-new" style={{ position: 'absolute', top: 6, left: 6 }}>New</span>}
        {isLow && !isOOS && <span style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(180,70,0,.9)', color: '#fff', fontSize: 9, fontWeight: 700, padding: '3px 7px', borderRadius: 1, letterSpacing: '.08em' }}>Only {product.stock} left</span>}
        {isOOS && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', color: 'var(--ink-60)' }}>OUT OF STOCK</span></div>}
        <button
          onClick={e => { e.stopPropagation(); onWishlist?.() }}
          style={{
            position: 'absolute', top: 6, right: 6,
            width: 30, height: 30, borderRadius: '50%',
            background: 'rgba(255,255,255,.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: wishlisted ? '#e53935' : 'rgba(28,28,30,.5)',
            boxShadow: '0 2px 8px rgba(0,0,0,.12)',
          }}
        >
          {Icons.heart(wishlisted)}
        </button>
      </div>
      {/* Text info — truncate names to prevent height blowout */}
      <div style={{ fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 2 }}>{product.category}</div>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--ink)', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
      <Stars rating={product.rating} count={product.reviewCount} style={{ marginBottom: 5 }} />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{fmt(product.price)}</span>
        {product.originalPrice && <span style={{ fontSize: 10, color: 'var(--ink-40)', textDecoration: 'line-through' }}>{fmt(product.originalPrice)}</span>}
      </div>
      <div style={{ display: 'flex', gap: 5, marginTop: 'auto' }}>
        <button
          disabled={isOOS}
          onClick={e => { e.stopPropagation(); !isOOS && onAddToCart?.() }}
          style={{
            flex: 1, padding: '8px 0',
            border: '1.5px solid rgba(28,28,30,.12)',
            background: 'none', cursor: isOOS ? 'not-allowed' : 'pointer',
            fontSize: 9, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
            color: isOOS ? 'var(--ink-40)' : 'var(--ink)',
            fontFamily: "'Jost', sans-serif", borderRadius: 2, transition: 'all .2s',
          }}
          onMouseEnter={e => { if (!isOOS) { e.currentTarget.style.background = 'var(--ink)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--ink)' }}}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = isOOS ? 'var(--ink-40)' : 'var(--ink)'; e.currentTarget.style.borderColor = 'rgba(28,28,30,.12)' }}
        >
          {isOOS ? 'Out of Stock' : '+ Cart'}
        </button>
        {!isOOS && (
          <button
            onClick={e => { e.stopPropagation(); onBuyNow?.() }}
            style={{
              flex: 1, padding: '8px 0',
              border: '1.5px solid var(--pink-border, #F48FB1)',
              background: 'var(--pink-pale, #FCE4EC)', cursor: 'pointer',
              fontSize: 9, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase',
              color: 'var(--pink, #C2185B)', fontFamily: "'Jost', sans-serif", borderRadius: 2, transition: 'all .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--pink, #C2185B)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--pink, #C2185B)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--pink-pale, #FCE4EC)'; e.currentTarget.style.color = 'var(--pink, #C2185B)'; e.currentTarget.style.borderColor = 'var(--pink-border, #F48FB1)' }}
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  )
}

// ── Stars ──────────────────────────────────────────────────────────────────
export function Stars({ rating = 0, count, style: sx }) {
  const r = Math.round(rating)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, ...sx }}>
      <div style={{ display: 'flex', gap: 1 }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} style={{ color: i < r ? '#C2185B' : 'rgba(28,28,30,.18)', display: 'flex' }}>
            {Icons.star}
          </span>
        ))}
      </div>
      {count !== undefined && <span style={{ fontSize: 11, color: 'var(--ink-40)' }}>({count})</span>}
    </div>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', flex: 1, padding: '64px 24px',
      textAlign: 'center', gap: 16,
    }}>
      <div style={{ color: 'var(--ink-20)', marginBottom: 8 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 600, marginBottom: 8 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 14, color: 'var(--ink-60)', lineHeight: 1.6 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  )
}

// ── Skeleton Card ──────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div>
      <div className="skeleton" style={{ width: '100%', paddingBottom: '110%', position: 'relative', borderRadius: 3, marginBottom: 10 }}>
        <div style={{ position: 'absolute', inset: 0 }} />
      </div>
      <div className="skeleton" style={{ height: 10, width: '40%', marginBottom: 6, borderRadius: 2 }} />
      <div className="skeleton" style={{ height: 13, width: '80%', marginBottom: 6, borderRadius: 2 }} />
      <div className="skeleton" style={{ height: 16, width: '50%', marginBottom: 10, borderRadius: 2 }} />
      <div className="skeleton" style={{ height: 36, width: '100%', borderRadius: 2 }} />
    </div>
  )
}

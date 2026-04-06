import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'


// ── SVG Icon set ─────────────────────────────────────────────
const IC = {
  home: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  shop: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.81L23 6H6"/></svg>,
  heart: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  bag: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  user: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  search: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  menu: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  close: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevRight: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>,
}

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'Shop', path: '/shop' },
  { label: 'Rings', path: '/shop?category=Rings' },
  { label: 'Necklaces', path: '/shop?category=Necklaces' },
  { label: 'Earrings', path: '/shop?category=Earrings' },
  { label: 'Shop by Bond', path: '/shop/bond/all' },
  { label: 'Custom Jewellery', path: '/custom-jewellery', gold: true },
]

const BOTTOM_NAV = [
  { icon: IC.home, label: 'Home', path: '/' },
  { icon: IC.shop, label: 'Shop', path: '/shop' },
  { icon: IC.bag, label: 'Cart', path: '/cart', badge: true },
  { icon: IC.heart, label: 'Saved', path: '/wishlist' },
  { icon: IC.user, label: 'Profile', path: '/profile' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { itemCount } = useCart()
  const { user, logout } = useAuth()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isAdmin = location.pathname.startsWith('/admin')
  const hideLayout = ['/login'].some(p => location.pathname.startsWith(p))
  const hideBottomNav = ['/checkout', '/order/success', '/login'].some(p => location.pathname.startsWith(p))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path.split('?')[0])

  if (hideLayout) return <>{children}</>

  return (
    <div className="min-h-screen flex flex-col" style={{ overflowX: 'hidden' }}>
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: '#fff',
          borderBottom: scrolled ? '1px solid rgba(28,28,30,.1)' : '1px solid rgba(28,28,30,.08)',
          boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,.06)' : 'none',
        }}
      >
        {/* Top strip */}
        <div style={{ background: 'var(--gold)', padding: '7px 0' }}>
          <p style={{ textAlign: 'center', fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: '#fff', fontWeight: 500, margin: 0 }}>
            Free shipping above ₹2,999 · Use <strong>ADORE10</strong> for 10% off
          </p>
        </div>

        {/* Main nav row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 5%', height: 64 }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', padding: 4, display: 'none' }}
            className="md-hide"
            aria-label="Menu"
          >
            {IC.menu}
          </button>

          {/* Logo */}
          <Link
            to="/"
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, letterSpacing: '.12em', color: 'var(--ink)', textDecoration: 'none', lineHeight: 1 }}
          >
            AD<span style={{ color: 'var(--gold)' }}>ORE</span>
          </Link>

          {/* Desktop nav links */}
          <nav style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="desk-nav">
            {NAV_LINKS.map(l => (
              <Link
                key={l.path}
                to={l.path}
                style={{
                  fontSize: 12,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  color: l.gold ? 'var(--gold)' : isActive(l.path) ? 'var(--ink)' : 'var(--ink-60)',
                  textDecoration: 'none',
                  borderBottom: isActive(l.path) ? `1.5px solid ${l.gold ? 'var(--gold)' : 'var(--gold)'}` : '1.5px solid transparent',
                  paddingBottom: 2,
                  transition: 'color .2s, border-color .2s',
                  whiteSpace: 'nowrap',
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Action icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => navigate('/shop')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'flex', padding: 4 }} aria-label="Search">
              {IC.search}
            </button>
            <button onClick={() => navigate('/wishlist')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'flex', padding: 4 }} className="desk-only" aria-label="Wishlist">
              {IC.heart}
            </button>
            <button
              onClick={() => navigate('/cart')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'flex', padding: 4, position: 'relative' }}
              aria-label="Cart"
            >
              {IC.bag}
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: 0, right: 0,
                  background: 'var(--gold)', color: '#fff',
                  borderRadius: '50%', width: 16, height: 16,
                  fontSize: 9, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid #fff',
                }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>
            <button
              onClick={() => user ? navigate('/profile') : navigate('/login')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', display: 'flex', padding: 4 }}
              className="desk-only"
              aria-label="Profile"
            >
              {IC.user}
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <>
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200, backdropFilter: 'blur(2px)' }}
          />
          <div
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, width: 280,
              background: '#fff', zIndex: 201, display: 'flex', flexDirection: 'column',
              animation: 'slideInLeft .25s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid var(--ink-10)' }}>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, letterSpacing: '.1em' }}>
                AD<span style={{ color: 'var(--gold)' }}>ORE</span>
              </span>
              <button onClick={() => setDrawerOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink)', padding: 4 }}>{IC.close}</button>
            </div>
            <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {NAV_LINKS.map(l => (
                <Link
                  key={l.path}
                  to={l.path}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 20px',
                    fontSize: 14, fontWeight: 600, letterSpacing: '.06em',
                    color: l.gold ? 'var(--gold)' : isActive(l.path) ? 'var(--gold)' : 'var(--ink)',
                    textDecoration: 'none',
                    borderLeft: isActive(l.path) ? '3px solid var(--gold)' : '3px solid transparent',
                    background: isActive(l.path) ? 'var(--gold-bg)' : l.gold ? 'rgba(184,151,90,.04)' : 'transparent',
                  }}
                >
                  {l.label}
                  {IC.chevRight}
                </Link>
              ))}
              <div style={{ margin: '16px 20px', height: 1, background: 'var(--ink-10)' }} />
              {user ? (
                <>
                  <Link to="/orders" style={{ display: 'flex', padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>My Orders</Link>
                  <Link to="/profile" style={{ display: 'flex', padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'var(--ink)', textDecoration: 'none' }}>Profile</Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" style={{ display: 'flex', padding: '14px 20px', fontSize: 14, fontWeight: 600, color: 'var(--gold)', textDecoration: 'none' }}>Admin Panel</Link>
                  )}
                  <button onClick={logout} style={{ display: 'flex', width: '100%', textAlign: 'left', padding: '14px 20px', fontSize: 14, fontWeight: 600, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
                </>
              ) : (
                <Link to="/login" style={{ display: 'flex', margin: '16px 20px 8px', padding: '13px 24px', background: 'var(--ink)', color: '#fff', textDecoration: 'none', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', justifyContent: 'center', borderRadius: 2 }}>
                  Sign In / Register
                </Link>
              )}
            </nav>
          </div>
        </>
      )}

      {/* ── Page content ── */}
      <main style={{ flex: 1, width: '100%', maxWidth: '100vw', overflowX: 'hidden' }} className={!hideBottomNav ? 'has-bottom-nav' : ''}>
        {children}
      </main>

      {/* ── Footer ── */}
      {!isAdmin && (
        <footer style={{ background: '#111', color: 'rgba(255,255,255,.7)' }} className={!hideBottomNav ? 'footer-has-bottom-nav' : ''}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 5% 40px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32 }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, letterSpacing: '.12em', color: '#fff', marginBottom: 12 }}>
                AD<span style={{ color: 'var(--gold)' }}>ORE</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'rgba(255,255,255,.5)', maxWidth: 220, marginBottom: 20 }}>
                Fine jewellery crafted with love. BIS Hallmarked gold & certified diamonds.
              </p>
              <Link to="/custom-jewellery" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gold)', textDecoration: 'none', border: '1px solid rgba(184,151,90,.3)', padding: '8px 14px', borderRadius: 2, transition: 'all .2s' }}>
                ✨ Custom Jewellery
              </Link>
            </div>
            {[
              {
                title: 'Shop',
                links: [
                  { label: 'Rings', path: '/shop?category=Rings' },
                  { label: 'Necklaces', path: '/shop?category=Necklaces' },
                  { label: 'Earrings', path: '/shop?category=Earrings' },
                  { label: 'Bracelets', path: '/shop?category=Bracelets' },
                  { label: 'Shop by Bond', path: '/shop/bond/all' },
                ]
              },
              {
                title: 'Help',
                links: [
                  { label: 'Help & Support', path: '/help' },
                  { label: 'Track Order', path: '/orders' },
                  { label: 'Returns Policy', path: '/help' },
                  { label: 'Ring Sizer', path: '/profile' },
                  { label: 'Notifications', path: '/notifications' },
                ]
              },
              {
                title: 'Company',
                links: [
                  { label: 'Privacy Policy', path: '/privacy' },
                  { label: 'Custom Jewellery', path: '/custom-jewellery' },
                  { label: 'Contact Us', path: '/help' },
                ]
              },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: 11, letterSpacing: '.15em', textTransform: 'uppercase', fontWeight: 700, color: '#fff', marginBottom: 16 }}>{col.title}</div>
                {col.links.map(l => (
                  <Link
                    key={l.label}
                    to={l.path}
                    style={{ display: 'block', fontSize: 13, padding: '5px 0', color: 'rgba(255,255,255,.5)', textDecoration: 'none', transition: 'color .2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.8)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.5)'}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', padding: '20px 5%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', margin: 0 }}>© 2025 ADORE Fine Jewellery. All rights reserved.</p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <Link to="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.7)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.35)'}>Privacy Policy</Link>
              <Link to="/help" style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', textDecoration: 'none', transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,.7)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,.35)'}>Terms & Help</Link>
            </div>
          </div>
        </footer>
      )}

      {/* ── Bottom nav (mobile only) ── */}
      {!hideBottomNav && !isAdmin && (
        <nav
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0,
            background: '#fff',
            borderTop: '1px solid rgba(28,28,30,.1)',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 0 16px',
            zIndex: 100,
            boxShadow: '0 -4px 20px rgba(0,0,0,.06)',
          }}
          className="mobile-bottom-nav"
        >
          {BOTTOM_NAV.map(item => {
            const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
            const dest = (item.path === '/wishlist' || item.path === '/cart' || item.path === '/profile') && !user ? '/login' : item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(dest)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: active ? 'var(--gold)' : 'rgba(28,28,30,.35)',
                  padding: '2px 12px',
                  position: 'relative',
                }}
              >
                <span style={{ display: 'flex', position: 'relative' }}>
                  {item.icon}
                  {item.badge && itemCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      background: 'var(--gold)', color: '#fff',
                      borderRadius: '50%', width: 16, height: 16,
                      fontSize: 9, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid #fff',
                    }}>
                      {itemCount > 9 ? '9+' : itemCount}
                    </span>
                  )}
                </span>
                <span style={{ fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700 }}>{item.label}</span>
                {active && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--gold)' }} />}
              </button>
            )
          })}
        </nav>
      )}

      {/* ── Toast ── */}

      <style>{`
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .desk-nav { display: flex; }
        .desk-only { display: flex; }
        .md-hide { display: none; }
        @media (max-width: 768px) {
          .desk-nav { display: none !important; }
          .desk-only { display: none !important; }
          .md-hide { display: flex !important; }
          .has-bottom-nav { padding-bottom: 72px; }
          .footer-has-bottom-nav { padding-bottom: 80px; }
        }
        @media (min-width: 769px) {
          .mobile-bottom-nav { display: none !important; }
        }
      `}</style>
    </div>
  )
}

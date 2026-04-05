import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/UI'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()
  const { showToast } = useToast()
  const [tab, setTab] = useState('login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const from = location.state?.from || '/'

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.email || !form.password) { showToast('Please fill all required fields'); return }
    if (tab === 'register' && !form.name) { showToast('Name is required'); return }
    setLoading(true)
    try {
      if (tab === 'login') {
        const user = await login(form.email, form.password)
        showToast(`Welcome back, ${user.name}!`)
        // ── Admin redirect fix ──
        navigate(user.role === 'ADMIN' ? '/admin' : from, { replace: true })
      } else {
        await register(form.name, form.email, form.password, form.phone)
        showToast('Account created! Welcome to ADORE.')
        navigate(from, { replace: true })
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr', background: '#fff' }}>
      {/* Two-column on desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', minHeight: '100vh' }}>

        {/* Left — branding panel */}
        <div style={{
          background: 'linear-gradient(160deg, #1C1C1E 0%, #2C2018 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: 'clamp(40px, 6vw, 80px)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(184,151,90,.06)' }} />
          <div style={{ position: 'absolute', bottom: -80, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(184,151,90,.04)' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Link to="/" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 36, fontWeight: 700, letterSpacing: '.12em', color: '#fff', textDecoration: 'none', display: 'block', marginBottom: 8 }}>
              AD<span style={{ color: 'var(--gold)' }}>ORE</span>
            </Link>
            <div style={{ fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 48 }}>Fine Jewellery · Est. 2024</div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 3.5vw, 44px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', lineHeight: 1.2, marginBottom: 20 }}>
              Jewellery that<br />tells your story
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.45)', lineHeight: 1.8, maxWidth: 320 }}>
              BIS Hallmarked gold. IGI certified diamonds. Crafted for every milestone of your life.
            </p>
            {/* Trust badges */}
            <div style={{ display: 'flex', gap: 16, marginTop: 40, flexWrap: 'wrap' }}>
              {['BIS Hallmarked', 'IGI Certified', 'Free Returns'].map(b => (
                <div key={b} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 11, color: 'var(--gold-light)', fontWeight: 600, letterSpacing: '.06em',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {b}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form panel */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 'clamp(32px, 5vw, 64px)', background: '#fff' }}>
          <div style={{ maxWidth: 400, width: '100%', margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>
              {tab === 'login' ? 'Welcome back' : 'Create account'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 32 }}>
              {tab === 'login' ? 'Sign in to your ADORE account' : 'Join ADORE and get ₹500 off your first order'}
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--ink-10)', marginBottom: 28, gap: 0 }}>
              {[{ id: 'login', label: 'Sign In' }, { id: 'register', label: 'Register' }].map(t => (
                <button
                  key={t.id} onClick={() => setTab(t.id)}
                  style={{
                    padding: '10px 24px', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: 700, letterSpacing: '.06em',
                    color: tab === t.id ? 'var(--ink)' : 'var(--ink-40)',
                    borderBottom: tab === t.id ? '2px solid var(--gold)' : '2px solid transparent',
                    marginBottom: -1, fontFamily: "'Jost', sans-serif",
                    transition: 'color .2s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tab === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Full Name *</label>
                  <input className="input-field" placeholder="Your full name" value={form.name} onChange={set('name')} autoComplete="name" />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Email *</label>
                <input className="input-field" type="email" placeholder="your@email.com" value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input-field" type={showPass ? 'text' : 'password'}
                    placeholder="••••••••" value={form.password} onChange={set('password')}
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    style={{ paddingRight: 44 }}
                  />
                  <button
                    type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-40)', display: 'flex' }}
                  >
                    {showPass ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              {tab === 'register' && (
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Phone (optional)</label>
                  <input className="input-field" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
                </div>
              )}

              <button type="submit" className="btn-gold" style={{ width: '100%', padding: '15px', fontSize: 13, marginTop: 8 }} disabled={loading}>
                {loading ? <><Spinner size={16} color="#fff" /> {tab === 'login' ? 'Signing in...' : 'Creating account...'}</> : tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>

              <button type="button" onClick={() => navigate('/')} style={{ width: '100%', padding: '14px', background: 'none', border: '1.5px solid var(--ink-10)', cursor: 'pointer', fontSize: 13, color: 'var(--ink-60)', borderRadius: 2, fontFamily: "'Jost', sans-serif" }}>
                Continue as Guest →
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

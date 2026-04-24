import { useState, useEffect } from 'react'
import { AdminNav } from './Dashboard'
import api from '../../utils/api'
import { Spinner } from '../../components/UI'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

function StatCard({ label, value, sub, icon, color = 'var(--gold)' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--ink-10)', padding: '22px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
        {sub && <span style={{ fontSize: 11, fontWeight: 700, color: sub.startsWith('+') ? '#2e7d32' : '#c0392b', background: sub.startsWith('+') ? '#e8f5e9' : '#ffebee', padding: '3px 8px', borderRadius: 10 }}>{sub}</span>}
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>{label}</div>
    </div>
  )
}

const MOCK_PAGES = [
  { page: '/shop', views: 4821, uniq: 3210, avg: '2m 14s' },
  { page: '/', views: 3944, uniq: 3102, avg: '1m 42s' },
  { page: '/product/:id', views: 2890, uniq: 2014, avg: '3m 05s' },
  { page: '/cart', views: 1203, uniq: 989, avg: '1m 22s' },
  { page: '/checkout', views: 876, uniq: 712, avg: '4m 51s' },
  { page: '/profile', views: 640, uniq: 530, avg: '1m 08s' },
  { page: '/custom-jewellery', views: 448, uniq: 380, avg: '5m 20s' },
]

const MOCK_LOCATIONS = [
  { city: 'Mumbai', sessions: 2840, pct: 28 },
  { city: 'Delhi', sessions: 2210, pct: 22 },
  { city: 'Bangalore', sessions: 1640, pct: 16 },
  { city: 'Hyderabad', sessions: 1020, pct: 10 },
  { city: 'Chennai', sessions: 810, pct: 8 },
  { city: 'Pune', sessions: 640, pct: 6 },
  { city: 'Others', sessions: 1040, pct: 10 },
]

const MOCK_REVENUE_DAYS = [
  { day: 'Mon', rev: 48000 }, { day: 'Tue', rev: 62000 }, { day: 'Wed', rev: 41000 },
  { day: 'Thu', rev: 78000 }, { day: 'Fri', rev: 95000 }, { day: 'Sat', rev: 112000 }, { day: 'Sun', rev: 83000 }
]

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [gaId, setGaId] = useState(localStorage.getItem('ga_id') || '')
  const [gaConnected, setGaConnected] = useState(!!localStorage.getItem('ga_id'))
  const maxRev = Math.max(...MOCK_REVENUE_DAYS.map(d => d.rev))

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  const connectGA = () => {
    if (!gaId.trim()) return
    localStorage.setItem('ga_id', gaId)
    setGaConnected(true)
    // In production: inject GA script with this ID
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/analytics" />
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={40} /></div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/analytics" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5% 60px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Admin</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 32 }}>Analytics & Insights</h1>

        {/* GA Setup */}
        <div style={{ background: gaConnected ? '#e8f5e9' : 'var(--gold-bg)', border: `1px solid ${gaConnected ? '#a5d6a7' : 'var(--gold-border)'}`, borderRadius: 4, padding: '18px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: gaConnected ? '#2e7d32' : 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {gaConnected ? '✓' : '📊'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{gaConnected ? `Google Analytics Connected (${gaId})` : 'Connect Google Analytics'}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-60)' }}>{gaConnected ? 'Real-time tracking active' : 'Enter your GA4 Measurement ID to enable real-time analytics'}</div>
            </div>
          </div>
          {!gaConnected ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                className="input-field"
                placeholder="G-XXXXXXXXXX"
                value={gaId}
                onChange={e => setGaId(e.target.value)}
                style={{ width: 180 }}
              />
              <button className="btn-gold" onClick={connectGA}>Connect</button>
            </div>
          ) : (
            <button className="btn-outline" style={{ fontSize: 11 }} onClick={() => { localStorage.removeItem('ga_id'); setGaConnected(false); setGaId('') }}>Disconnect</button>
          )}
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard label="Total Sessions" value="10,204" sub="+18%" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>} />
          <StatCard label="Unique Visitors" value="7,841" sub="+12%" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>} />
          <StatCard label="Revenue (30d)" value={fmt(stats?.totalRevenue)} sub="+8%" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>} />
          <StatCard label="Conversion Rate" value="3.2%" sub="+0.4%" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>} />
          <StatCard label="Avg Session" value="2m 38s" sub="+14s" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} color="#1565c0" />
          <StatCard label="Bounce Rate" value="42%" sub="-3%" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} color="#c0392b" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Revenue Chart */}
          <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>Revenue This Week</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }}>
              {MOCK_REVENUE_DAYS.map(d => (
                <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ fontSize: 9, color: 'var(--ink-40)', fontWeight: 600 }}>₹{(d.rev/1000).toFixed(0)}k</div>
                  <div style={{ width: '100%', background: 'var(--gold)', borderRadius: '3px 3px 0 0', height: `${(d.rev / maxRev) * 100}px`, transition: 'height .4s ease', opacity: .85 + (d.rev / maxRev) * .15 }} />
                  <div style={{ fontSize: 10, color: 'var(--ink-40)', fontWeight: 600 }}>{d.day}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Locations */}
          <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 20 }}>Top Locations</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOCK_LOCATIONS.map(l => (
                <div key={l.city}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600 }}>{l.city}</span>
                    <span style={{ color: 'var(--ink-60)' }}>{l.sessions.toLocaleString()} ({l.pct}%)</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--gold-bg)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${l.pct}%`, background: 'var(--gold)', borderRadius: 3, transition: 'width .6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--ink-10)', fontSize: 13, fontWeight: 700 }}>Pages Visited</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--ink-10)' }}>
                {['Page', 'Total Views', 'Unique Visitors', 'Avg Time'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_PAGES.map((p, i) => (
                <tr key={p.page} style={{ borderBottom: i < MOCK_PAGES.length - 1 ? '1px solid var(--ink-5)' : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>{p.page}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700 }}>{p.views.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-60)' }}>{p.uniq.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-60)' }}>{p.avg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!gaConnected && (
          <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-40)', textAlign: 'center', lineHeight: 1.6 }}>
            📊 Showing demo data. Connect Google Analytics above to see real session, location, and traffic data.
          </div>
        )}
      </div>
    </div>
  )
}

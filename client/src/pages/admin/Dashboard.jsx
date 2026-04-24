import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { Spinner } from '../../components/UI'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`

export function AdminNav({ active }) {
  const navigate = useNavigate()
  const tabs = [
    { label: 'Dashboard',  path: '/admin' },
    { label: 'Products',   path: '/admin/products' },
    { label: 'Orders',     path: '/admin/orders' },
    { label: 'Users',      path: '/admin/users' },
    { label: 'Analytics',  path: '/admin/analytics' },
    { label: 'CMS',        path: '/admin/cms' },
    { label: 'Custom',     path: '/admin/custom' },
    { label: 'Coupons',    path: '/admin/coupons' },
    { label: 'Database',   path: '/admin/database' },
  ]
  return (
    <div style={{ background: 'var(--ink)', borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 32 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '.1em' }}>
            AD<span style={{ color: 'var(--gold)' }}>ORE</span>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', background: 'var(--gold)', color: '#fff', padding: '3px 8px', borderRadius: 2, marginLeft: 10, verticalAlign: 'middle' }}>Admin</span>
          </span>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,.4)', fontFamily: "'Jost',sans-serif", fontWeight: 600, letterSpacing: '.06em' }}
          >
            ← Back to Store
          </button>
        </div>
        <div style={{ display: 'flex', gap: 0, borderTop: '1px solid rgba(255,255,255,.06)', overflowX: 'auto' }}>
          {tabs.map(t => (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              style={{
                padding: '12px 18px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                color: active === t.path ? '#fff' : 'rgba(255,255,255,.4)',
                borderBottom: `2px solid ${active === t.path ? 'var(--gold)' : 'transparent'}`,
                fontFamily: "'Jost',sans-serif", transition: 'color .2s', marginBottom: -1,
                whiteSpace: 'nowrap',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

const STATUS_COLOR = {
  PENDING: '#e65100', CONFIRMED: '#1565c0', PROCESSING: '#1565c0',
  SHIPPED: '#2e7d32', DELIVERED: '#1b5e20', CANCELLED: '#c0392b'
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin" />
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={40} /></div>
    </div>
  )

  const STAT_CARDS = [
    { label: 'Total Orders',  value: stats?.totalOrders || 0,  icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>, trend: '+12%' },
    { label: 'Revenue',        value: fmt(stats?.totalRevenue), icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>, trend: '+8%' },
    { label: 'Products',       value: stats?.totalProducts || 0, icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, trend: '' },
    { label: 'Customers',      value: stats?.totalUsers || 0,   icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>, trend: '+5%' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5% 60px' }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          {STAT_CARDS.map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 3, border: '1px solid var(--ink-10)', padding: '24px 20px' }}>
              <div style={{ color: 'var(--gold)', marginBottom: 12 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>{s.label}</div>
              {s.trend && <div style={{ fontSize: 12, fontWeight: 700, color: '#2e7d32', marginTop: 6 }}>{s.trend} this month</div>}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 16 }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-gold" onClick={() => navigate('/admin/products/add')}>+ Add Product</button>
            <button className="btn-outline" onClick={() => navigate('/admin/orders')}>View Orders</button>
            <button className="btn-outline" onClick={() => navigate('/admin/products')}>Manage Products</button>
          </div>
        </div>

        {/* Recent orders */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 16 }}>Recent Orders</div>
          <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 3, overflow: 'hidden' }}>
            {!stats?.recentOrders?.length ? (
              <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 14, color: 'var(--ink-60)' }}>No orders yet</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--ink-10)' }}>
                    {['Order ID', 'Customer', 'Total', 'Status'].map(h => (
                      <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order, i) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/orders/${order.id}`)}
                      style={{ borderBottom: i < stats.recentOrders.length - 1 ? '1px solid var(--ink-5)' : 'none', cursor: 'pointer', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px', fontSize: 13, fontFamily: 'monospace', fontWeight: 700 }}>#{order.id.slice(-8).toUpperCase()}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, color: 'var(--ink-60)' }}>{order.user?.name || '—'}</td>
                      <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700 }}>{fmt(order.total)}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 2, background: (STATUS_COLOR[order.status] || '#999') + '18', color: STATUS_COLOR[order.status] || '#999' }}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

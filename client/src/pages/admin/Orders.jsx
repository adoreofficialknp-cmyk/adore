import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { AdminNav } from './Dashboard'
import { Spinner } from '../../components/UI'
import { useToast } from '../../context/ToastContext'

const fmt = n => `₹${Number(n || 0).toLocaleString('en-IN')}`
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_COLOR = {
  PENDING:    { bg: '#fff8e1', text: '#e65100' },
  CONFIRMED:  { bg: '#e3f2fd', text: '#1565c0' },
  PROCESSING: { bg: '#e3f2fd', text: '#1565c0' },
  SHIPPED:    { bg: '#e8f5e9', text: '#2e7d32' },
  DELIVERED:  { bg: '#e8f5e9', text: '#1b5e20' },
  CANCELLED:  { bg: '#fdecea', text: '#c0392b' },
}

export default function AdminOrders() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [updating, setUpdating] = useState(null)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    const params = filter !== 'ALL' ? `?status=${filter}` : ''
    api.get(`/orders${params}`).then(r => setOrders(r.data.orders || [])).finally(() => setLoading(false))
  }, [filter])

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await api.put(`/orders/${orderId}/status`, { status })
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
      showToast(`Status updated to ${status}`)
    } catch { showToast('Failed to update') }
    finally { setUpdating(null) }
  }

  const handleDelete = async (orderId) => {
    if (!confirm('Permanently delete this order? This cannot be undone.')) return
    setDeleting(orderId)
    try {
      await api.delete(`/orders/${orderId}`)
      setOrders(prev => prev.filter(o => o.id !== orderId))
      showToast('Order deleted')
    } catch { showToast('Failed to delete order') }
    finally { setDeleting(null) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/orders" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5% 60px' }}>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--ink-10)', overflowX: 'auto' }}>
          {['ALL', ...ORDER_STATUSES].map(s => {
            const sc = STATUS_COLOR[s]
            return (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase',
                color: filter === s ? (sc?.text || 'var(--ink)') : 'var(--ink-40)',
                borderBottom: `2px solid ${filter === s ? (sc?.text || 'var(--ink)') : 'transparent'}`,
                whiteSpace: 'nowrap', fontFamily: "'Jost',sans-serif", marginBottom: -1,
              }}>{s}</button>
            )
          })}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><Spinner size={40} /></div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--ink-60)', fontSize: 14 }}>No orders found</div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 3, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ink-10)' }}>
                  {['Order', 'Customer', 'Items', 'Total', 'Status', 'Update', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => {
                  const sc = STATUS_COLOR[order.status] || { bg: '#f5f5f5', text: '#666' }
                  return (
                    <tr key={order.id} style={{ borderBottom: i < orders.length - 1 ? '1px solid var(--ink-5)' : 'none', transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 13, fontFamily: 'monospace', fontWeight: 700, marginBottom: 3 }}>#{order.id.slice(-8).toUpperCase()}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-60)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--ink-60)' }}>{order.user?.name || '—'}</td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--ink-60)', maxWidth: 180 }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.items.slice(0, 2).map(item => item.name).join(', ')}
                          {order.items.length > 2 ? ` +${order.items.length - 2}` : ''}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700 }}>{fmt(order.total)}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 2, background: sc.bg, color: sc.text }}>
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <select
                            className="input-field"
                            value={order.status}
                            onChange={e => updateStatus(order.id, e.target.value)}
                            disabled={updating === order.id}
                            style={{ fontSize: 11, padding: '6px 10px', minWidth: 130 }}
                          >
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          {updating === order.id && <Spinner size={16} />}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={() => handleDelete(order.id)}
                          disabled={deleting === order.id}
                          style={{ padding: '6px 14px', fontSize: 11, fontWeight: 700, background: '#fdecea', color: '#c0392b', border: 'none', borderRadius: 2, cursor: 'pointer', fontFamily: "'Jost',sans-serif", opacity: deleting === order.id ? .5 : 1 }}
                        >
                          {deleting === order.id ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

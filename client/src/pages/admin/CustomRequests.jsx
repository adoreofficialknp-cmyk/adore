import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { AdminNav } from './Dashboard'
import { Spinner } from '../../components/UI'
import { useToast } from '../../context/ToastContext'

export default function AdminCustomRequests() {
  const { showToast } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/custom')
      setRequests(data)
    } catch (err) {
      showToast('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, status) => {
    setUpdating(id)
    try {
      await api.put(`/custom/${id}/status`, { status })
      setRequests(rs => rs.map(r => r.id === id ? { ...r, status } : r))
      showToast('Status updated')
    } catch (err) {
      showToast('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  const STATUS_COLORS = {
    PENDING: '#FF9800',
    REVIEWING: '#2196F3',
    DESIGNING: '#9C27B0',
    CRAFTING: '#3F51B5',
    COMPLETED: '#4CAF50',
    CANCELLED: '#F44336'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/custom" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5% 60px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Admin</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 32 }}>Custom Jewellery Requests</h1>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Spinner size={40} /></div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>💎</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-60)' }}>No custom requests yet</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {requests.map(r => (
              <div key={r.id} style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700 }}>{r.type} for {r.occasion}</h3>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: STATUS_COLORS[r.status] + '20', color: STATUS_COLORS[r.status], letterSpacing: '.05em' }}>{r.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-40)' }}>Requested on {new Date(r.createdAt).toLocaleDateString()} by {r.name}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select 
                      value={r.status} 
                      onChange={(e) => updateStatus(r.id, e.target.value)}
                      disabled={updating === r.id}
                      style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid var(--ink-10)', fontSize: 12, fontWeight: 600, outline: 'none' }}
                    >
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24, marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 8 }}>Design Brief</div>
                    <p style={{ fontSize: 14, color: 'var(--ink-60)', lineHeight: 1.6 }}>{r.description}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 8 }}>Specifications</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-60)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>Metal: <strong>{r.metal}</strong></div>
                      <div>Budget: <strong>{r.budget}</strong></div>
                      {r.gemstones && <div>Gemstones: <strong>{r.gemstones}</strong></div>}
                      {r.timeline && <div>Timeline: <strong>{r.timeline}</strong></div>}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 8 }}>Contact Info</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-60)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div>Phone: <strong>{r.phone}</strong></div>
                      <div>Email: <strong>{r.email}</strong></div>
                      {r.referenceUrl && <div>Ref: <a href={r.referenceUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>View Link</a></div>}
                    </div>
                  </div>
                </div>
                {r.notes && (
                  <div style={{ padding: 12, background: '#f9f9f7', borderRadius: 4, fontSize: 13, color: 'var(--ink-60)' }}>
                    <strong>Notes:</strong> {r.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

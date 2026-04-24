import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { Spinner } from '../components/UI'
import { useToast } from '../context/ToastContext'

export default function MyCustomRequests() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/custom/my')
      setRequests(data)
    } catch (err) {
      showToast('Failed to fetch requests')
    } finally {
      setLoading(false)
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

  const STATUS_LABELS = {
    PENDING: 'Request Received',
    REVIEWING: 'Under Review',
    DESIGNING: 'Designing Stage',
    CRAFTING: 'Crafting Stage',
    COMPLETED: 'Completed & Shipped',
    CANCELLED: 'Cancelled'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8', paddingTop: 80 }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 5% 60px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Account</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 32 }}>My Custom Jewellery</h1>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Spinner size={40} /></div>
        ) : requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>💎</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink-60)', marginBottom: 24 }}>No custom requests yet</div>
            <button className="btn-gold" onClick={() => navigate('/custom-jewellery')}>Start Your First Request</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {requests.map(r => (
              <div key={r.id} style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700 }}>{r.type} for {r.occasion}</h3>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: STATUS_COLORS[r.status] + '20', color: STATUS_COLORS[r.status], letterSpacing: '.05em' }}>{STATUS_LABELS[r.status]}</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--ink-40)' }}>Requested on {new Date(r.createdAt).toLocaleDateString()}</div>
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
                </div>

                {/* Tracking Progress */}
                <div style={{ marginTop: 24, borderTop: '1px solid var(--ink-10)', paddingTop: 24 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 20 }}>Request Progress</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 10 }}>
                    {['PENDING', 'REVIEWING', 'DESIGNING', 'CRAFTING', 'COMPLETED'].map((s, i, arr) => {
                      const stages = ['PENDING', 'REVIEWING', 'DESIGNING', 'CRAFTING', 'COMPLETED']
                      const currentIdx = stages.indexOf(r.status)
                      const isPast = currentIdx >= i
                      const isCurrent = currentIdx === i
                      
                      return (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'none' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 80 }}>
                            <div style={{ 
                              width: 24, height: 24, borderRadius: '50%', 
                              background: isPast ? 'var(--gold)' : 'var(--ink-10)', 
                              color: '#fff', fontSize: 10, fontWeight: 700, 
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: isCurrent ? '4px solid var(--gold-bg)' : 'none',
                              boxSizing: 'content-box'
                            }}>
                              {isPast ? '✓' : i + 1}
                            </div>
                            <span style={{ fontSize: 9, fontWeight: 700, color: isPast ? 'var(--ink)' : 'var(--ink-40)', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center' }}>{STATUS_LABELS[s]}</span>
                          </div>
                          {i < arr.length - 1 && <div style={{ flex: 1, height: 2, background: currentIdx > i ? 'var(--gold)' : 'var(--ink-10)', margin: '0 4px', marginBottom: 24 }} />}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { AdminNav } from './Dashboard'
import { Spinner } from '../../components/UI'
import { useToast } from '../../context/ToastContext'
import { useAuth } from '../../context/AuthContext'

export default function AdminUsers() {
  const { showToast } = useToast()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updating, setUpdating] = useState(null)
  const [pushOpen, setPushOpen] = useState(false)
  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      api.get(`/admin/users?search=${search}&limit=50`)
        .then(r => setUsers(r.data.users || []))
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleRoleChange = async (userId, newRole) => {
    setUpdating(userId)
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u))
      showToast(`Role updated to ${newRole}`)
    } catch {
      showToast('Failed to update role')
    } finally {
      setUpdating(null)
    }
  }

  const handleSendNotification = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) { showToast('Enter title and message'); return }
    setSending(true)
    try {
      const { data } = await api.post('/admin/push-notification', { title: pushTitle, body: pushBody })
      showToast(`Push notification sent to ${data.sent} users`)
    } catch {
      showToast('Failed to send notification')
    } finally {
      setPushOpen(false)
      setPushTitle('')
      setPushBody('')
      setSending(false)
    }
  }

  const ROLE_COLOR = { ADMIN: 'var(--gold)', MANAGER: '#1565c0', USER: 'var(--ink-40)' }

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/users" />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 5% 60px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Admin</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 600, color: 'var(--ink)' }}>Manage Users</h1>
          </div>
          <button
            onClick={() => setPushOpen(true)}
            className="btn-gold"
            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
            Send Push Notification
          </button>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 24 }}>
          <input
            className="input-field"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ maxWidth: 400 }}
          />
        </div>

        {/* Role Legend */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          {[{ role: 'ADMIN', desc: 'Full access — manage everything' }, { role: 'USER', desc: 'Regular customer' }].map(r => (
            <div key={r.role} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--ink-60)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: ROLE_COLOR[r.role] || 'var(--ink-40)', display: 'inline-block' }} />
              <strong style={{ color: ROLE_COLOR[r.role] }}>{r.role}</strong>: {r.desc}
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}><Spinner size={36} /></div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--ink-10)' }}>
                  {['User', 'Email', 'Orders', 'Joined', 'Role', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: i < users.length - 1 ? '1px solid var(--ink-5)' : 'none', transition: 'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-bg)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{u.name}</div>
                          {u.phone && <div style={{ fontSize: 11, color: 'var(--ink-40)' }}>{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-60)' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{u._count?.orders || 0}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-40)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 2, background: u.role === 'ADMIN' ? 'rgba(184,151,90,.12)' : 'rgba(28,28,30,.06)', color: ROLE_COLOR[u.role] || 'var(--ink-40)' }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {u.id !== currentUser?.id ? (
                        updating === u.id ? (
                          <Spinner size={16} />
                        ) : (
                          <select
                            value={u.role}
                            onChange={e => handleRoleChange(u.id, e.target.value)}
                            style={{ padding: '6px 10px', border: '1px solid var(--ink-20)', borderRadius: 3, fontSize: 12, fontFamily: "'Jost',sans-serif", cursor: 'pointer', background: '#fff', color: 'var(--ink)', outline: 'none' }}
                          >
                            <option value="USER">Set as User</option>
                            <option value="ADMIN">Set as Admin</option>
                          </select>
                        )
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--ink-40)' }}>You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--ink-40)', fontSize: 14 }}>No users found</div>
            )}
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-40)' }}>{users.length} users shown</div>
      </div>

      {/* Push Notification Modal */}
      {pushOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && setPushOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 600 }}>Send Push Notification</h2>
              <button onClick={() => setPushOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-40)', padding: 4 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: 4, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: 'var(--ink-60)' }}>
              This will send a push notification to all <strong>{users.length} users</strong>.
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Title *</label>
              <input className="input-field" placeholder="e.g. Diwali Sale — Up to 20% Off!" value={pushTitle} onChange={e => setPushTitle(e.target.value)} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Message *</label>
              <textarea className="input-field" rows={3} placeholder="Enter the notification message…" value={pushBody} onChange={e => setPushBody(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => setPushOpen(false)}>Cancel</button>
              <button className="btn-gold" style={{ flex: 2 }} disabled={sending} onClick={handleSendNotification}>
                {sending ? 'Sending…' : 'Send Notification'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

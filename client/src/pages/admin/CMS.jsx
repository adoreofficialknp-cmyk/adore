import { useState } from 'react'
import { AdminNav } from './Dashboard'
import { useToast } from '../../context/ToastContext'

const PAYMENT_OPTIONS = [
  { id: 'razorpay', label: 'Razorpay', desc: 'Cards, UPI, Netbanking & Wallets' },
  { id: 'cashfree', label: 'Cashfree', desc: 'UPI, Cards & Netbanking' },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
]

const DEFAULT_BANNERS = [
  { id: 1, title: 'Eternal Elegance', subtitle: 'Handcrafted in 18K gold with certified diamonds', tag: 'New Collection · 2025', cta: 'Shop Necklaces', active: true },
  { id: 2, title: 'Golden Moments', subtitle: 'Rings that tell your love story', tag: 'Bestseller', cta: 'Shop Rings', active: true },
  { id: 3, title: 'Crafted With Love', subtitle: 'Earrings for every occasion', tag: 'Fine Jewellery', cta: 'Shop Earrings', active: true },
]

const DEFAULT_MARQUEE = [
  'Free shipping on orders above ₹2,999',
  'BIS Hallmarked Jewellery',
  '30-Day Easy Returns',
  'Use code ADORE10 for 10% off',
  'IGI Certified Diamonds',
  'EMI options available',
]

export default function AdminCMS() {
  const { showToast } = useToast()
  const [tab, setTab] = useState('banners')
  const [banners, setBanners] = useState(DEFAULT_BANNERS)
  const [marqueeItems, setMarqueeItems] = useState(DEFAULT_MARQUEE)
  const [editingBanner, setEditingBanner] = useState(null)
  const [payments, setPayments] = useState({ razorpay: true, cashfree: true, cod: true })
  const [homeStats, setHomeStats] = useState([
    { val: '100%', lbl: 'BIS Certified' },
    { val: '18K+', lbl: 'Gold Standard' },
    { val: '50,000+', lbl: 'Happy Customers' },
    { val: '5★', lbl: 'Avg Rating' },
  ])
  const [commitmentText, setCommitmentText] = useState({
    heading: 'Every piece is tested, certified & guaranteed',
    body: 'Each ADORE piece undergoes rigorous quality testing at government-approved labs. Our gold is BIS hallmarked, our diamonds are IGI/GIA certified, and every gemstone is lab-verified for authenticity.',
  })
  const [newMarquee, setNewMarquee] = useState('')

  const saveChanges = () => showToast('Changes saved successfully!')

  const TABS = [
    { id: 'banners', label: 'Hero Banners' },
    { id: 'marquee', label: 'Marquee Text' },
    { id: 'commitment', label: 'Commitment Section' },
    { id: 'payments', label: 'Payment Methods' },
    { id: 'stats', label: 'Home Stats' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/cms" />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 5% 60px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Admin</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 32 }}>Content Management</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--ink-10)', marginBottom: 32, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ padding: '12px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: tab === t.id ? 'var(--ink)' : 'var(--ink-40)', borderBottom: `2px solid ${tab === t.id ? 'var(--gold)' : 'transparent'}`, fontFamily: "'Jost',sans-serif", transition: 'color .2s', whiteSpace: 'nowrap', marginBottom: -1 }}
            >{t.label}</button>
          ))}
        </div>

        {/* Hero Banners */}
        {tab === 'banners' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 24, lineHeight: 1.6 }}>Manage the hero slider on the home page. You can edit text content, toggle visibility, and reorder banners.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {banners.map(b => (
                <div key={b.id} style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      {editingBanner === b.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <input className="input-field" value={b.tag} onChange={e => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, tag: e.target.value } : x))} placeholder="Tag (e.g. New Collection · 2025)" />
                          <input className="input-field" value={b.title} onChange={e => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, title: e.target.value } : x))} placeholder="Hero Title" style={{ fontSize: 16, fontWeight: 700 }} />
                          <input className="input-field" value={b.subtitle} onChange={e => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, subtitle: e.target.value } : x))} placeholder="Subtitle" />
                          <input className="input-field" value={b.cta} onChange={e => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, cta: e.target.value } : x))} placeholder="CTA Button Text" />
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 4 }}>{b.tag}</div>
                          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{b.title}</div>
                          <div style={{ fontSize: 13, color: 'var(--ink-60)' }}>{b.subtitle}</div>
                          <div style={{ fontSize: 11, marginTop: 6, color: 'var(--ink-40)' }}>CTA: <strong>{b.cta}</strong></div>
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <button
                        onClick={() => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, active: !x.active } : x))}
                        style={{ width: 46, height: 26, borderRadius: 13, background: b.active ? 'var(--gold)' : 'var(--ink-20)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: b.active ? 22 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.15)' }} />
                      </button>
                      <button
                        onClick={() => setEditingBanner(editingBanner === b.id ? null : b.id)}
                        style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: 3, cursor: 'pointer', color: 'var(--gold)', fontFamily: "'Jost',sans-serif", letterSpacing: '.06em', textTransform: 'uppercase' }}
                      >
                        {editingBanner === b.id ? 'Done' : 'Edit'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-gold" style={{ marginTop: 24 }} onClick={saveChanges}>Save Banner Changes</button>
          </div>
        )}

        {/* Marquee */}
        {tab === 'marquee' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 24, lineHeight: 1.6 }}>Edit the scrolling announcement bar at the top of the site. Click any item to edit it.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {marqueeItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    className="input-field"
                    value={item}
                    onChange={e => setMarqueeItems(ms => ms.map((m, j) => j === i ? e.target.value : m))}
                    style={{ flex: 1 }}
                  />
                  <button onClick={() => setMarqueeItems(ms => ms.filter((_, j) => j !== i))} style={{ width: 36, height: 36, borderRadius: 4, background: '#fff2f2', border: '1px solid #ffcdd2', cursor: 'pointer', color: '#e53935', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <input className="input-field" placeholder="Add new marquee item…" value={newMarquee} onChange={e => setNewMarquee(e.target.value)} style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter' && newMarquee.trim()) { setMarqueeItems(ms => [...ms, newMarquee.trim()]); setNewMarquee('') } }} />
              <button className="btn-gold" onClick={() => { if (newMarquee.trim()) { setMarqueeItems(ms => [...ms, newMarquee.trim()]); setNewMarquee('') } }}>+ Add</button>
            </div>
            <button className="btn-gold" onClick={saveChanges}>Save Marquee</button>
          </div>
        )}

        {/* Commitment Section */}
        {tab === 'commitment' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 24, lineHeight: 1.6 }}>Edit the "Our Commitment" section that appears in the home page certification area.</p>
            <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, padding: 24, marginBottom: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Section Heading</label>
                <input className="input-field" value={commitmentText.heading} onChange={e => setCommitmentText(c => ({ ...c, heading: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Body Text</label>
                <textarea className="input-field" rows={4} value={commitmentText.body} onChange={e => setCommitmentText(c => ({ ...c, body: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <button className="btn-gold" onClick={saveChanges}>Save Commitment Text</button>
          </div>
        )}

        {/* Payment Methods */}
        {tab === 'payments' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 24, lineHeight: 1.6 }}>Control which payment methods are shown to customers at checkout. Toggle off to hide a payment option.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {PAYMENT_OPTIONS.map(opt => (
                <div key={opt.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{opt.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink-60)' }}>{opt.desc}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2, background: payments[opt.id] ? '#e8f5e9' : '#ffebee', color: payments[opt.id] ? '#2e7d32' : '#c0392b', display: 'inline-block', marginTop: 6 }}>
                      {payments[opt.id] ? 'ACTIVE' : 'HIDDEN'}
                    </span>
                  </div>
                  <button
                    onClick={() => setPayments(p => ({ ...p, [opt.id]: !p[opt.id] }))}
                    style={{ width: 52, height: 28, borderRadius: 14, background: payments[opt.id] ? 'var(--gold)' : 'var(--ink-20)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: payments[opt.id] ? 26 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: 4, padding: '14px 18px', fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.6, marginBottom: 24 }}>
              ⚠️ Make sure at least one payment method is active. Changes are reflected immediately at checkout.
            </div>
            <button className="btn-gold" onClick={saveChanges}>Save Payment Settings</button>
          </div>
        )}

        {/* Stats */}
        {tab === 'stats' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 24, lineHeight: 1.6 }}>Edit the four statistics shown in the "Our Commitment" section on the home page.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
              {homeStats.map((s, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, padding: 18 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 10 }}>Stat {i + 1}</label>
                  <input className="input-field" value={s.val} onChange={e => setHomeStats(ss => ss.map((x, j) => j === i ? { ...x, val: e.target.value } : x))} placeholder="Value (e.g. 50,000+)" style={{ marginBottom: 8 }} />
                  <input className="input-field" value={s.lbl} onChange={e => setHomeStats(ss => ss.map((x, j) => j === i ? { ...x, lbl: e.target.value } : x))} placeholder="Label (e.g. Happy Customers)" />
                </div>
              ))}
            </div>
            <button className="btn-gold" onClick={saveChanges}>Save Stats</button>
          </div>
        )}
      </div>
    </div>
  )
}

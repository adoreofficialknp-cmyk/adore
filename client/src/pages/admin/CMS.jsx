import { useState, useEffect } from 'react'
import { AdminNav } from './Dashboard'
import { useToast } from '../../context/ToastContext'
import api from '../../utils/api'
import { Spinner } from '../../components/UI'

const PAYMENT_OPTIONS = [
  { id: 'razorpay', label: 'Razorpay', desc: 'Cards, UPI, Netbanking & Wallets' },
  { id: 'cashfree', label: 'Cashfree', desc: 'UPI, Cards & Netbanking' },
  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
]

const DEFAULT_BANNERS = [
  { id: 1, title: 'Eternal Elegance', subtitle: 'Handcrafted in 18K gold with certified diamonds', tag: 'New Collection · 2025', cta: 'Shop Necklaces', cat: 'Necklaces', active: true, img: 'https://images.unsplash.com/photo-1599459182681-c938b7f65b6d?w=1600&auto=format&fit=crop&q=85' },
  { id: 2, title: 'Golden Moments', subtitle: 'Rings that tell your love story', tag: 'Bestseller', cta: 'Shop Rings', cat: 'Rings', active: true, img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&auto=format&fit=crop&q=85' },
  { id: 3, title: 'Crafted With Love', subtitle: 'Earrings for every occasion', tag: 'Fine Jewellery', cta: 'Shop Earrings', cat: 'Earrings', active: true, img: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=1600&auto=format&fit=crop&q=85' },
]

const DEFAULT_SECTION_IMAGES = [
  { id: 'material_gold',     label: 'Material — Gold',          img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&auto=format&fit=crop&q=80' },
  { id: 'material_silver',   label: 'Material — Silver',        img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&auto=format&fit=crop&q=80' },
  { id: 'material_platinum', label: 'Material — Platinum',      img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80' },
  { id: 'material_diamond',  label: 'Material — Diamond',       img: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=600&auto=format&fit=crop&q=80' },
  { id: 'promo_bridal',      label: 'Promo Banner — Bridal',    img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&auto=format&fit=crop&q=80' },
  { id: 'promo_rings',       label: 'Promo Banner — Solitaire', img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&auto=format&fit=crop&q=80' },
]

const DEFAULT_MARQUEE = [
  { id: 'm1', text: 'Free shipping on orders above \u20b92,999' },
  { id: 'm2', text: 'BIS Hallmarked Jewellery' },
  { id: 'm3', text: '30-Day Easy Returns' },
  { id: 'm4', text: 'Use code ADORE10 for 10% off' },
  { id: 'm5', text: 'IGI Certified Diamonds' },
  { id: 'm6', text: 'EMI options available' },
]

let _marqueeCounter = 100
const newMarqueeItem = (text) => ({ id: `m${++_marqueeCounter}`, text })

// ── Cloudinary image uploader ──────────────────────────────────────────────
function ImageUploader({ currentImg, onUploaded, label }) {
  const { showToast } = useToast()
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const inputEl = e.target
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('images', file)
      const { data } = await api.post('/upload/images', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      onUploaded(data[0].url)
      showToast('Image uploaded successfully!')
    } catch (err) {
      const msg = err.response?.data?.error || ''
      if (msg.includes('not configured') || msg.includes('CLOUDINARY')) {
        showToast('Cloudinary not configured — set CLOUDINARY_URL in server .env')
      } else {
        showToast('Upload failed. You can paste a URL manually below.')
      }
    } finally { setUploading(false); inputEl.value = '' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {currentImg && (
        <div style={{ width: '100%', height: 120, borderRadius: 4, overflow: 'hidden', background: '#f5f5f3', border: '1px solid var(--ink-10)' }}>
          <img src={currentImg} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={e => { e.currentTarget.style.opacity = '.3' }} />
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 14px', background: '#FFF0F5', border: '1px solid #F48FB1',
          borderRadius: 3, cursor: uploading ? 'not-allowed' : 'pointer',
          fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
          color: '#C2185B', fontFamily: "'Jost',sans-serif", transition: 'all .2s',
          opacity: uploading ? .6 : 1,
        }}>
          {uploading ? <Spinner size={14} color="#C2185B" /> : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          )}
          {uploading ? 'Uploading…' : 'Upload Image'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} disabled={uploading} />
        </label>
        <span style={{ fontSize: 11, color: 'var(--ink-40)' }}>or paste URL:</span>
      </div>
      <input
        className="input-field"
        value={currentImg}
        onChange={e => onUploaded(e.target.value)}
        placeholder="https://..."
        style={{ fontSize: 12 }}
      />
    </div>
  )
}

export default function AdminCMS() {
  const { showToast } = useToast()
  const [tab, setTab] = useState('banners')
  const [banners, setBanners] = useState(DEFAULT_BANNERS)
  const [sectionImages, setSectionImages] = useState(DEFAULT_SECTION_IMAGES)
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
  const [homeCounts, setHomeCounts] = useState({ newArrivalsCount: 8, trendingCount: 8 })
  const [apiKeys, setApiKeys] = useState({
    RAZORPAY_KEY: '',
    RAZORPAY_SECRET: '',
    CASHFREE_APP_ID: '',
    CASHFREE_SECRET: '',
    CASHFREE_ENV: 'SANDBOX'
  })

  // Load saved config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('adore_cms_config')
      if (saved) {
        const p = JSON.parse(saved)
        if (p.banners) setBanners(p.banners)
        if (p.sectionImages) setSectionImages(p.sectionImages)
        if (p.marqueeItems) {
          // Migrate old string-array format to new object-array format
          const items = p.marqueeItems.map((m, i) =>
            typeof m === 'string' ? { id: `m_loaded_${i}`, text: m } : m
          )
          setMarqueeItems(items)
        }
        if (p.payments) setPayments(p.payments)
        if (p.homeStats) setHomeStats(p.homeStats)
        if (p.commitmentText) setCommitmentText(p.commitmentText)
        if (p.newArrivalsCount || p.trendingCount) {
          setHomeCounts({
            newArrivalsCount: p.newArrivalsCount || 8,
            trendingCount: p.trendingCount || 8
          })
        }
      }
    } catch {}

    // Fetch existing config from backend
    const fetchConfig = async () => {
      try {
        const { data } = await api.get('/admin/config')
        setApiKeys(prev => ({ ...prev, ...data }))
      } catch (err) {
        console.error('Failed to fetch config', err)
      }
    }
    fetchConfig()
  }, [])

  const saveChanges = async (msg = 'Changes saved!') => {
    try {
      const config = {
        banners,
        sectionImages,
        // Save as plain strings so Home.jsx can consume them without changes
        marqueeItems: marqueeItems.map(m => m.text),
        payments,
        homeStats,
        commitmentText,
        newArrivalsCount: homeCounts.newArrivalsCount,
        trendingCount: homeCounts.trendingCount
      }
      localStorage.setItem('adore_cms_config', JSON.stringify(config))

      // Save API keys to backend
      await api.post('/admin/config', { configs: apiKeys })

      showToast(msg)
    } catch (err) {
      showToast('Failed to save changes')
    }
  }

  const saveHomeCounts = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('adore_cms_config') || '{}')
      localStorage.setItem('adore_cms_config', JSON.stringify({ ...existing, ...homeCounts }))
      showToast('Home page counts saved! Refresh the home page to see changes.')
    } catch {
      showToast('Failed to save')
    }
  }

  const TABS = [
    { id: 'banners',   label: 'Hero Banners' },
    { id: 'sections',  label: 'Section Images' },
    { id: 'homecounts', label: 'Product Counts' },
    { id: 'marquee',   label: 'Marquee Text' },
    { id: 'commitment', label: 'Commitment' },
    { id: 'payments',  label: 'Payment Methods' },
    { id: 'stats',     label: 'Home Stats' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#fafaf8' }}>
      <AdminNav active="/admin/cms" />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 5% 60px' }}>
        <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 600, marginBottom: 8 }}>Admin</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3vw,36px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 32 }}>Content Management</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--ink-10)', marginBottom: 32, overflowX: 'auto' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: tab === t.id ? 'var(--ink)' : 'var(--ink-40)', borderBottom: `2px solid ${tab === t.id ? '#C2185B' : 'transparent'}`, fontFamily: "'Jost',sans-serif", transition: 'color .2s', whiteSpace: 'nowrap', marginBottom: -1 }}
            >{t.label}</button>
          ))}
        </div>

        {/* ── Hero Banners ─────────────────────────────────────────────── */}
        {tab === 'banners' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 24, lineHeight: 1.6 }}>
              Manage the hero slider on the home page. Upload images directly to Cloudinary or paste image URLs.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {banners.map(b => (
                <div key={b.id} style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: editingBanner === b.id ? 16 : 0 }}>
                      <div style={{ flex: 1 }}>
                        {editingBanner !== b.id && (
                          <div>
                            <div style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 600, marginBottom: 4 }}>{b.tag}</div>
                            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>{b.title}</div>
                            <div style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 4 }}>{b.subtitle}</div>
                            <div style={{ fontSize: 11, color: 'var(--ink-40)' }}>CTA: <strong>{b.cta}</strong> · Cat: <strong>{b.cat}</strong></div>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        <button
                          onClick={() => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, active: !x.active } : x))}
                          style={{ width: 46, height: 26, borderRadius: 13, background: b.active ? '#C2185B' : 'var(--ink-20)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}
                        >
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: b.active ? 22 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.15)' }} />
                        </button>
                        <button
                          onClick={() => setEditingBanner(editingBanner === b.id ? null : b.id)}
                          style={{ padding: '8px 16px', fontSize: 11, fontWeight: 700, background: '#FFF0F5', border: '1px solid #F48FB1', borderRadius: 3, cursor: 'pointer', color: '#C2185B', fontFamily: "'Jost',sans-serif", letterSpacing: '.06em', textTransform: 'uppercase' }}
                        >
                          {editingBanner === b.id ? 'Collapse' : 'Edit'}
                        </button>
                      </div>
                    </div>

                    {editingBanner === b.id && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 6 }}>Tag</label>
                            <input className="input-field" value={b.tag} onChange={e => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, tag: e.target.value } : x))} placeholder="e.g. New Collection · 2025" />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 6 }}>CTA Text</label>
                            <input className="input-field" value={b.cta} onChange={e => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, cta: e.target.value } : x))} placeholder="e.g. Shop Necklaces" />
                          </div>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 6 }}>Title</label>
                          <input className="input-field" value={b.title} onChange={e => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, title: e.target.value } : x))} placeholder="Hero Title" style={{ fontSize: 16, fontWeight: 700 }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 6 }}>Subtitle</label>
                          <input className="input-field" value={b.subtitle} onChange={e => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, subtitle: e.target.value } : x))} placeholder="Subtitle text" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 6 }}>Banner Image</label>
                          <ImageUploader
                            currentImg={b.img}
                            onUploaded={url => setBanners(bs => bs.map(x => x.id === b.id ? { ...x, img: url } : x))}
                            label={`Banner ${b.id}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-pink" style={{ marginTop: 24 }} onClick={() => saveChanges('Banner changes saved!')}>Save Banner Changes</button>
          </div>
        )}

        {/* ── Section Images ───────────────────────────────────────────── */}
        {tab === 'sections' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 24, lineHeight: 1.6 }}>
              Upload images for home page sections — Shop by Material cards, Promo banners, and more. Images are uploaded directly to Cloudinary.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {sectionImages.map(sec => (
                <div key={sec.id} style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, padding: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 12 }}>{sec.label}</div>
                  <ImageUploader
                    currentImg={sec.img}
                    onUploaded={url => setSectionImages(imgs => imgs.map(x => x.id === sec.id ? { ...x, img: url } : x))}
                    label={sec.label}
                  />
                </div>
              ))}
            </div>
            <button className="btn-pink" style={{ marginTop: 24 }} onClick={() => saveChanges('Section images saved!')}>Save Section Images</button>
          </div>
        )}

        {/* ── Product Counts ───────────────────────────────────────────── */}
        {tab === 'homecounts' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 24, lineHeight: 1.6 }}>
              Control how many products are displayed in the <strong>New Arrivals</strong> and <strong>Trending Now</strong> sections on the home page. Changes apply immediately after saving.
            </p>
            <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, padding: 24, marginBottom: 20 }}>
              <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 10 }}>
                    New Arrivals — Product Count
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={() => setHomeCounts(c => ({ ...c, newArrivalsCount: Math.max(2, c.newArrivalsCount - 2) }))}
                      style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--ink-10)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--ink-60)' }}
                    >−</button>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: '#C2185B', minWidth: 48, textAlign: 'center' }}>{homeCounts.newArrivalsCount}</div>
                    <button
                      onClick={() => setHomeCounts(c => ({ ...c, newArrivalsCount: Math.min(20, c.newArrivalsCount + 2) }))}
                      style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--ink-10)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--ink-60)' }}
                    >+</button>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    {[4, 6, 8, 10, 12].map(n => (
                      <button key={n} onClick={() => setHomeCounts(c => ({ ...c, newArrivalsCount: n }))} style={{
                        marginRight: 6, marginBottom: 6, padding: '5px 12px', borderRadius: 20,
                        border: '1.5px solid', borderColor: homeCounts.newArrivalsCount === n ? '#C2185B' : 'var(--ink-10)',
                        background: homeCounts.newArrivalsCount === n ? '#C2185B' : 'transparent',
                        color: homeCounts.newArrivalsCount === n ? '#fff' : 'var(--ink-60)',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif",
                      }}>{n}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 10 }}>
                    Trending Now — Product Count
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button
                      onClick={() => setHomeCounts(c => ({ ...c, trendingCount: Math.max(2, c.trendingCount - 2) }))}
                      style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--ink-10)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--ink-60)' }}
                    >−</button>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 700, color: '#C2185B', minWidth: 48, textAlign: 'center' }}>{homeCounts.trendingCount}</div>
                    <button
                      onClick={() => setHomeCounts(c => ({ ...c, trendingCount: Math.min(20, c.trendingCount + 2) }))}
                      style={{ width: 36, height: 36, borderRadius: '50%', border: '1.5px solid var(--ink-10)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--ink-60)' }}
                    >+</button>
                  </div>
                  <div style={{ marginTop: 10 }}>
                    {[4, 6, 8, 10, 12].map(n => (
                      <button key={n} onClick={() => setHomeCounts(c => ({ ...c, trendingCount: n }))} style={{
                        marginRight: 6, marginBottom: 6, padding: '5px 12px', borderRadius: 20,
                        border: '1.5px solid', borderColor: homeCounts.trendingCount === n ? '#C2185B' : 'var(--ink-10)',
                        background: homeCounts.trendingCount === n ? '#C2185B' : 'transparent',
                        color: homeCounts.trendingCount === n ? '#fff' : 'var(--ink-60)',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'Jost',sans-serif",
                      }}>{n}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#FFF0F5', border: '1px solid #F48FB1', borderRadius: 4, padding: '14px 18px', fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.6, marginBottom: 24 }}>
              💡 Products are shown in a 2-column grid. We recommend even numbers (4, 6, 8…) for a clean layout. Max: 20.
            </div>
            <button className="btn-pink" onClick={saveHomeCounts}>Save Product Counts</button>
          </div>
        )}

        {/* ── Marquee ──────────────────────────────────────────────────── */}
        {tab === 'marquee' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 24, lineHeight: 1.6 }}>Edit the scrolling announcement bar at the top of the site.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {marqueeItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    className="input-field"
                    value={item.text}
                    onChange={e => setMarqueeItems(ms => ms.map(m => m.id === item.id ? { ...m, text: e.target.value } : m))}
                    style={{ flex: 1 }}
                  />
                  <button onClick={() => setMarqueeItems(ms => ms.filter(m => m.id !== item.id))} style={{ width: 36, height: 36, borderRadius: 4, background: '#fff2f2', border: '1px solid #ffcdd2', cursor: 'pointer', color: '#e53935', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
              <input className="input-field" placeholder="Add new marquee item…" value={newMarquee} onChange={e => setNewMarquee(e.target.value)} style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter' && newMarquee.trim()) { setMarqueeItems(ms => [...ms, newMarqueeItem(newMarquee.trim())]); setNewMarquee('') } }} />
              <button className="btn-pink" onClick={() => { if (newMarquee.trim()) { setMarqueeItems(ms => [...ms, newMarqueeItem(newMarquee.trim())]); setNewMarquee('') } }}>+ Add</button>
            </div>
            <button className="btn-pink" onClick={() => saveChanges('Marquee saved!')}>Save Marquee</button>
          </div>
        )}

        {/* ── Commitment ───────────────────────────────────────────────── */}
        {tab === 'commitment' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 24, lineHeight: 1.6 }}>Edit the "Our Commitment" section text on the home page.</p>
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
            <button className="btn-pink" onClick={() => saveChanges('Commitment text saved!')}>Save Commitment Text</button>
          </div>
        )}

        {/* ── Payment Methods ──────────────────────────────────────────── */}
        {tab === 'payments' && (
          <div>
            <p style={{ fontSize: 13, color: 'var(--ink-60)', marginBottom: 24, lineHeight: 1.6 }}>Control which payment methods are shown to customers at checkout and configure their API keys.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
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
                    style={{ width: 52, height: 28, borderRadius: 14, background: payments[opt.id] ? '#C2185B' : 'var(--ink-20)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background .2s', flexShrink: 0 }}
                  >
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: payments[opt.id] ? 26 : 3, transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 32 }}>
              <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, fontFamily: "'Cormorant Garamond', serif" }}>Razorpay Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Key ID</label>
                    <input className="input-field" value={apiKeys.RAZORPAY_KEY} onChange={e => setApiKeys(p => ({ ...p, RAZORPAY_KEY: e.target.value }))} placeholder="rzp_test_..." />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Key Secret</label>
                    <input className="input-field" type="password" value={apiKeys.RAZORPAY_SECRET} onChange={e => setApiKeys(p => ({ ...p, RAZORPAY_SECRET: e.target.value }))} placeholder="••••••••••••" />
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', border: '1px solid var(--ink-10)', borderRadius: 4, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, fontFamily: "'Cormorant Garamond', serif" }}>Cashfree Configuration</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>App ID</label>
                    <input className="input-field" value={apiKeys.CASHFREE_APP_ID} onChange={e => setApiKeys(p => ({ ...p, CASHFREE_APP_ID: e.target.value }))} placeholder="Enter App ID" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Secret Key</label>
                    <input className="input-field" type="password" value={apiKeys.CASHFREE_SECRET} onChange={e => setApiKeys(p => ({ ...p, CASHFREE_SECRET: e.target.value }))} placeholder="••••••••••••" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Environment</label>
                    <select className="input-field" value={apiKeys.CASHFREE_ENV} onChange={e => setApiKeys(p => ({ ...p, CASHFREE_ENV: e.target.value }))}>
                      <option value="SANDBOX">Sandbox</option>
                      <option value="PRODUCTION">Production</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <button className="btn-pink" onClick={() => saveChanges('Payment settings saved!')}>Save Payment Settings</button>
          </div>
        )}

        {/* ── Stats ────────────────────────────────────────────────────── */}
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
            <button className="btn-pink" onClick={() => saveChanges('Stats saved!')}>Save Stats</button>
          </div>
        )}
      </div>

      <style>{`
        .btn-pink {
          background: #C2185B; color: #fff; border: none; padding: 12px 28px;
          font-size: 12px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase;
          cursor: pointer; border-radius: 3px; font-family: 'Jost', sans-serif;
          transition: background .2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        .btn-pink:hover { background: #AD1457; }
      `}</style>
    </div>
  )
}

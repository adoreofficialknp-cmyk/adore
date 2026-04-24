import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../utils/api'

const PRODUCTS = [
  { label: 'Ring',    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=90', fallback: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&auto=format&fit=crop&q=90' },
  { label: 'Pendant', img: 'https://images.unsplash.com/photo-1599459182681-c938b7f65b6d?w=400&auto=format&fit=crop&q=90', fallback: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&auto=format&fit=crop&q=90' },
]
const METAL_CHOICES = [
  { label: '925 Silver',       img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&auto=format&fit=crop&q=90', fallback: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=90' },
  { label: 'Rose Gold Finish', img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&auto=format&fit=crop&q=90', fallback: 'https://images.unsplash.com/photo-1599459182681-c938b7f65b6d?w=400&auto=format&fit=crop&q=90' },
  { label: 'Gold Plated',      img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&auto=format&fit=crop&q=90', fallback: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=90' },
]
const STONE_CHOICES = [
  { label: '925 Silver',       img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=90', fallback: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&auto=format&fit=crop&q=90' },
  { label: 'Rose Gold Finish', img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&auto=format&fit=crop&q=90', fallback: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&auto=format&fit=crop&q=90' },
  { label: 'Gold Plated',      img: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=400&auto=format&fit=crop&q=90', fallback: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&auto=format&fit=crop&q=90' },
]
const ENGRAVE_CHOICES = [
  { label: 'Name / Date',      sub: 'e.g. 22.05.2024',   img: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=400&auto=format&fit=crop&q=90', fallback: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=90' },
  { label: 'Special Message',  sub: 'Forever & Always',  img: 'https://images.unsplash.com/photo-1584786379996-ac2f7c0efbc9?w=400&auto=format&fit=crop&q=90', fallback: 'https://images.unsplash.com/photo-1599459182681-c938b7f65b6d?w=400&auto=format&fit=crop&q=90' },
]
const FEATURES = [
  { icon: '💗', label: 'Customized\nwith Love' },
  { icon: '🎁', label: 'Made just\nfor You'    },
  { icon: '✦',  label: '925\nHallmarked'       },
]

function StepBadge({ n, label, done, active }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:14 }}>
      <div style={{ width:26, height:26, borderRadius:'50%', flexShrink:0, background:done?'#4CAF50':active?'#C2185B':'#F8BBD0', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, transition:'background .25s' }}>
        {done ? '✓' : n}
      </div>
      <span style={{ fontSize:13, fontWeight:700, color:active||done?'#880E4F':'#bbb', whiteSpace:'nowrap', transition:'color .25s' }}>{label}</span>
      <div style={{ flex:1, height:1.5, background:done?'#4CAF50':'linear-gradient(to right,#F48FB1,transparent)', opacity:.6 }} />
    </div>
  )
}

function Tile({ item, selected, onClick }) {
  return (
    <div onClick={onClick} style={{ borderRadius:12, overflow:'hidden', cursor:'pointer', border:`2.5px solid ${selected?'#C2185B':'#F8BBD0'}`, background:selected?'#FCE4EC':'#fff', transform:selected?'scale(1.04)':'scale(1)', boxShadow:selected?'0 6px 22px rgba(194,24,91,.28)':'0 2px 8px rgba(194,24,91,.07)', transition:'all .2s', position:'relative' }}>
      {selected && <div style={{ position:'absolute', top:6, right:6, zIndex:3, width:20, height:20, borderRadius:'50%', background:'#D4A96A', color:'#4A2C0A', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800 }}>✓</div>}
      <img src={item.img} alt={item.label} loading="lazy" style={{ width:'100%', aspectRatio:'1', objectFit:'cover', display:'block' }} onError={e => { e.currentTarget.onerror=null; e.currentTarget.src=item.fallback }} />
      <div style={{ textAlign:'center', padding:'8px 6px 10px', background:selected?'#FCE4EC':'#fff' }}>
        <div style={{ fontSize:11, fontWeight:700, color:selected?'#C2185B':'#880E4F' }}>{selected?'💗 ':''}{item.label}</div>
        {item.sub && <div style={{ fontSize:10, color:'#C2185B', marginTop:2, fontStyle:'italic' }}>{item.sub}</div>}
      </div>
    </div>
  )
}

const inputStyle = { width:'100%', padding:'11px 14px', borderRadius:10, outline:'none', fontSize:13, border:'1.5px solid #F48FB1', fontFamily:"'Jost',sans-serif", color:'#333', background:'#fff', boxSizing:'border-box', transition:'border-color .2s' }
const lbl = { display:'block', fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#888', marginBottom:8 }

export default function CustomJewellery() {
  const navigate      = useNavigate()
  const { user }      = useAuth()
  const { showToast } = useToast()

  const [sel,         setSel]         = useState({ product:'', metal:'', stone:'', engrave:'' })
  const [engraveText, setEngraveText] = useState('')
  const [contact,     setContact]     = useState({ name:user?.name||'', phone:'', email:user?.email||'', notes:'' })
  const [showForm,    setShowForm]    = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)

  const pick = (key, value) => {
    const next = { ...sel, [key]: value }
    setSel(next)
    if (next.product && next.metal && next.stone && next.engrave) {
      setTimeout(() => {
        setShowForm(true)
        document.getElementById('cj-contact')?.scrollIntoView({ behavior:'smooth', block:'start' })
      }, 300)
    }
  }

  const allSelected    = sel.product && sel.metal && sel.stone && sel.engrave
  const contactValid   = contact.name && contact.phone && contact.email

  const handleSubmit = async () => {
    if (!contactValid || submitting) return
    setSubmitting(true)
    try {
      await api.post('/custom', {
        type:       sel.product,
        metal:      sel.metal,
        gemstones:  sel.stone,
        notes:      sel.engrave + (engraveText ? `: ${engraveText}` : ''),
        name:       contact.name,
        phone:      contact.phone,
        email:      contact.email,
        description: contact.notes || `Custom ${sel.product} in ${sel.metal} finish with ${sel.stone} stones and ${sel.engrave} engraving.`,
        budget:'', occasion:'', referenceUrl:'', timeline:'',
      })
      setSubmitted(true)
      showToast("Request submitted! We'll contact you within 24 hours. 💗")
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setSel({ product:'', metal:'', stone:'', engrave:'' })
    setEngraveText('')
    setContact({ name:user?.name||'', phone:'', email:user?.email||'', notes:'' })
    setShowForm(false)
    setSubmitted(false)
  }

  /* ── Success ─────────────────────────────────────────────────── */
  if (submitted) return (
    <div style={{ minHeight:'80vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'60px 5%', background:'#FFF5F8', textAlign:'center' }}>
      <div style={{ width:80, height:80, borderRadius:'50%', background:'#FCE4EC', border:'2px solid #C2185B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, marginBottom:24 }}>✨</div>
      <div style={{ fontSize:11, letterSpacing:'.2em', textTransform:'uppercase', color:'#C2185B', fontWeight:600, marginBottom:12 }}>Request Received</div>
      <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(26px,3.5vw,40px)', fontWeight:600, color:'#880E4F', marginBottom:16, lineHeight:1.1 }}>Your Dream Piece is in the Works</h1>
      <p style={{ fontSize:14, color:'#777', lineHeight:1.8, marginBottom:24, maxWidth:460 }}>Our design team will reach out on <strong>{contact.phone}</strong> within 24 hours.</p>
      <div style={{ background:'#fff', border:'1px solid #F48FB1', borderRadius:16, padding:'20px 24px', marginBottom:28, maxWidth:400, width:'100%', textAlign:'left' }}>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'#bbb', marginBottom:12 }}>Your Custom Order</div>
        {[['Product',sel.product],['Metal Finish',sel.metal],['Stone',sel.stone],['Engraving',sel.engrave+(engraveText?` — "${engraveText}"`:'')]].map(([k,v])=>(
          <div key={k} style={{ display:'flex', gap:12, paddingBottom:8, marginBottom:8, borderBottom:'1px solid #FCE4EC' }}>
            <span style={{ fontSize:11, fontWeight:700, color:'#bbb', minWidth:90, flexShrink:0, textTransform:'uppercase', letterSpacing:'.06em' }}>{k}</span>
            <span style={{ fontSize:13, color:'#333', fontWeight:600 }}>{v}</span>
          </div>
        ))}
        <div style={{ fontSize:11, color:'#aaa', marginTop:4 }}>Next: consultation → 3D sketch → crafting → delivery 🎁</div>
      </div>
      <div style={{ display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center' }}>
        <button className="btn-pink" onClick={() => navigate('/')}>Back to Home</button>
        <button className="btn-outline" onClick={reset}>New Request</button>
      </div>
    </div>
  )

  /* ── Main Page ───────────────────────────────────────────────── */
  return (
    <div style={{ background:'#FFF5F8' }}>

      {/* HERO */}
      <div style={{ background:'linear-gradient(135deg,#FFF0F5 0%,#FCE4EC 55%,#FFF0F5 100%)', padding:'clamp(28px,5vw,56px) 5%', borderBottom:'1px solid #F8BBD0', display:'flex', alignItems:'center', gap:'clamp(20px,4vw,56px)', flexWrap:'wrap', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, opacity:.05, backgroundImage:'radial-gradient(circle,#C2185B 1px,transparent 1px)', backgroundSize:'22px 22px', pointerEvents:'none' }} />
        <div style={{ flex:'1 1 240px', position:'relative', zIndex:2 }}>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(30px,5.5vw,58px)', fontWeight:600, color:'#880E4F', lineHeight:1.1, fontStyle:'italic', marginBottom:14 }}>Create Your Own<br />Jewellery</h1>
          <p style={{ fontSize:15, color:'#AD1457', fontStyle:'italic', marginBottom:28, opacity:.9 }}>"Design it your way, wear it your style."</p>
          <button className="btn-pink" style={{ padding:'13px 36px', fontSize:14, borderRadius:30 }} onClick={() => document.getElementById('step-selector')?.scrollIntoView({ behavior:'smooth' })}>Customize Now</button>
        </div>
        <div style={{ flex:'1 1 200px', position:'relative', zIndex:2, maxWidth:340, width:'100%' }}>
          <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&auto=format&fit=crop&q=90" alt="Personalized couple rings" style={{ width:'100%', borderRadius:20, display:'block', boxShadow:'0 12px 40px rgba(194,24,91,.18)' }} onError={e=>{ e.currentTarget.onerror=null; e.currentTarget.src='https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=700&auto=format&fit=crop&q=90' }} />
        </div>
      </div>

      {/* 4-STEP VISUAL SELECTOR */}
      <section id="step-selector" style={{ padding:'clamp(24px,4vw,48px) 5%' }}>
        <div style={{ background:'#FFF0F5', border:'1.5px solid #F8BBD0', borderRadius:20, padding:'clamp(18px,3vw,32px)', maxWidth:820, margin:'0 auto', boxShadow:'0 4px 32px rgba(194,24,91,.09)' }}>

          {/* progress bar */}
          <div style={{ display:'flex', gap:6, marginBottom:24 }}>
            {['product','metal','stone','engrave'].map((k,i) => (
              <div key={k} style={{ flex:1, height:4, borderRadius:4, background:sel[k]?'#C2185B':'#F8BBD0', transition:'background .3s' }} />
            ))}
          </div>

          {/* ROW 1 */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20, marginBottom:20 }}>
            <div>
              <StepBadge n="1" label="Step 1: Choose Product" done={!!sel.product} active={!sel.product} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {PRODUCTS.map(p => <Tile key={p.label} item={p} selected={sel.product===p.label} onClick={()=>pick('product',p.label)} />)}
              </div>
            </div>
            <div>
              <StepBadge n="2" label="Step 2: Select Metal" done={!!sel.metal} active={!!sel.product&&!sel.metal} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {METAL_CHOICES.map(m => <Tile key={m.label} item={m} selected={sel.metal===m.label} onClick={()=>pick('metal',m.label)} />)}
              </div>
            </div>
          </div>

          {/* ROW 2 */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            <div>
              <StepBadge n="3" label="Step 3: Pick a Stone" done={!!sel.stone} active={!!sel.metal&&!sel.stone} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                {STONE_CHOICES.map(s => <Tile key={s.label} item={s} selected={sel.stone===s.label} onClick={()=>pick('stone',s.label)} />)}
              </div>
            </div>
            <div>
              <StepBadge n="4" label="Step 4: Add Engraving" done={!!sel.engrave} active={!!sel.stone&&!sel.engrave} />
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {ENGRAVE_CHOICES.map(en => <Tile key={en.label} item={en} selected={sel.engrave===en.label} onClick={()=>pick('engrave',en.label)} />)}
              </div>
            </div>
          </div>

          {/* selection chips */}
          {(sel.product||sel.metal||sel.stone||sel.engrave) && (
            <div style={{ marginTop:20, padding:'14px 16px', background:'#fff', borderRadius:12, border:'1px solid #F8BBD0', display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:11, fontWeight:700, color:'#aaa', textTransform:'uppercase', letterSpacing:'.08em', marginRight:4 }}>Selected:</span>
              {sel.product && <span style={{ padding:'4px 12px', borderRadius:20, background:'#FCE4EC', color:'#C2185B', fontSize:12, fontWeight:600 }}>💗 {sel.product}</span>}
              {sel.metal   && <span style={{ padding:'4px 12px', borderRadius:20, background:'#FCE4EC', color:'#C2185B', fontSize:12, fontWeight:600 }}>✦ {sel.metal}</span>}
              {sel.stone   && <span style={{ padding:'4px 12px', borderRadius:20, background:'#FCE4EC', color:'#C2185B', fontSize:12, fontWeight:600 }}>💎 {sel.stone}</span>}
              {sel.engrave && <span style={{ padding:'4px 12px', borderRadius:20, background:'#FCE4EC', color:'#C2185B', fontSize:12, fontWeight:600 }}>✏️ {sel.engrave}</span>}
            </div>
          )}

          {/* CTA */}
          <div style={{ textAlign:'center', marginTop:24 }}>
            <div style={{ height:1, background:'linear-gradient(to right,transparent,#F48FB1,transparent)', marginBottom:20 }} />
            <button
              className="btn-pink"
              style={{ padding:'13px 64px', fontSize:14, borderRadius:30, letterSpacing:'.06em', opacity:allSelected?1:.55, cursor:allSelected?'pointer':'default', transition:'opacity .2s' }}
              onClick={() => {
                if (!allSelected) { showToast('Please complete all 4 steps first 💗'); return }
                setShowForm(true)
                setTimeout(()=>document.getElementById('cj-contact')?.scrollIntoView({ behavior:'smooth', block:'start' }), 100)
              }}
            >
              {allSelected ? 'Customize Now →' : `Complete All Steps (${[sel.product,sel.metal,sel.stone,sel.engrave].filter(Boolean).length}/4)`}
            </button>
            {!allSelected && <p style={{ marginTop:10, fontSize:12, color:'#bbb' }}>Select one option from each step above</p>}
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      {showForm && (
        <section id="cj-contact" style={{ padding:'0 5% clamp(24px,4vw,48px)' }}>
          <div style={{ maxWidth:820, margin:'0 auto' }}>
            <div style={{ background:'#fff', border:'1.5px solid #F8BBD0', borderRadius:20, padding:'clamp(20px,3vw,36px)', boxShadow:'0 4px 24px rgba(194,24,91,.07)' }}>
              <div style={{ textAlign:'center', marginBottom:28 }}>
                <div style={{ fontSize:11, letterSpacing:'.2em', textTransform:'uppercase', color:'#C2185B', fontWeight:600, marginBottom:8 }}>✦ Almost There</div>
                <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:'clamp(22px,3vw,34px)', fontWeight:600, color:'#880E4F', margin:0 }}>Enter Your Details</h2>
                <p style={{ fontSize:13, color:'#999', marginTop:8 }}>We'll contact you within 24 hours to confirm your order</p>
              </div>

              {/* engraving text */}
              {sel.engrave && (
                <div style={{ marginBottom:18, padding:16, background:'#FFF5F8', borderRadius:12, border:'1px solid #F8BBD0' }}>
                  <label style={lbl}>✏️ Engraving Text ({sel.engrave})</label>
                  <input style={inputStyle} placeholder={sel.engrave==='Name / Date'?'e.g. Aarav ♥ Simran  or  22.05.2024':'e.g. Forever & Always'} value={engraveText} onChange={e=>setEngraveText(e.target.value)} />
                </div>
              )}

              {/* contact fields — responsive grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16, marginBottom:18 }}>
                <div>
                  <label style={lbl}>Full Name *</label>
                  <input style={inputStyle} placeholder="Your name" value={contact.name} onChange={e=>setContact(c=>({...c,name:e.target.value}))} />
                </div>
                <div>
                  <label style={lbl}>Phone *</label>
                  <input style={inputStyle} type="tel" placeholder="+91 98765 43210" value={contact.phone} onChange={e=>setContact(c=>({...c,phone:e.target.value}))} />
                </div>
                <div>
                  <label style={lbl}>Email *</label>
                  <input style={inputStyle} type="email" placeholder="your@email.com" value={contact.email} onChange={e=>setContact(c=>({...c,email:e.target.value}))} />
                </div>
              </div>

              <div style={{ marginBottom:24 }}>
                <label style={lbl}>Additional Notes <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0, color:'#ccc' }}>(optional)</span></label>
                <textarea style={{...inputStyle,resize:'vertical'}} rows={3} placeholder="Ring size, occasion, budget range, special requests…" value={contact.notes} onChange={e=>setContact(c=>({...c,notes:e.target.value}))} />
              </div>

              {/* order summary */}
              <div style={{ background:'#FFF5F8', border:'1px solid #F8BBD0', borderRadius:12, padding:'14px 16px', marginBottom:24, display:'flex', flexWrap:'wrap', gap:10, alignItems:'center' }}>
                <span style={{ fontSize:11, fontWeight:700, color:'#bbb', textTransform:'uppercase', letterSpacing:'.08em' }}>Order:</span>
                {[['Product',sel.product],['Metal',sel.metal],['Stone',sel.stone],['Engraving',sel.engrave]].map(([k,v])=>v&&(
                  <div key={k} style={{ display:'flex', gap:4, alignItems:'center' }}>
                    <span style={{ fontSize:10, color:'#bbb', textTransform:'uppercase', letterSpacing:'.06em', fontWeight:700 }}>{k}:</span>
                    <span style={{ fontSize:12, color:'#C2185B', fontWeight:700, padding:'2px 10px', borderRadius:20, background:'#FCE4EC' }}>{v}</span>
                  </div>
                ))}
              </div>

              <button onClick={handleSubmit} disabled={!contactValid||submitting} style={{ width:'100%', padding:15, borderRadius:12, background:contactValid&&!submitting?'#C2185B':'#eee', color:contactValid&&!submitting?'#fff':'#bbb', border:'none', cursor:contactValid&&!submitting?'pointer':'not-allowed', fontSize:14, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', fontFamily:"'Jost',sans-serif", transition:'background .2s' }}>
                {submitting ? 'Submitting…' : 'Submit Custom Request ✨'}
              </button>
              <p style={{ fontSize:11, color:'#bbb', textAlign:'center', marginTop:12, lineHeight:1.6 }}>No payment required. Our team contacts you within 24 hours.</p>
            </div>
          </div>
        </section>
      )}

      {/* SOCIAL PROOF */}
      <section style={{ background:'#fff', padding:'clamp(24px,4vw,40px) 5%', borderTop:'1px solid #FCE4EC' }}>
        <div style={{ maxWidth:820, margin:'0 auto', display:'flex', alignItems:'stretch', gap:20, flexWrap:'wrap' }}>

          {/* Instagram */}
          <div style={{ flex:'1 1 180px', border:'1.5px solid #F8BBD0', borderRadius:16, padding:16, background:'#FFF8FB', minWidth:170 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#FCE4EC,#F48FB1)', border:'1.5px solid #C2185B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#C2185B' }}>A</div>
                <span style={{ fontSize:12, fontWeight:700, letterSpacing:'.1em', color:'#880E4F' }}>ADORE</span>
              </div>
              <div style={{ display:'flex', gap:6 }}>
                <span style={{ fontSize:16, color:'#C2185B' }}>♥</span>
                <span style={{ fontSize:14, color:'#aaa' }}>☰</span>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#FCE4EC,#F48FB1)', border:'2px solid #C2185B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#C2185B', flexShrink:0 }}>A</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:'#880E4F' }}>Adore 💎</div>
                <div style={{ fontSize:10, color:'#aaa' }}>Premium Silver jewellery 💙</div>
              </div>
            </div>
            <div style={{ fontSize:11, color:'#666', lineHeight:1.8, marginBottom:10 }}>Premium Silver Jewellery 💙<br />Made for Love & Emotions ❤️<br />925 Hallmarked ✔️<br />Shop Now 🛍️</div>
            <div onClick={()=>navigate('/shop')} style={{ background:'#D4A96A', color:'#4A2C0A', textAlign:'center', padding:8, borderRadius:8, fontSize:12, fontWeight:700, letterSpacing:'.1em', cursor:'pointer' }}>SEND</div>
            <div style={{ display:'flex', justifyContent:'space-around', marginTop:10, paddingTop:10, borderTop:'1px solid #FCE4EC' }}>
              {[['1,254','Posts'],['57.8k','Following']].map(([val,lb])=>(
                <div key={lb} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#880E4F' }}>{val}</div>
                  <div style={{ fontSize:10, color:'#aaa' }}>{lb}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges */}
          <div style={{ flex:'1 1 120px', display:'flex', flexDirection:'row', flexWrap:'wrap', justifyContent:'center', alignItems:'center', gap:20 }}>
            {FEATURES.map(f=>(
              <div key={f.label} style={{ textAlign:'center', minWidth:80 }}>
                <div style={{ fontSize:28, marginBottom:4 }}>{f.icon}</div>
                <div style={{ fontSize:12, fontWeight:700, color:'#880E4F', lineHeight:1.4, whiteSpace:'pre-line' }}>{f.label}</div>
              </div>
            ))}
          </div>

          {/* WhatsApp */}
          <div style={{ flex:'1 1 180px', border:'1.5px solid #F8BBD0', borderRadius:16, padding:16, background:'#FFF8FB', minWidth:170, overflow:'hidden' }}>
            <div style={{ background:'#D4A96A', color:'#4A2C0A', padding:'10px 12px', borderRadius:'10px 10px 0 0', margin:'-16px -16px 12px', fontSize:12, fontWeight:700, display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:16 }}>💬</span> HI Adore 💙
            </div>
            <div style={{ fontSize:12, color:'#666', marginBottom:10 }}>I want to customize jewellery</div>
            {[['Product:', sel.product||'________________'], ['Name / Text:', engraveText||'________________'], ['Finish:', sel.metal||'________________'], ['Budget:', '________________']].map(([k,v])=>(
              <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:11, marginBottom:7 }}>
                <span style={{ fontWeight:600, color:'#880E4F' }}>{k}</span>
                <span style={{ color:v==='________________'?'#ddd':'#C2185B', fontSize:10, fontWeight:v==='________________'?400:700 }}>{v}</span>
              </div>
            ))}
            <div style={{ background:'#D4A96A', color:'#4A2C0A', textAlign:'right', padding:'8px 12px', borderRadius:8, fontSize:12, fontWeight:700, marginTop:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4 }}>SEND <span style={{ fontSize:14 }}>✈</span></div>
          </div>
        </div>
      </section>

    </div>
  )
}

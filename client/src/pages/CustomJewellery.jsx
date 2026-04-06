import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const STEPS = [
  { n: 1, label: 'Design Brief', icon: '✏️' },
  { n: 2, label: 'Material & Budget', icon: '💎' },
  { n: 3, label: 'Your Details', icon: '👤' },
  { n: 4, label: 'Confirm', icon: '✅' },
]

const JEWELLERY_TYPES = ['Ring', 'Necklace', 'Earrings', 'Bracelet', 'Pendant', 'Bangle', 'Chain', 'Other']
const OCCASIONS = ['Wedding', 'Engagement', 'Anniversary', 'Birthday', 'Festival', 'Daily Wear', 'Corporate Gift', 'Other']
const METALS = ['18K Yellow Gold', '18K White Gold', '18K Rose Gold', '22K Yellow Gold', '925 Sterling Silver', 'Platinum']
const BUDGETS = ['₹5,000 – ₹15,000', '₹15,000 – ₹30,000', '₹30,000 – ₹60,000', '₹60,000 – ₹1,00,000', '₹1,00,000+']

const WHY_CUSTOM = [
  { icon: '💍', title: 'Uniquely Yours', desc: 'One-of-a-kind pieces designed exclusively for you' },
  { icon: '🎨', title: 'Expert Craftsmanship', desc: 'Master artisans with 20+ years of experience' },
  { icon: '🔬', title: 'Certified Materials', desc: 'BIS hallmarked gold and IGI certified stones' },
  { icon: '📐', title: 'Precise to Spec', desc: 'Every detail crafted to your exact requirements' },
  { icon: '🤝', title: 'Dedicated Designer', desc: 'Personal design consultation throughout the process' },
  { icon: '⏱️', title: 'Timely Delivery', desc: 'Completed in 3–6 weeks with regular updates' },
]

export default function CustomJewellery() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    type: '', occasion: '', description: '', metal: '', budget: '', gemstones: '', referenceUrl: '',
    name: user?.name || '', phone: '', email: user?.email || '', timeline: '', notes: '',
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))
  const setVal = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const isStep1Valid = form.type && form.occasion && form.description.length >= 20
  const isStep2Valid = form.metal && form.budget
  const isStep3Valid = form.name && form.phone && form.email

  const handleSubmit = () => {
    setSubmitted(true)
    showToast('Customization request submitted! We\'ll contact you within 24 hours.')
  }

  if (submitted) {
    return (
      <div style={{ padding: 'clamp(24px,4vw,48px) 5%', maxWidth: 640, margin: '0 auto', textAlign: 'center', paddingTop: 80 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gold-bg)', border: '2px solid var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px' }}>✨</div>
        <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 12 }}>Request Received</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 16, lineHeight: 1.1 }}>Your Dream Piece is in the Works</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-60)', lineHeight: 1.8, marginBottom: 32 }}>
          Our design team will review your brief and reach out within 24 hours on <strong>{form.phone}</strong> to discuss your vision. A dedicated designer will be assigned to your project.
        </p>
        <div style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: 4, padding: '20px 24px', marginBottom: 32, textAlign: 'left' }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 12 }}>What Happens Next</div>
          {['Design consultation call within 24 hrs', '3D sketch & concept presentation in 3–5 days', 'Material selection & finalization', 'Crafting begins (3–5 weeks)', 'Quality check & delivery'].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 4 ? 10 : 0 }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--gold)', color: '#fff', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: "'Jost',sans-serif" }}>{i + 1}</span>
              <span style={{ fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.5 }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-gold" onClick={() => navigate('/')}>Back to Home</button>
          <button className="btn-outline" onClick={() => { setSubmitted(false); setStep(1); setForm({ type: '', occasion: '', description: '', metal: '', budget: '', gemstones: '', referenceUrl: '', name: user?.name || '', phone: '', email: user?.email || '', timeline: '', notes: '' }) }}>New Request</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2A3B 60%, #0D1B2A 100%)', padding: 'clamp(48px,7vw,96px) 5%', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .04, backgroundImage: 'radial-gradient(circle, #B8975A 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: 'var(--gold-light)', fontWeight: 600, marginBottom: 16 }}>✦ Bespoke Jewellery ✦</div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,6vw,72px)', fontWeight: 600, color: '#fff', lineHeight: 1.05, fontStyle: 'italic', marginBottom: 16 }}>
            Design Your Dream<br />Piece
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', lineHeight: 1.8, maxWidth: 560, margin: '0 auto 32px' }}>
            From concept to creation — work with our master artisans to craft jewellery that tells your unique story.
          </p>
          <button className="btn-gold" style={{ padding: '15px 40px', fontSize: 13 }} onClick={() => document.getElementById('custom-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Start Your Request →
          </button>
        </div>
      </div>

      {/* Why Custom */}
      <section style={{ padding: 'clamp(40px,5vw,64px) 5%', background: 'var(--gold-bg)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Why Choose Bespoke</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 600, color: 'var(--ink)' }}>Crafted for You, By the Best</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 16 }}>
          {WHY_CUSTOM.map(w => (
            <div key={w.title} style={{ background: '#fff', border: '1px solid var(--gold-border)', borderRadius: 4, padding: '24px 20px', transition: 'box-shadow .2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(184,151,90,.15)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{w.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{w.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.6 }}>{w.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section id="custom-form" style={{ padding: 'clamp(40px,5vw,64px) 5%', maxWidth: 780, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Request Form</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 600, color: 'var(--ink)' }}>Tell Us Your Vision</h2>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40, overflowX: 'auto' }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, cursor: s.n < step ? 'pointer' : 'default' }} onClick={() => s.n < step && setStep(s.n)}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: step >= s.n ? 'var(--gold)' : 'var(--gold-bg)', border: `2px solid ${step >= s.n ? 'var(--gold)' : 'var(--gold-border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, transition: 'all .2s' }}>
                  {step > s.n ? '✓' : s.icon}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: step >= s.n ? 'var(--gold)' : 'var(--ink-40)', whiteSpace: 'nowrap' }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: step > s.n ? 'var(--gold)' : 'var(--gold-border)', margin: '0 8px', marginBottom: 22, transition: 'background .3s' }} />}
            </div>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, marginBottom: 24 }}>What would you like to create?</h3>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 10 }}>Type of Jewellery *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {JEWELLERY_TYPES.map(t => (
                  <button key={t} onClick={() => setVal('type', t)} style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${form.type === t ? 'var(--gold)' : 'var(--ink-20)'}`, background: form.type === t ? 'var(--gold-bg)' : '#fff', color: form.type === t ? 'var(--gold)' : 'var(--ink-60)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', fontFamily: "'Jost',sans-serif" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 10 }}>Occasion *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {OCCASIONS.map(o => (
                  <button key={o} onClick={() => setVal('occasion', o)} style={{ padding: '8px 16px', borderRadius: 20, border: `1.5px solid ${form.occasion === o ? 'var(--gold)' : 'var(--ink-20)'}`, background: form.occasion === o ? 'var(--gold-bg)' : '#fff', color: form.occasion === o ? 'var(--gold)' : 'var(--ink-60)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', fontFamily: "'Jost',sans-serif" }}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Describe Your Vision * <span style={{ fontSize: 10, color: 'var(--ink-40)', textTransform: 'none', letterSpacing: 0 }}>(min. 20 characters)</span></label>
              <textarea
                value={form.description}
                onChange={set('description')}
                placeholder="Describe the design, style, motifs, or any specific elements you have in mind. The more detail, the better we can bring your vision to life…"
                rows={5}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--ink-15)', borderRadius: 4, fontSize: 14, fontFamily: "'Jost',sans-serif", resize: 'vertical', outline: 'none', lineHeight: 1.6, color: 'var(--ink)' }}
              />
              <div style={{ fontSize: 11, color: form.description.length >= 20 ? '#2e7d32' : 'var(--ink-40)', textAlign: 'right', marginTop: 4 }}>{form.description.length} chars</div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Reference Image URL <span style={{ fontSize: 10, textTransform: 'none', letterSpacing: 0, color: 'var(--ink-40)'}}>(optional)</span></label>
              <input className="input-field" placeholder="https://pinterest.com/pin/... or any image link for reference" value={form.referenceUrl} onChange={set('referenceUrl')} />
            </div>
            <button className="btn-gold" style={{ width: '100%', padding: '15px' }} disabled={!isStep1Valid} onClick={() => setStep(2)} style={{ width: '100%', padding: '15px', background: isStep1Valid ? 'var(--gold)' : 'var(--ink-20)', color: '#fff', border: 'none', borderRadius: 2, cursor: isStep1Valid ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: "'Jost',sans-serif" }}>
              Continue to Materials →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Material Preferences & Budget</h3>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 10 }}>Preferred Metal *</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {METALS.map(m => (
                  <button key={m} onClick={() => setVal('metal', m)} style={{ padding: '10px 16px', borderRadius: 4, border: `1.5px solid ${form.metal === m ? 'var(--gold)' : 'var(--ink-20)'}`, background: form.metal === m ? 'var(--gold-bg)' : '#fff', color: form.metal === m ? 'var(--gold)' : 'var(--ink-60)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', fontFamily: "'Jost',sans-serif" }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 10 }}>Budget Range *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {BUDGETS.map(b => (
                  <button key={b} onClick={() => setVal('budget', b)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 4, border: `1.5px solid ${form.budget === b ? 'var(--gold)' : 'var(--ink-20)'}`, background: form.budget === b ? 'var(--gold-bg)' : '#fff', cursor: 'pointer', transition: 'all .2s', fontFamily: "'Jost',sans-serif" }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: form.budget === b ? 'var(--gold)' : 'var(--ink)' }}>{b}</span>
                    {form.budget === b && <span style={{ fontSize: 16, color: 'var(--gold)' }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Gemstones / Diamonds <span style={{ fontSize: 10, textTransform: 'none', letterSpacing: 0, color: 'var(--ink-40)' }}>(optional)</span></label>
              <input className="input-field" placeholder="e.g. 1 solitaire diamond 0.5ct, 4 ruby accents, no stones, etc." value={form.gemstones} onChange={set('gemstones')} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-outline" style={{ flex: 1, padding: '15px' }} onClick={() => setStep(1)}>← Back</button>
              <button style={{ flex: 2, padding: '15px', background: isStep2Valid ? 'var(--gold)' : 'var(--ink-20)', color: '#fff', border: 'none', borderRadius: 2, cursor: isStep2Valid ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: "'Jost',sans-serif" }} disabled={!isStep2Valid} onClick={() => setStep(3)}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Your Contact Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Full Name *</label>
                <input className="input-field" value={form.name} onChange={set('name')} placeholder="Your name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Phone *</label>
                <input className="input-field" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Email *</label>
                <input className="input-field" type="email" value={form.email} onChange={set('email')} placeholder="your@email.com" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Preferred Timeline</label>
                <select className="input-field" value={form.timeline} onChange={set('timeline')} style={{ cursor: 'pointer' }}>
                  <option value="">Select timeline</option>
                  <option>As soon as possible (3–4 weeks)</option>
                  <option>1–2 months</option>
                  <option>2–3 months</option>
                  <option>No rush (3+ months)</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-60)', marginBottom: 8 }}>Additional Notes</label>
                <textarea className="input-field" value={form.notes} onChange={set('notes')} placeholder="Any other details, special requests, or questions…" rows={3} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-outline" style={{ flex: 1, padding: '15px' }} onClick={() => setStep(2)}>← Back</button>
              <button style={{ flex: 2, padding: '15px', background: isStep3Valid ? 'var(--gold)' : 'var(--ink-20)', color: '#fff', border: 'none', borderRadius: 2, cursor: isStep3Valid ? 'pointer' : 'not-allowed', fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', fontFamily: "'Jost',sans-serif" }} disabled={!isStep3Valid} onClick={() => setStep(4)}>
                Review Request →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 600, marginBottom: 24 }}>Review & Submit</h3>
            <div style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: 4, padding: 24, marginBottom: 24 }}>
              {[
                { label: 'Jewellery Type', val: form.type },
                { label: 'Occasion', val: form.occasion },
                { label: 'Metal', val: form.metal },
                { label: 'Budget', val: form.budget },
                { label: 'Gemstones', val: form.gemstones || 'Not specified' },
                { label: 'Your Name', val: form.name },
                { label: 'Phone', val: form.phone },
                { label: 'Email', val: form.email },
                { label: 'Timeline', val: form.timeline || 'Not specified' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', gap: 16, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--gold-border)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-40)', minWidth: 120, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>{row.val}</span>
                </div>
              ))}
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-40)', display: 'block', marginBottom: 6 }}>Design Brief</span>
                <span style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6 }}>{form.description}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-outline" style={{ flex: 1, padding: '15px' }} onClick={() => setStep(3)}>← Back</button>
              <button className="btn-gold" style={{ flex: 2, padding: '15px' }} onClick={handleSubmit}>
                Submit Request ✨
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-40)', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>By submitting, you agree that our team may contact you about your request. No payment required at this stage.</p>
          </div>
        )}
      </section>
    </div>
  )
}

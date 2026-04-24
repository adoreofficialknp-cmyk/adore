import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FAQS = [
  { q: 'How do I track my order?', a: 'Once your order is shipped, you\'ll receive a tracking link via email and SMS. You can also check your order status in My Orders section of your profile.' },
  { q: 'What is your return policy?', a: 'We offer a 30-day hassle-free return policy. Items must be in original condition with all tags intact. Simply initiate a return from My Orders and we\'ll arrange a pickup.' },
  { q: 'Is my jewellery BIS Hallmarked?', a: 'Yes! Every gold piece from ADORE is BIS Hallmarked as per Government of India standards. Our diamonds are IGI/GIA certified. Certificates are included with each purchase.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 5–7 business days. Express delivery (2–3 days) is available for most cities. All deliveries are insured and tracked.' },
  { q: 'Can I get jewellery customized?', a: 'Absolutely! We offer bespoke jewellery customization. Visit our Customization Request page or contact our design team via live chat to discuss your vision.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, wallets via Razorpay and Cashfree. Cash on Delivery is also available for orders up to ₹50,000.' },
  { q: 'How do I know my ring size?', a: 'Use our Ring Sizer tool in the Profile section for an accurate measurement. You can also visit a nearby jeweller or download our printable ring sizer guide.' },
  { q: 'Do you offer EMI?', a: 'Yes, EMI options are available on credit cards (No Cost EMI on select cards) for orders above ₹5,000. Options will be displayed at checkout based on your card.' },
]

const TOPICS = [
  { icon: '📦', label: 'Orders & Shipping', desc: 'Track, cancel, or modify orders' },
  { icon: '↩️', label: 'Returns & Refunds', desc: 'Return policy and process' },
  { icon: '💎', label: 'Product Info', desc: 'Certifications, materials, sizing' },
  { icon: '💳', label: 'Payments', desc: 'Methods, EMI, failed transactions' },
  { icon: '✨', label: 'Customization', desc: 'Bespoke jewellery requests' },
  { icon: '🔐', label: 'Account & Security', desc: 'Profile, password, privacy' },
]

export default function HelpSupport() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMsg, setChatMsg] = useState('')
  const [chatHistory, setChatHistory] = useState([
    { from: 'bot', text: 'Hello! 👋 Welcome to ADORE support. How can I help you today?' }
  ])

  const sendChat = () => {
    if (!chatMsg.trim()) return
    const userMsg = chatMsg.trim()
    setChatHistory(h => [...h, { from: 'user', text: userMsg }])
    setChatMsg('')
    setTimeout(() => {
      setChatHistory(h => [...h, {
        from: 'bot',
        text: 'Thank you for reaching out! Our jewellery expert will connect with you shortly. For urgent queries, call us at 1800-ADORE-01 (9am–9pm IST).'
      }])
    }, 1200)
  }

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%', maxWidth: 860, margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-60)', fontSize: 13, fontWeight: 600, fontFamily: "'Jost',sans-serif", marginBottom: 28, padding: 0 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </button>

      <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Support</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.1 }}>Help & Support</h1>
      <p style={{ fontSize: 14, color: 'var(--ink-60)', marginBottom: 36, lineHeight: 1.6 }}>We're here to help. Find answers, or connect with our team.</p>

      {/* Topics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 12, marginBottom: 48 }}>
        {TOPICS.map(t => (
          <div key={t.label} style={{ padding: '18px 20px', border: '1px solid var(--gold-border)', borderRadius: 4, background: 'var(--gold-bg)', cursor: 'pointer', transition: 'box-shadow .2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(184,151,90,.15)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{t.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-60)' }}>{t.desc}</div>
          </div>
        ))}
      </div>

      {/* FAQs */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>FAQs</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 600, marginBottom: 24 }}>Frequently Asked Questions</h2>
        <div style={{ border: '1px solid var(--ink-10)', borderRadius: 4, overflow: 'hidden' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid var(--ink-10)' : 'none' }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', background: openFaq === i ? 'var(--gold-bg)' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16, transition: 'background .2s' }}
              >
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>{faq.q}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', background: 'var(--gold-bg)', fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16, marginBottom: 48 }}>
        {[
          { icon: '📞', label: 'Call Us', val: '1800-ADORE-01', sub: 'Mon–Sun, 9am–9pm IST' },
          { icon: '✉️', label: 'Email Us', val: 'support@adore.in', sub: 'Reply within 24 hours' },
          { icon: '💬', label: 'Live Chat', val: 'Chat Now', sub: 'Instant support', action: () => setChatOpen(true) },
        ].map(c => (
          <div key={c.label} onClick={c.action} style={{ padding: '24px 20px', textAlign: 'center', border: '1px solid var(--gold-border)', borderRadius: 4, background: '#fff', cursor: c.action ? 'pointer' : 'default', transition: 'box-shadow .2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(184,151,90,.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-40)', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: c.action ? 'var(--gold)' : 'var(--ink)', marginBottom: 4 }}>{c.val}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-40)' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Live Chat Widget */}
      {chatOpen && (
        <div style={{ position: 'fixed', bottom: 80, right: 20, width: 320, background: '#fff', borderRadius: 12, boxShadow: '0 8px 40px rgba(0,0,0,.18)', zIndex: 1000, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--gold-border)' }}>
          <div style={{ background: 'var(--ink)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💎</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>ADORE Support</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4caf50', display: 'inline-block' }}></span>
                  Online
                </div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.6)', padding: 4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260 }}>
            {chatHistory.map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{ maxWidth: '80%', padding: '10px 13px', borderRadius: m.from === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: m.from === 'user' ? 'var(--gold)' : 'var(--gold-bg)', color: m.from === 'user' ? '#fff' : 'var(--ink)', fontSize: 13, lineHeight: 1.5, border: m.from === 'bot' ? '1px solid var(--gold-border)' : 'none' }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--ink-10)', display: 'flex', gap: 8 }}>
            <input
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Type a message…"
              style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--ink-10)', borderRadius: 20, fontSize: 13, outline: 'none', fontFamily: "'Jost',sans-serif" }}
            />
            <button onClick={sendChat} style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--gold)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* Float chat button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          style={{ position: 'fixed', bottom: 80, right: 20, width: 52, height: 52, borderRadius: '50%', background: 'var(--gold)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(184,151,90,.4)', zIndex: 999 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </button>
      )}
    </div>
  )
}

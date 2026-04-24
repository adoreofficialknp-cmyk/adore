import { useNavigate } from 'react-router-dom'

const SECTIONS = [
  {
    title: 'Information We Collect',
    content: `We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This includes your name, email address, phone number, delivery address, and payment information. We also automatically collect certain technical data when you use our services, including your IP address, browser type, pages visited, and browsing behaviour on our site.`
  },
  {
    title: 'How We Use Your Information',
    content: `We use the information we collect to process your orders and payments, deliver your jewellery, send order confirmations and shipping updates, provide customer support, personalise your shopping experience, send promotional offers (only with your consent), improve our products and services, and comply with legal obligations.`
  },
  {
    title: 'Information Sharing',
    content: `ADORE does not sell, trade, or rent your personal information to third parties. We share your data only with trusted partners necessary to operate our business — including payment processors (Razorpay, Cashfree), logistics providers, and cloud services — all bound by strict data protection agreements.`
  },
  {
    title: 'Payment Security',
    content: `All payment transactions are processed through PCI-DSS compliant payment gateways (Razorpay and Cashfree). We do not store your full card details on our servers. All data in transit is encrypted using 256-bit SSL/TLS encryption. Our systems are regularly audited for security compliance.`
  },
  {
    title: 'Cookies & Tracking',
    content: `We use cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, analyse site traffic, and serve relevant advertisements. You can control cookie settings through your browser. Disabling cookies may affect some features of our website.`
  },
  {
    title: 'Data Retention',
    content: `We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data at any time by contacting support@adore.in. We may retain certain data as required by law or for legitimate business purposes.`
  },
  {
    title: 'Your Rights',
    content: `You have the right to access, correct, or delete your personal data. You may opt out of marketing communications at any time. You can request a copy of your data in a portable format. To exercise any of these rights, contact us at privacy@adore.in. We will respond within 30 days.`
  },
  {
    title: 'Children\'s Privacy',
    content: `Our services are not directed to children under 18. We do not knowingly collect personal information from children. If we learn we have collected information from a child under 18, we will promptly delete it. Parents who believe their child has provided information to us should contact us immediately.`
  },
  {
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or by posting a prominent notice on our website. Your continued use of our services after changes take effect constitutes acceptance of the updated policy.`
  },
  {
    title: 'Contact Us',
    content: `For privacy-related queries, contact our Data Protection Officer at: privacy@adore.in | ADORE Fine Jewellery, 12 Luxury Lane, Bandra West, Mumbai 400050, Maharashtra, India. Phone: +91 98765 43210.`
  },
]

export default function PrivacyPolicy() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: 'clamp(24px,4vw,48px) 5%', maxWidth: 800, margin: '0 auto' }}>
      <button
        onClick={() => navigate(-1)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-60)', fontSize: 13, fontWeight: 600, fontFamily: "'Jost',sans-serif", marginBottom: 28, padding: 0 }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back
      </button>

      <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 600, marginBottom: 8 }}>Legal</div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(28px,3.5vw,42px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 8, lineHeight: 1.1 }}>Privacy Policy</h1>
      <p style={{ fontSize: 13, color: 'var(--ink-40)', marginBottom: 40, letterSpacing: '.04em' }}>Last updated: January 2025</p>

      <div style={{ background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', borderRadius: 4, padding: '20px 24px', marginBottom: 40, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Your privacy matters to us</div>
          <div style={{ fontSize: 13, color: 'var(--ink-60)', lineHeight: 1.6 }}>At ADORE Fine Jewellery, we are committed to protecting your personal information and being transparent about how we use it. This policy explains our practices clearly.</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {SECTIONS.map((s, i) => (
          <div key={i}>
            <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(18px,2vw,24px)', fontWeight: 600, color: 'var(--ink)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gold-bg)', border: '1px solid var(--gold-border)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--gold)', flexShrink: 0, fontFamily: "'Jost',sans-serif" }}>{i + 1}</span>
              {s.title}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-60)', lineHeight: 1.8, paddingLeft: 38 }}>{s.content}</p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48, padding: '24px', borderTop: '1px solid var(--ink-10)', textAlign: 'center', fontSize: 12, color: 'var(--ink-40)', lineHeight: 1.8 }}>
        © 2025 ADORE Fine Jewellery. All rights reserved.<br />
        By using our services, you agree to this Privacy Policy.
      </div>
    </div>
  )
}

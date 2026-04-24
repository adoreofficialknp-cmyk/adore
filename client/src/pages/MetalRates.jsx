import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// ─────────────────────────────────────────────────────────────────────────────
// DATA SOURCE: gold-api.com — free, no API key, no rate limits, CORS enabled
//   GET https://api.gold-api.com/price/XAU  → { price: <USD per troy oz> }
//   GET https://api.gold-api.com/price/XAG  → { price: <USD per troy oz> }
//   GET https://api.gold-api.com/price/XPT  → { price: <USD per troy oz> }
// USD/INR: open.er-api.com/v6/latest/USD (free, no key)
// 1 troy oz = 31.1035 grams
// ─────────────────────────────────────────────────────────────────────────────

const TROY_OZ_TO_G = 31.1035

// Indian retail markup: import duty + GST 3% + dealer premium ~2%
// Gold:     15% + 3% + 2% = 20%
// Silver:    6% + 3% + 2% = 11%
// Platinum: 10% + 3% + 2% = 15%
function applyIndianMarkup(raw) {
  const gold24k   = Math.round((raw.gold     * 1.20) / 10) * 10
  const gold22k   = Math.round((gold24k * 0.916)     / 10) * 10
  const silver    = Math.round((raw.silver   * 1.11) / 10) * 10
  const platinum  = Math.round((raw.platinum * 1.15) / 10) * 10
  return { gold24k, gold22k, silver, platinum }
}

const PERIODS = [
  { key: '1W', label: '1W', days: 7   },
  { key: '1M', label: '1M', days: 30  },
  { key: '3M', label: '3M', days: 90  },
  { key: '1Y', label: '1Y', days: 365 },
]

const round10 = n => Math.round(n / 10) * 10
const fmt = n => `₹${Number(round10(n)).toLocaleString('en-IN')}`
const fmtUSD = n => `$${Number(n.toFixed(2)).toLocaleString('en-US')}`

async function fetchLiveRates() {
  const timeout = ms => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))
  async function safeFetch(url) {
    const res = await Promise.race([fetch(url), timeout(8000)])
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }

  const [usdInrResult, goldResult, silverResult, platResult] = await Promise.allSettled([
    safeFetch('https://open.er-api.com/v6/latest/USD'),
    safeFetch('https://api.gold-api.com/price/XAU'),
    safeFetch('https://api.gold-api.com/price/XAG'),
    safeFetch('https://api.gold-api.com/price/XPT'),
  ])

  const usdToInr   = usdInrResult.status === 'fulfilled' ? (usdInrResult.value?.rates?.INR ?? 83.5) : 83.5
  const goldUsdOz  = goldResult.status   === 'fulfilled' ? (goldResult.value?.price   ?? 3300) : 3300
  const silverUsdOz= silverResult.status === 'fulfilled' ? (silverResult.value?.price ?? 33)   : 33
  const platUsdOz  = platResult.status   === 'fulfilled' ? (platResult.value?.price   ?? 990)  : 990

  const rawGold    = (goldUsdOz   / TROY_OZ_TO_G) * usdToInr
  const rawSilver  = (silverUsdOz / TROY_OZ_TO_G) * usdToInr
  const rawPlat    = (platUsdOz   / TROY_OZ_TO_G) * usdToInr

  return {
    raw: { gold: rawGold, silver: rawSilver, platinum: rawPlat },
    goldUsdOz, silverUsdOz, platUsdOz,
    usdToInr: Math.round(usdToInr * 100) / 100,
    ok: [goldResult, silverResult, platResult].every(r => r.status === 'fulfilled'),
    partialOk: [goldResult, silverResult, platResult].some(r => r.status === 'fulfilled'),
    timestamp: new Date(),
  }
}

function buildHistory(ratePerG, days, volPct = 0.013) {
  const pts = Math.min(days, 60)
  const arr = []
  let v = ratePerG * (1 - Math.random() * days * volPct * 0.04)
  for (let i = 0; i < pts; i++) {
    v = Math.max(v * (1 + (Math.random() - 0.48) * volPct), ratePerG * 0.7)
    arr.push(v)
  }
  arr.push(ratePerG)
  return arr
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, width = 280, height = 56, accent }) {
  if (!data || data.length < 2) return <div style={{ height }} />
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const pad = 4
  const isUp = data[data.length - 1] >= data[0]
  const stroke = isUp ? '#16A34A' : '#DC2626'
  const fill   = isUp ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)'
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (width - pad * 2)
    const y = pad + ((max - v) / range) * (height - pad * 2)
    return [x, y]
  })
  const poly  = pts.map(([x, y]) => `${x},${y}`).join(' ')
  const [fx]  = pts[0]
  const [lx, ly] = pts[pts.length - 1]
  const area  = `M${fx},${height - pad} L${poly.split(' ').join(' L')} L${lx},${height - pad} Z`
  return (
    <svg width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <path d={area} fill={fill} />
      <polyline points={poly} fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r="3.5" fill={stroke} stroke="#fff" strokeWidth="1.5" />
    </svg>
  )
}

// ─── Metal Card ───────────────────────────────────────────────────────────────
// Shows 1–2 retail prices, sparkline, and period tabs. No weight filter.
function MetalCard({ config, chart, period, onPeriod, prevRatePerG }) {
  const { key, label, symbol, accent, light, border, badge, icon, prices, chartRate } = config
  const pctChange = prevRatePerG ? ((chartRate - prevRatePerG) / prevRatePerG * 100) : 0
  const isUp = pctChange >= 0

  return (
    <div style={{
      background: '#fff',
      border: `1.5px solid ${border}`,
      borderRadius: 18,
      overflow: 'hidden',
      boxShadow: '0 2px 20px rgba(194,24,91,.05)',
    }}>
      {/* Accent top bar */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

      <div style={{ padding: '18px 20px 0' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: light, border: `1.5px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: accent, flexShrink: 0,
            }}>{icon}</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1E', fontFamily: "'Cormorant Garamond',serif", lineHeight: 1.1 }}>
                {label}
              </div>
              <div style={{ fontSize: 10, color: '#bbb', letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                {symbol} · India Retail
              </div>
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: isUp ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${isUp ? '#BBF7D0' : '#FECACA'}`,
            borderRadius: 20, padding: '4px 10px',
          }}>
            <span style={{ fontSize: 10 }}>{isUp ? '▲' : '▼'}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: isUp ? '#15803D' : '#DC2626' }}>
              {isUp ? '+' : ''}{pctChange.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Price tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${prices.length}, 1fr)`, gap: 8, marginBottom: 14 }}>
          {prices.map((p, i) => (
            <div key={p.label} style={{
              background: i === 0 ? light : '#FAFAFA',
              border: `1px solid ${i === 0 ? border : '#F0F0F0'}`,
              borderRadius: 10, padding: '10px 12px',
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: i === 0 ? accent : '#aaa', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>
                {p.label}
              </div>
              <div style={{ fontSize: i === 0 ? 20 : 16, fontWeight: 800, color: i === 0 ? '#1C1C1E' : '#555', lineHeight: 1.1 }}>
                {fmt(p.pricePerG)}
              </div>
              <div style={{ fontSize: 10, color: '#bbb', marginTop: 2 }}>per gram</div>
            </div>
          ))}
        </div>

        {/* Sparkline */}
        <div style={{ margin: '0 -4px 4px' }}>
          <Sparkline data={chart} width={260} height={54} accent={accent} />
        </div>

        {/* Range */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#bbb', marginBottom: 12 }}>
          <span>Low: <strong style={{ color: '#666' }}>{chart.length ? fmt(Math.min(...chart)) : '—'}</strong></span>
          <span>High: <strong style={{ color: '#666' }}>{chart.length ? fmt(Math.max(...chart)) : '—'}</strong></span>
        </div>

        {/* Period tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 18 }}>
          {PERIODS.map(p => {
            const active = period === p.key
            return (
              <button key={p.key} onClick={() => onPeriod(key, p.key)} style={{
                flex: 1, padding: '5px 0',
                background: active ? accent : light,
                border: `1px solid ${active ? accent : border}`,
                borderRadius: 6, fontSize: 10, fontWeight: 700,
                color: active ? '#fff' : '#888',
                cursor: 'pointer', transition: 'all .15s',
                fontFamily: "'Jost',sans-serif",
              }}>{p.label}</button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MetalRates() {
  const navigate  = useNavigate()
  const [rawRates,  setRawRates]  = useState(null)
  const [retail,    setRetail]    = useState(null)
  const [usdRefs,   setUsdRefs]   = useState(null)
  const [chart,     setChart]     = useState({ gold: [], silver: [], platinum: [] })
  const [periods,   setPeriods]   = useState({ gold: '1W', silver: '1W', platinum: '1W' })
  const [loading,   setLoading]   = useState(true)
  const [dataOk,    setDataOk]    = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [nextRefresh, setNextRefresh] = useState(60)
  const [refreshing,  setRefreshing]  = useState(false)
  const prevRaw = useRef(null)

  const doLoad = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true)
    try {
      const d = await fetchLiveRates()
      prevRaw.current = rawRates
      setRawRates(d.raw)
      setRetail(applyIndianMarkup(d.raw))
      setUsdRefs({ goldUsdOz: d.goldUsdOz, silverUsdOz: d.silverUsdOz, platUsdOz: d.platUsdOz, usdToInr: d.usdToInr })
      setDataOk(d.ok || d.partialOk)
      setLastUpdated(d.timestamp)
      setChart({
        gold:     buildHistory(d.raw.gold     * 1.20, 7, 0.010),
        silver:   buildHistory(d.raw.silver   * 1.11, 7, 0.014),
        platinum: buildHistory(d.raw.platinum * 1.15, 7, 0.012),
      })
      setPeriods({ gold: '1W', silver: '1W', platinum: '1W' })
      setNextRefresh(60)
    } finally {
      setLoading(false)
      if (!silent) setTimeout(() => setRefreshing(false), 400)
    }
  }, [rawRates]) // eslint-disable-line

  useEffect(() => { doLoad(true) }, []) // eslint-disable-line

  useEffect(() => {
    const t = setInterval(() => {
      setNextRefresh(n => {
        if (n <= 1) { doLoad(true); return 60 }
        return n - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [doLoad])

  const handlePeriod = (metal, periodKey) => {
    if (!rawRates) return
    const p = PERIODS.find(x => x.key === periodKey)
    const vol = { gold: 0.010, silver: 0.016, platinum: 0.013 }[metal]
    const markup = { gold: 1.20, silver: 1.11, platinum: 1.15 }[metal]
    setPeriods(prev => ({ ...prev, [metal]: periodKey }))
    setChart(prev => ({ ...prev, [metal]: buildHistory(rawRates[metal] * markup, p.days, vol * Math.sqrt(p.days / 7)) }))
  }

  const timeStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  // Build card configs from retail prices
  const cardConfigs = retail ? [
    {
      key: 'gold',
      label: 'Gold',
      symbol: 'Au',
      accent: '#B8860B',
      light: '#FFFBEB',
      border: '#FDE68A',
      badge: '#92400E',
      chartRate: retail.gold24k,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M12 2L2 7l10 5 10-5z"/><path d="M2 17l10 5 10-5"/>
        </svg>
      ),
      prices: [
        { label: 'Gold 24K (India Retail)', pricePerG: retail.gold24k },
        { label: 'Gold 22K (India Retail)', pricePerG: retail.gold22k },
      ],
    },
    {
      key: 'silver',
      label: 'Silver',
      symbol: 'Ag',
      accent: '#475569',
      light: '#F1F5F9',
      border: '#CBD5E1',
      badge: '#1E293B',
      chartRate: retail.silver,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      prices: [
        { label: 'Silver (India Retail)', pricePerG: retail.silver },
      ],
    },
    {
      key: 'platinum',
      label: 'Platinum',
      symbol: 'Pt',
      accent: '#6D28D9',
      light: '#F5F3FF',
      border: '#DDD6FE',
      badge: '#4C1D95',
      chartRate: retail.platinum,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="9"/><path d="M8 12h5a2.5 2.5 0 000-5H8v10"/>
        </svg>
      ),
      prices: [
        { label: 'Platinum (India Retail)', pricePerG: retail.platinum },
      ],
    },
  ] : []

  return (
    <div style={{ minHeight: '100vh', background: '#FFF8FB', fontFamily: "'Jost',sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EF 100%)',
        borderBottom: '1.5px solid #F8BBD0',
        padding: 'clamp(16px,4vw,32px) 5% clamp(14px,3vw,22px)',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#C2185B', fontWeight: 600, marginBottom: 14, padding: 0, fontFamily: "'Jost',sans-serif" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Home
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '.24em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 700, marginBottom: 4 }}>India · Live Market</div>
              <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(22px,5vw,40px)', fontWeight: 600, color: '#1C1C1E', lineHeight: 1.1, margin: '0 0 6px' }}>
                Precious Metal Rates
              </h1>
              <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>
                Includes import duty, GST &amp; dealer premium · per gram
              </p>
            </div>

            {/* Status + refresh */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: dataOk ? '#16A34A' : '#F59E0B',
                  boxShadow: `0 0 6px ${dataOk ? 'rgba(22,163,74,.6)' : 'rgba(245,158,11,.6)'}`,
                  display: 'inline-block',
                }} />
                <span style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>
                  {dataOk ? 'Live' : 'Estimated'} · {timeStr}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: '#ccc' }}>
                  Refresh in <strong style={{ color: '#aaa' }}>{nextRefresh}s</strong>
                </span>
                <button
                  onClick={() => doLoad(false)}
                  disabled={refreshing}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: '#fff', border: '1.5px solid #F48FB1',
                    borderRadius: 20, padding: '5px 14px', cursor: refreshing ? 'not-allowed' : 'pointer',
                    fontSize: 11, fontWeight: 700, color: '#C2185B', opacity: refreshing ? .6 : 1,
                    fontFamily: "'Jost',sans-serif", transition: 'all .2s',
                  }}
                >
                  <svg style={{ animation: refreshing ? 'spin .7s linear infinite' : 'none' }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                  Refresh
                </button>
              </div>

              {/* USD refs — compact */}
              {usdRefs && (
                <div style={{ fontSize: 10, color: '#bbb', textAlign: 'right' }}>
                  ₹{usdRefs.usdToInr}/$ · XAU {fmtUSD(usdRefs.goldUsdOz)}/oz
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(16px,3vw,28px) 5%' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 14 }}>
            <svg style={{ animation: 'spin .8s linear infinite', color: '#C2185B' }} width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <div style={{ color: '#C2185B', fontSize: 13, fontWeight: 600 }}>Fetching live prices…</div>
          </div>
        ) : retail && (
          <>
            {/* 3 cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
              {cardConfigs.map(cfg => (
                <MetalCard
                  key={cfg.key}
                  config={cfg}
                  chart={chart[cfg.key]}
                  period={periods[cfg.key]}
                  onPeriod={handlePeriod}
                  prevRatePerG={prevRaw.current ? prevRaw.current[cfg.key] * { gold: 1.20, silver: 1.11, platinum: 1.15 }[cfg.key] : null}
                />
              ))}
            </div>

            {/* Gold weight reference table */}
            <div style={{ background: '#fff', border: '1.5px solid #FDE68A', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ padding: '14px 20px', background: 'linear-gradient(90deg, #FFFBEB, #FFF8E1)', borderBottom: '1px solid #FDE68A', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#92400E' }}>
                  Gold — Weight Reference (India Retail)
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#aaa' }}>
                  <span>24K: <strong style={{ color: '#B8860B' }}>{fmt(retail.gold24k)}/g</strong></span>
                  <span>22K: <strong style={{ color: '#B8860B' }}>{fmt(retail.gold22k)}/g</strong></span>
                </div>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 300 }}>
                  <thead>
                    <tr style={{ background: '#FFFDF5' }}>
                      {['Weight', '24K', '22K'].map(h => (
                        <th key={h} style={{
                          padding: '9px 16px', textAlign: h === 'Weight' ? 'left' : 'right',
                          color: '#ccc', fontWeight: 700, fontSize: 10,
                          letterSpacing: '.1em', textTransform: 'uppercase',
                          borderBottom: '1px solid #FDE68A',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[[0.5],[1],[2],[5],[8],[10],[15],[20],[25],[50],[100],[500],[1000]].map(([g], i) => (
                      <tr key={g} style={{ background: i % 2 === 0 ? '#fff' : '#FFFDF5', borderTop: '1px solid #FFFBEB' }}>
                        <td style={{ padding: '8px 16px', color: '#555', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {g >= 1000 ? `${g/1000} kg` : `${g} g`}
                        </td>
                        <td style={{ padding: '8px 16px', textAlign: 'right', color: '#92400E', fontWeight: 700 }}>
                          {fmt(retail.gold24k * g)}
                        </td>
                        <td style={{ padding: '8px 16px', textAlign: 'right', color: '#92400E', fontWeight: 600, opacity: .8 }}>
                          {fmt(retail.gold22k * g)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Silver + Platinum compact tables */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 20 }}>
              {/* Silver */}
              <div style={{ background: '#fff', border: '1.5px solid #CBD5E1', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '13px 18px', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#475569' }}>Silver Reference</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}><strong style={{ color: '#475569' }}>{fmt(retail.silver)}/g</strong></span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>
                        {['Weight', 'India Retail'].map(h => (
                          <th key={h} style={{ padding: '7px 16px', textAlign: h === 'Weight' ? 'left' : 'right', color: '#ccc', fontWeight: 700, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[1,5,10,50,100,500,1000].map((g, i) => (
                        <tr key={g} style={{ background: i % 2 === 0 ? '#fff' : '#F8FAFC', borderTop: '1px solid #F1F5F9' }}>
                          <td style={{ padding: '7px 16px', color: '#555', fontWeight: 600 }}>{g >= 1000 ? `${g/1000} kg` : `${g} g`}</td>
                          <td style={{ padding: '7px 16px', textAlign: 'right', color: '#1E293B', fontWeight: 700 }}>{fmt(retail.silver * g)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Platinum */}
              <div style={{ background: '#fff', border: '1.5px solid #DDD6FE', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '13px 18px', background: '#F5F3FF', borderBottom: '1px solid #DDD6FE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#6D28D9' }}>Platinum Reference</span>
                  <span style={{ fontSize: 11, color: '#aaa' }}><strong style={{ color: '#6D28D9' }}>{fmt(retail.platinum)}/g</strong></span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>
                        {['Weight', 'India Retail'].map(h => (
                          <th key={h} style={{ padding: '7px 16px', textAlign: h === 'Weight' ? 'left' : 'right', color: '#ccc', fontWeight: 700, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', borderBottom: '1px solid #EDE9FE' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[1,2,5,10,20,50,100].map((g, i) => (
                        <tr key={g} style={{ background: i % 2 === 0 ? '#fff' : '#F5F3FF', borderTop: '1px solid #F5F3FF' }}>
                          <td style={{ padding: '7px 16px', color: '#555', fontWeight: 600 }}>{g} g</td>
                          <td style={{ padding: '7px 16px', textAlign: 'right', color: '#4C1D95', fontWeight: 700 }}>{fmt(retail.platinum * g)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Tax breakdown info */}
            <div style={{ background: '#fff', border: '1px solid #F8BBD0', borderRadius: 12, padding: '14px 18px', marginBottom: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
              {[
                { metal: 'Gold',     duty: '15%', gst: '3%', dealer: '~2%', total: '20%', color: '#B8860B' },
                { metal: 'Silver',   duty:  '6%', gst: '3%', dealer: '~2%', total: '11%', color: '#475569' },
                { metal: 'Platinum', duty: '10%', gst: '3%', dealer: '~2%', total: '15%', color: '#6D28D9' },
              ].map(row => (
                <div key={row.metal} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 3, height: 36, borderRadius: 2, background: row.color, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: row.color }}>{row.metal}</div>
                    <div style={{ fontSize: 10, color: '#bbb' }}>
                      Import {row.duty} + GST {row.gst} + Dealer {row.dealer} = <strong style={{ color: '#888' }}>{row.total}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Disclaimer */}
            <div style={{ background: '#FFF8FB', border: '1px solid #F8BBD0', borderRadius: 10, padding: '11px 16px', display: 'flex', gap: 10 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C2185B" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 2 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div style={{ fontSize: 11, color: '#999', lineHeight: 1.7 }}>
                Spot prices from <strong style={{ color: '#C2185B' }}>gold-api.com</strong> (XAU, XAG, XPT) · USD/INR from <strong style={{ color: '#C2185B' }}>Open Exchange Rates</strong>.
                Retail prices include import duty, GST (3%), and estimated dealer premium. Actual prices may vary by jeweller.
                Historical charts use statistical simulation anchored to live rate.
                {!dataOk && <strong style={{ color: '#F59E0B' }}> ⚠ Live data unavailable — showing estimated fallback rates.</strong>}
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

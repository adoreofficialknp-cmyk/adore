import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { GridProductCard, SectionHeader, SkeletonCard } from '../components/UI'

const PINK = {
  bg:'#FFF0F5',bgLight:'#FFF5F8',bgAccent:'#FCE4EC',bgDark:'#1A0010',bgDark2:'#2D0A1E',bgDark3:'#0D001A',
  border:'#F48FB1',borderLight:'#FCE4EC',primary:'#C2185B',primaryDark:'#880E4F',primaryMid:'#AD1457',
  accent:'#F8BBD0',accentMid:'#F48FB1',text:'#880E4F',textMid:'#AD1457',textSub:'#AD5070',
  heroOverlay:'linear-gradient(100deg, rgba(255,240,245,0.88) 0%, rgba(252,228,236,0.70) 40%, rgba(252,228,236,0) 72%)',
  heroGrad:'linear-gradient(135deg,#FFF0F5 0%,#FCE4EC 60%,#F8BBD0 100%)',
  saleGrad:'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 40%, #FCE4EC 100%)',
  darkGrad:'linear-gradient(135deg, #1A0010 0%, #2D0A1E 60%, #0D001A 100%)',
  tickerBg:'#FCE4EC',tickerBorder:'#F48FB1',sectionPattern:'#C2185B',
  btnBg:'#D4A96A',btnHover:'#B8894A',pill:'#FCE4EC',pillBorder:'#F48FB1',pillText:'#880E4F',pillDot:'#C2185B',
  countdownBorder:'#F48FB1',countdownText:'#C2185B',gradText:'#F8BBD0',dotPattern:'#FFB6C1',
  promoGrad:'linear-gradient(to top, rgba(45,10,30,.78) 0%, transparent 60%)',
  trustBorder:'#F48FB1',trustBg:'#FFF0F5',trustIcon:'#C2185B',trustCircle:'#FCE4EC',trustLabel:'#880E4F',
  nlBg:'#1A0010',nlAccent:'#E91E8C',
  materialGrad:'linear-gradient(to top, rgba(136,14,79,.85) 0%, rgba(0,0,0,.08) 60%)',
  commitGrad:'linear-gradient(135deg, #1A0010 0%, #2D0A1E 100%)',
  customGrad:'linear-gradient(135deg,#FFF0F5 0%,#FCE4EC 50%,#FFF0F5 100%)',customBorder:'#F8BBD0',styleBg:'#fff',
}

const SILVER = {
  bg:'#ECEFF1',bgLight:'#F5F7F8',bgAccent:'#CFD8DC',bgDark:'#1B2631',bgDark2:'#212F3C',bgDark3:'#0D1117',
  border:'#90A4AE',borderLight:'#CFD8DC',primary:'#455A64',primaryDark:'#263238',primaryMid:'#546E7A',
  accent:'#B0BEC5',accentMid:'#90A4AE',text:'#263238',textMid:'#37474F',textSub:'#546E7A',
  heroOverlay:'linear-gradient(100deg, rgba(236,239,241,0.92) 0%, rgba(207,216,220,0.78) 40%, rgba(207,216,220,0) 72%)',
  heroGrad:'linear-gradient(135deg,#ECEFF1 0%,#CFD8DC 60%,#B0BEC5 100%)',
  saleGrad:'linear-gradient(135deg, #CFD8DC 0%, #B0BEC5 40%, #CFD8DC 100%)',
  darkGrad:'linear-gradient(135deg, #1B2631 0%, #212F3C 60%, #0D1117 100%)',
  tickerBg:'#CFD8DC',tickerBorder:'#90A4AE',sectionPattern:'#546E7A',
  btnBg:'#455A64',btnHover:'#37474F',pill:'#CFD8DC',pillBorder:'#90A4AE',pillText:'#263238',pillDot:'#455A64',
  countdownBorder:'#90A4AE',countdownText:'#455A64',gradText:'#B0BEC5',dotPattern:'#90A4AE',
  promoGrad:'linear-gradient(to top, rgba(27,38,49,.85) 0%, transparent 60%)',
  trustBorder:'#90A4AE',trustBg:'#ECEFF1',trustIcon:'#455A64',trustCircle:'#CFD8DC',trustLabel:'#263238',
  nlBg:'#1B2631',nlAccent:'#607D8B',
  materialGrad:'linear-gradient(to top, rgba(38,50,56,.85) 0%, rgba(0,0,0,.08) 60%)',
  commitGrad:'linear-gradient(135deg, #1B2631 0%, #212F3C 100%)',
  customGrad:'linear-gradient(135deg,#ECEFF1 0%,#CFD8DC 50%,#ECEFF1 100%)',customBorder:'#B0BEC5',styleBg:'#ECEFF1',
}

const HERO_PINK = [
  {tag:'New Collection · 2025',title:'Eternal\nElegance',sub:'Handcrafted 925 silver with timeless designs',img:'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1600&auto=format&fit=crop&q=90',cat:'Necklaces',cta:'Shop Necklaces'},
  {tag:'Bestseller',title:'Golden\nMoments',sub:'Rings that tell your love story',img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&auto=format&fit=crop&q=90',cat:'Rings',cta:'Shop Rings'},
  {tag:'Fine Jewellery',title:'Crafted\nWith Love',sub:'Rose gold earrings for every occasion',img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1600&auto=format&fit=crop&q=90',cat:'Earrings',cta:'Shop Earrings'},
]

const HERO_SILVER = [
  {tag:'Silver Coated · 925',title:'Sterling\nSilver Shine',sub:'Premium silver coated jewellery for modern style',img:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&auto=format&fit=crop&q=90',cat:'Necklaces',cta:'Shop Silver'},
  {tag:'New Arrivals',title:'Modern\nElegance',sub:'Silver coated rings with contemporary design',img:'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=1600&auto=format&fit=crop&q=90',cat:'Rings',cta:'Shop Rings'},
  {tag:'Trending',title:'Pure\nSilver Feel',sub:'Silver coated bracelets & earrings, lasting beauty',img:'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=1600&auto=format&fit=crop&q=90',cat:'Earrings',cta:'Shop Earrings'},
]

const CATEGORIES = [
  {label:'Rings',img:'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&auto=format&fit=crop&q=80'},
  {label:'Necklaces',img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80'},
  {label:'Earrings',img:'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=80'},
  {label:'Bracelets',img:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop&q=80'},
  {label:'Pendants',img:'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=500&auto=format&fit=crop&q=80'},
]

const TRUST_ITEMS = [
  {icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>,label:'BIS Hallmarked',desc:'Government certified gold & silver purity on every piece'},
  {icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>,label:'IGI Certified',desc:'International Gemological Institute certified diamonds'},
  {icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,label:'30-Day Returns',desc:'Hassle-free returns & exchanges, no questions asked'},
  {icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,label:'Free Shipping',desc:'Complimentary insured delivery on every order'},
  {icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,label:'Secure Payments',desc:'Bank-grade 256-bit SSL encryption on all transactions'},
  {icon:<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,label:'24/7 Support',desc:'Expert jewellery consultants available round the clock'},
]

const CERTIFICATIONS = [
  {name:'BIS Hallmark',detail:'Bureau of Indian Standards',color:'#1B5E20'},
  {name:'IGI Certified',detail:'International Gemological Institute',color:'#4A148C'},
  {name:'18K / 22K Gold',detail:'Tested & Verified Purity',color:'#B8860B'},
  {name:'925 Silver',detail:'Sterling Silver Standard',color:'#546E7A'},
]

function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - Date.now()
    if (diff <= 0) return {d:0,h:0,m:0,s:0}
    return {d:Math.floor(diff/86400000),h:Math.floor((diff%86400000)/3600000),m:Math.floor((diff%3600000)/60000),s:Math.floor((diff%60000)/1000)}
  }
  const [time,setTime]=useState(calc)
  useEffect(()=>{const id=setInterval(()=>setTime(calc()),1000);return()=>clearInterval(id)},[targetDate])
  return time
}

function CBox({value,label,C}){
  return(
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4,minWidth:52}}>
      <div style={{background:'#fff',border:`1px solid ${C.countdownBorder}`,borderRadius:4,padding:'8px 12px',fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:C.countdownText,minWidth:52,textAlign:'center',lineHeight:1}}>
        {String(value).padStart(2,'0')}
      </div>
      <span style={{fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',color:C.textSub,fontWeight:600}}>{label}</span>
    </div>
  )
}

function LiveTicker({navigate,C}){
  const [rates,setRates]=useState({gold:8940,silver:97,platinum:3050})
  const [live,setLive]=useState(false)
  useEffect(()=>{
    async function load(){
      try{
        const [fx,g,s,p]=await Promise.allSettled([fetch('https://open.er-api.com/v6/latest/USD'),fetch('https://api.gold-api.com/price/XAU'),fetch('https://api.gold-api.com/price/XAG'),fetch('https://api.gold-api.com/price/XPT')])
        const inr=fx.status==='fulfilled'?((await fx.value.json()).rates?.INR??83.5):83.5
        const gp=g.status==='fulfilled'?((await g.value.json()).price??3300):3300
        const sp=s.status==='fulfilled'?((await s.value.json()).price??33):33
        const pp=p.status==='fulfilled'?((await p.value.json()).price??990):990
        const t=u=>(u/31.1035)*inr
        setRates({gold:t(gp),silver:t(sp),platinum:t(pp)});setLive(true)
      }catch{}
    }
    load();const t=setInterval(load,120000);return()=>clearInterval(t)
  },[])
  const fmt=n=>`₹${Number(Math.round(n)).toLocaleString('en-IN')}`
  return(
    <div onClick={()=>navigate('/metal-rates')} style={{background:C.tickerBg,borderBottom:`1px solid ${C.tickerBorder}`,padding:'7px 5%',display:'flex',alignItems:'center',gap:'clamp(12px,3vw,32px)',cursor:'pointer',overflowX:'auto',scrollbarWidth:'none'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
        <span style={{width:6,height:6,borderRadius:'50%',background:live?'#16A34A':'#F59E0B',display:'inline-block',boxShadow:`0 0 5px ${live?'#16A34A':'#F59E0B'}`}}/>
        <span style={{fontSize:10,fontWeight:700,letterSpacing:'.14em',textTransform:'uppercase',color:C.primaryMid,opacity:.7}}>{live?'Live':'Est.'} Rates</span>
      </div>
      {[{l:'Gold 24K / g',v:fmt(rates.gold)},{l:'Silver / g',v:fmt(rates.silver)},{l:'Platinum / g',v:fmt(rates.platinum)}].map(it=>(
        <div key={it.l} style={{display:'flex',alignItems:'center',gap:7,flexShrink:0}}>
          <span style={{fontSize:10,letterSpacing:'.06em',textTransform:'uppercase',color:C.primaryMid,fontWeight:600,opacity:.6}}>{it.l}</span>
          <span style={{fontSize:12,fontWeight:700,color:C.primaryDark}}>{it.v}</span>
        </div>
      ))}
      <div style={{marginLeft:'auto',flexShrink:0,display:'flex',alignItems:'center',gap:4,color:C.primary,fontSize:10,opacity:.6}}>
        View all<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
  )
}

export default function Home(){
  const navigate=useNavigate()
  const {addToCart}=useCart()
  const {user}=useAuth()
  const {showToast}=useToast()
  const {theme,setTheme}=useTheme()
  const C=theme==='silver'?SILVER:PINK
  const isSilver=theme==='silver'

  const [slide,setSlide]=useState(0)
  const [products,setProducts]=useState([])
  const [trending,setTrending]=useState([])
  const [festive,setFestive]=useState([])
  const [wishlist,setWishlist]=useState([])
  const [loading,setLoading]=useState(true)
  const [email,setEmail]=useState('')
  const [subscribed,setSubscribed]=useState(false)
  const [cmsConfig,setCmsConfig]=useState({newArrivalsCount:8,trendingCount:8,banners:HERO_PINK,sectionImages:[],marqueeItems:[],homeStats:[],commitmentText:null})
  const [activeCoupons,setActiveCoupons]=useState([])
  const slideTimer=useRef(null)

  const activeBanners=useMemo(()=>{
    const slides=isSilver?HERO_SILVER:HERO_PINK
    const cms=isSilver?null:cmsConfig.banners
    return (cms||slides).filter(b=>b.active!==false)
  },[isSilver,cmsConfig.banners])

  const festiveTarget=useMemo(()=>new Date('2026-04-19T00:00:00+05:30'),[])
  const countdown=useCountdown(festiveTarget)

  const resetSlideTimer=useCallback(()=>{
    clearInterval(slideTimer.current)
    slideTimer.current=setInterval(()=>setSlide(s=>(s+1)%activeBanners.length),5000)
  },[activeBanners.length])

  useEffect(()=>{resetSlideTimer();return()=>clearInterval(slideTimer.current)},[resetSlideTimer])
  useEffect(()=>{HERO_PINK.forEach(s=>{const img=new Image();img.src=s.img})},[])
  useEffect(()=>{
    try{const saved=localStorage.getItem('adore_cms_config');if(saved){const p=JSON.parse(saved);setCmsConfig({newArrivalsCount:p.newArrivalsCount||8,trendingCount:p.trendingCount||8,banners:p.banners||HERO_PINK,sectionImages:p.sectionImages||[],marqueeItems:p.marqueeItems||[],homeStats:p.homeStats||[],commitmentText:p.commitmentText||null})}}catch{}
  },[])

  useEffect(()=>{
    setLoading(true)
    const tagParam=isSilver?'&tag=silver-coated':''
    const matParam=isSilver?'':'&material=Silver'
    Promise.all([
      api.get(`/products?limit=${cmsConfig.newArrivalsCount}&sort=createdAt&order=desc${matParam}${tagParam}`),
      api.get(`/products?limit=${cmsConfig.trendingCount}&sort=rating&order=desc${matParam}${tagParam}`),
      api.get(`/products?limit=6&sort=price&order=desc${matParam}${tagParam}`),
    ]).then(([n,t,f])=>{
      setProducts(n.data.products||[])
      setTrending(t.data.products||[])
      setFestive(f.data.products||[])
    }).catch(()=>{}).finally(()=>setLoading(false))
    if(user){api.get('/wishlist').then(r=>setWishlist((r.data||[]).map(w=>w.productId))).catch(()=>{})}
    api.get('/admin/coupons').then(r=>{
      const now=new Date()
      const visible=(r.data||[]).filter(c=>c.isActive&&(!c.expiresAt||new Date(c.expiresAt)>now)&&(!c.maxUses||c.usedCount<c.maxUses))
      setActiveCoupons(visible)
    }).catch(()=>{})
  },[user,cmsConfig,theme])

  const handleSlide=idx=>{setSlide(idx);resetSlideTimer()}
  const prevSlide=()=>{setSlide(s=>(s-1+activeBanners.length)%activeBanners.length);resetSlideTimer()}
  const nextSlide=()=>{setSlide(s=>(s+1)%activeBanners.length);resetSlideTimer()}
  const handleCart=async p=>{if(!user){navigate('/login');throw new Error('not_logged_in')}; await addToCart(p.id);showToast(`${p.name} added to cart`)}
  const handleWishlist=async p=>{if(!user){navigate('/login');return};try{await api.post('/wishlist/toggle',{productId:p.id});const inWl=wishlist.includes(p.id);setWishlist(prev=>inWl?prev.filter(id=>id!==p.id):[...prev,p.id]);showToast(inWl?'Removed from wishlist':'Added to wishlist')}catch{}}
  const handleSubscribe=e=>{e.preventDefault();if(!email)return;setSubscribed(true);showToast('Subscribed successfully!')}
  const s=activeBanners[slide]||activeBanners[0]||HERO_PINK[0]

  const BtnPrimary=({children,onClick,style={}})=>(
    <button onClick={onClick} style={{background:C.btnBg,color:'#4A2C0A',border:'none',padding:'13px 28px',fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',borderRadius:6,fontFamily:"'Jost',sans-serif",transition:'background .2s,transform .15s,box-shadow .2s',display:'inline-flex',alignItems:'center',justifyContent:'center',boxShadow:`0 2px 12px ${C.primary}30`,...style}}
      onMouseEnter={e=>{e.currentTarget.style.background=C.btnHover;e.currentTarget.style.color='#fff';e.currentTarget.style.transform='translateY(-1px)'}}
      onMouseLeave={e=>{e.currentTarget.style.background=C.btnBg;e.currentTarget.style.color='#4A2C0A';e.currentTarget.style.transform='translateY(0)'}}
    >{children}</button>
  )
  const BtnSecondary=({children,onClick,style={}})=>(
    <button onClick={onClick} style={{background:'#fff',color:C.primary,border:`1.5px solid ${C.border}`,padding:'12px 24px',fontSize:12,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:6,fontFamily:"'Jost',sans-serif",transition:'all .2s',...style}}
      onMouseEnter={e=>{e.currentTarget.style.background=C.bgAccent;e.currentTarget.style.borderColor=C.primary}}
      onMouseLeave={e=>{e.currentTarget.style.background='#fff';e.currentTarget.style.borderColor=C.border}}
    >{children}</button>
  )

  return(
    <div style={{background:C.bgLight}}>

      {/* SEARCH + TABS */}
      <div style={{background:'#fff',padding:'14px 5% 12px',borderBottom:`1px solid ${C.borderLight}`}}>
        <div style={{position:'relative',marginBottom:10}}>
          <div style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'#bbb',pointerEvents:'none'}}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input type="text" placeholder='Search "Rings, Pendants, Bracelets..."' onFocus={()=>navigate('/shop')} readOnly
            style={{width:'100%',padding:'11px 48px 11px 40px',border:`1.5px solid ${C.border}`,borderRadius:24,fontSize:14,color:C.primary,background:isSilver?'#F8FAFB':'#FFF8FB',outline:'none',cursor:'pointer',fontFamily:"'Jost',sans-serif",boxSizing:'border-box',letterSpacing:'.01em'}}
          />
        </div>
        <div style={{display:'flex',gap:0,borderRadius:30,overflow:'hidden',border:`2px solid ${C.primary}`,boxShadow:`0 2px 12px ${C.primary}22`}}>
          <button onClick={()=>setTheme('pink')} style={{flex:1,padding:'11px 8px',background:!isSilver?PINK.primary:'#fff',color:!isSilver?'#fff':'#546E7A',border:'none',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:"'Jost',sans-serif",letterSpacing:'.02em',borderRight:`1.5px solid ${isSilver?'#B0BEC5':'rgba(255,255,255,.25)'}`,transition:'all .3s',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:!isSilver?'#fff':'#C2185B',flexShrink:0}}/>
            Silver Jewellery 925
          </button>
          <button onClick={()=>setTheme('silver')} style={{flex:1,padding:'11px 8px',background:isSilver?SILVER.primary:'#fff',color:isSilver?'#fff':'#455A64',border:'none',cursor:'pointer',fontSize:13,fontWeight:700,fontFamily:"'Jost',sans-serif",letterSpacing:'.02em',transition:'all .3s',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:isSilver?'#fff':'#455A64',flexShrink:0}}/>
            Silver Coated 925
          </button>
        </div>
      </div>

      {/* HERO */}
     <section className="hero-slider" style={{background:C.heroGrad}}>
        {activeBanners.map((sl,i)=>(
          <div key={i} aria-hidden={i!==slide} style={{position:'absolute',inset:0,opacity:i===slide?1:0,transition:'opacity .7s ease',pointerEvents:i===slide?'auto':'none',zIndex:1}}>
            <img src={sl.img} alt={sl.title} loading="eager" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center',display:'block',maxWidth:'none'}} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1600&auto=format&fit=crop&q=90'}}/>
          </div>
        ))}
        <div className="hero-overlay" style={{background:C.heroOverlay}}/>
        <div className="hero-content">
          <div key={`${slide}-${theme}`} className="animate-fade-up" style={{maxWidth:480,width:'100%'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:C.pill,border:`1px solid ${C.pillBorder}`,borderRadius:20,padding:'4px 14px',marginBottom:'clamp(8px,2vw,16px)'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:C.pillDot,flexShrink:0}}/>
              <span style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:C.pillText,fontWeight:700}}>{s.tag}</span>
            </div>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(26px,5.5vw,72px)',fontWeight:600,color:C.text,lineHeight:1.05,fontStyle:'italic',whiteSpace:'pre-line',marginBottom:12,textShadow:'0 1px 2px rgba(255,255,255,.4)'}}>{s.title}</h1>
            <p style={{fontSize:'clamp(11px,1.8vw,14px)',color:C.textMid,letterSpacing:'.02em',marginBottom:24,lineHeight:1.6,maxWidth:480}}>{s.sub}</p>
            <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',width:'100%'}}>
              <BtnPrimary onClick={()=>navigate(`/shop?category=${s.cat}`)} style={{borderRadius:6,padding:'clamp(8px,1.5vw,13px) clamp(14px,3vw,28px)',fontSize:'clamp(10px,1.5vw,12px)'}}>{s.cta}</BtnPrimary>
              <BtnSecondary onClick={()=>navigate('/shop')} style={{padding:'clamp(7px,1.4vw,12px) clamp(12px,2.5vw,24px)',borderRadius:6,fontSize:'clamp(10px,1.5vw,12px)'}}>View All</BtnSecondary>
            </div>
          </div>
        </div>
        {/* Nav arrows */}
        {[{fn:prevSlide,dir:'left',pts:'15 18 9 12 15 6'},{fn:nextSlide,dir:'right',pts:'9 18 15 12 9 6'}].map(({fn,dir,pts})=>(
          <button key={dir} onClick={fn} style={{position:'absolute',top:'50%',[dir]:'clamp(8px,2vw,16px)',transform:'translateY(-50%)',width:'clamp(28px,5vw,38px)',height:'clamp(28px,5vw,38px)',borderRadius:'50%',background:'rgba(255,255,255,.80)',border:`1px solid ${C.border}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:C.primary,backdropFilter:'blur(4px)',zIndex:4,transition:'background .2s'}}
            onMouseEnter={e=>e.currentTarget.style.background=C.bgAccent}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.80)'}
          ><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points={pts}/></svg></button>
        ))}
        {/* Dots */}
        <div style={{position:'absolute',bottom:'clamp(10px,2vw,20px)',left:'50%',transform:'translateX(-50%)',display:'flex',gap:8,zIndex:4}}>
          {activeBanners.map((_,i)=>(
            <button key={i} onClick={()=>handleSlide(i)} style={{width:slide===i?20:6,height:6,borderRadius:3,background:slide===i?C.primary:`${C.primary}40`,border:'none',cursor:'pointer',padding:0,transition:'all .3s'}}/>
          ))}
        </div>
      </section>

      {/* SHUBH PRICES — RIGHT BELOW HERO */}
      <section style={{background:C.bg,padding:'clamp(28px,4vw,48px) 5%',borderBottom:`1px solid ${C.border}20`}}>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:10,letterSpacing:'.22em',textTransform:'uppercase',color:C.primary,fontWeight:700,marginBottom:8}}>✦ Shop by Budget ✦</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(22px,3vw,32px)',fontWeight:600,color:C.primaryDark,margin:0,fontStyle:'italic'}}>Shubh Prices, Stunning Picks</h2>
          <p style={{fontSize:13,color:C.textSub,marginTop:6}}>Find the perfect piece in your budget</p>
        </div>
        <div style={{display:'flex',flexDirection:'row',borderRadius:12,overflow:'hidden',border:`1.5px solid ${C.border}`,boxShadow:`0 2px 12px ${C.primary}15`}}>
          {[
            {label:'Under',price:'₹999',min:0,max:999,icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/><circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity=".35" stroke="none"/></svg>},
            {label:'₹1,000 –',price:'₹1,999',min:1000,max:1999,icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 3 19 8 17 16 12 19 7 16 5 8"/><line x1="5" y1="8" x2="19" y2="8"/><line x1="7" y1="16" x2="17" y2="16"/><line x1="12" y1="3" x2="7" y2="16"/><line x1="12" y1="3" x2="17" y2="16"/><line x1="12" y1="19" x2="12" y2="22" strokeOpacity=".4"/></svg>},
            {label:'₹2,000 –',price:'₹4,999',min:2000,max:4999,icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l3 5-9 13L3 8z"/><line x1="3" y1="8" x2="21" y2="8"/><line x1="9" y1="3" x2="6.5" y2="8"/><line x1="15" y1="3" x2="17.5" y2="8"/><line x1="6.5" y1="8" x2="12" y2="21"/><line x1="17.5" y1="8" x2="12" y2="21"/></svg>},
            {label:'₹5,000+',price:'Premium',min:5000,max:999999,icon:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17L6 7l6 4 6-4 3 10H3z"/><path d="M5 17v2a1 1 0 001 1h12a1 1 0 001-1v-2"/><circle cx="12" cy="4" r="2"/><line x1="12" y1="6" x2="12" y2="11"/></svg>},
          ].map((b,i,arr)=>(
            <button key={b.price} onClick={()=>navigate(`/shop?minPrice=${b.min}&maxPrice=${b.max}`)}
              style={{flex:1,padding:'clamp(14px,2vw,20px) 8px',background:'#FFF8F2',color:C.primaryDark,border:'none',borderRight:i<arr.length-1?`1.5px solid ${C.border}`:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:5,fontFamily:"'Jost',sans-serif",transition:'background .2s,color .2s',minWidth:0}}
              onMouseEnter={e=>{e.currentTarget.style.background=C.primary;e.currentTarget.style.color='#fff';Array.from(e.currentTarget.querySelectorAll('span')).forEach(s=>{s.style.color='#fff';s.style.background='rgba(255,255,255,0.2)'})}}
              onMouseLeave={e=>{e.currentTarget.style.background='#FFF8F2';e.currentTarget.style.color=C.primaryDark;Array.from(e.currentTarget.querySelectorAll('span')).forEach(s=>{s.style.color='';s.style.background=`${C.primary}18`})}}
            >
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',width:'clamp(32px,4vw,42px)',height:'clamp(32px,4vw,42px)',borderRadius:'50%',background:`${C.primary}18`,flexShrink:0,color:C.primary,transition:'background .2s,color .2s'}}>{b.icon}</span>
              <span style={{fontSize:'clamp(8px,1.2vw,10px)',fontWeight:600,opacity:.7,letterSpacing:'.06em',textTransform:'uppercase',transition:'color .2s'}}>{b.label}</span>
              <span style={{fontSize:'clamp(13px,2vw,18px)',fontWeight:800,transition:'color .2s'}}>{b.price}</span>
            </button>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{background:C.bg,padding:'clamp(40px,5vw,64px) 5%'}}>
        <SectionHeader title="Shop by Category" onViewAll={()=>navigate('/shop')}/>
        <div style={{overflowX:'auto',paddingBottom:8,marginBottom:-8}}>
          <div style={{display:'flex',gap:24,padding:'4px 0'}}>
            {CATEGORIES.map(cat=>(
              <div key={cat.label} onClick={()=>navigate(`/shop?category=${cat.label}`)} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10,cursor:'pointer',flexShrink:0}}>
                <div style={{width:'clamp(100px,12vw,140px)',height:'clamp(100px,12vw,140px)',borderRadius:'50%',overflow:'hidden',border:`2.5px solid ${C.border}`,background:C.bgAccent,transition:'border-color .2s,transform .2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.primary;e.currentTarget.style.transform='scale(1.05)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform='scale(1)'}}
                >
                  <img src={cat.img} alt={cat.label} loading="lazy" crossOrigin="anonymous" style={{width:'100%',height:'100%',objectFit:'cover',display:'block',filter:isSilver?'saturate(0.6) brightness(1.05)':'none'}} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80'}}/>
                </div>
                <span style={{fontSize:11,letterSpacing:'.12em',textTransform:'uppercase',fontWeight:700,color:C.text,textAlign:'center',maxWidth:110}}>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FESTIVAL SALE */}
      <section style={{position:'relative',overflow:'hidden',background:C.saleGrad,padding:'clamp(40px,5vw,64px) 5%'}}>
        <div style={{position:'absolute',inset:0,opacity:.06,backgroundImage:`repeating-linear-gradient(45deg, ${C.accent} 0, ${C.accent} 1px, transparent 0, transparent 50%)`,backgroundSize:'20px 20px'}}/>
        <div style={{position:'relative',zIndex:2}}>
          <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:36,flexWrap:'wrap',gap:20}}>
            <div>
              <div style={{fontSize:11,letterSpacing:'.22em',textTransform:'uppercase',color:C.primary,fontWeight:600,marginBottom:10}}>✦ Limited Time Offer ✦</div>
              <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(28px, 4vw, 48px)',fontWeight:600,fontStyle:'italic',color:C.primaryDark,lineHeight:1.1,marginBottom:8}}>{isSilver?'Silver Coated Sale':'✦ Akshaya Tritiya Sale'}</h2>
              <p style={{fontSize:13,color:C.textSub,letterSpacing:'.03em'}}>Up to 20% off · Celebrate Akshaya Tritiya with pure gold & silver</p>
            </div>
            <div>
              <div style={{fontSize:10,letterSpacing:'.16em',textTransform:'uppercase',color:C.textSub,marginBottom:10,textAlign:'center'}}>Akshaya Tritiya — 19 Apr 2026</div>
              <div style={{display:'flex',gap:8,alignItems:'flex-start'}}>
                <CBox value={countdown.d} label="Days" C={C}/>
                <span style={{color:C.primary,fontSize:24,fontWeight:700,marginTop:6,lineHeight:1}}>:</span>
                <CBox value={countdown.h} label="Hours" C={C}/>
                <span style={{color:C.primary,fontSize:24,fontWeight:700,marginTop:6,lineHeight:1}}>:</span>
                <CBox value={countdown.m} label="Mins" C={C}/>
                <span style={{color:C.primary,fontSize:24,fontWeight:700,marginTop:6,lineHeight:1}}>:</span>
                <CBox value={countdown.s} label="Secs" C={C}/>
              </div>
            </div>
          </div>
          {activeCoupons.length>0&&(
          <div style={{display:'flex',gap:12,marginBottom:32,flexWrap:'wrap'}}>
            {activeCoupons.map(c=>{
              const off=c.type==='percent'?`${c.value}% OFF`:`₹${Number(c.value).toLocaleString('en-IN')} OFF`
              const min=c.minOrder>0?`Min. ₹${Number(c.minOrder).toLocaleString('en-IN')}`:'No min. order'
              return(
              <div key={c.id} style={{display:'flex',alignItems:'center',gap:12,background:'#fff',border:`1px dashed ${C.border}`,borderRadius:4,padding:'10px 16px'}}>
                <div><div style={{fontSize:15,fontWeight:700,color:C.primary,letterSpacing:'.04em'}}>{off}</div><div style={{fontSize:10,color:C.textSub,letterSpacing:'.08em'}}>{min}</div></div>
                <div style={{width:1,height:32,background:C.border}}/>
                <div style={{fontSize:13,fontWeight:700,letterSpacing:'.14em',color:C.primaryDark,fontFamily:'monospace'}}>{c.code}</div>
              </div>
            )})}
          </div>
          )}
          {loading?(
            <div className="grid-2-col-mobile" style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:16}}>
              {Array.from({length:4}).map((_,i)=><SkeletonCard key={i}/>)}
            </div>
          ):festive.length>0?(
            <div className="grid-2-col-mobile" style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:16}}>
              {festive.slice(0,6).map(p=>(
                <div key={p.id} onClick={()=>navigate(`/product/${p.id}`)} style={{background:'rgba(255,255,255,.96)',borderRadius:3,overflow:'hidden',cursor:'pointer'}}>
                  <div style={{position:'relative',aspectRatio:'1',overflow:'hidden',background:C.bgAccent}}>
                    <img src={p.images?.[0]} alt={p.name} style={{width:'100%',height:'100%',objectFit:'cover'}} loading="lazy" crossOrigin="anonymous" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80'}}/>
                    <span style={{position:'absolute',top:8,left:8,background:C.primary,color:'#fff',fontSize:9,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',padding:'3px 8px',borderRadius:2}}>{isSilver?'Silver Pick':'Akshaya Pick'}</span>
                  </div>
                  <div style={{padding:'10px 12px 12px'}}>
                    <div style={{fontSize:11,color:C.primary,textTransform:'uppercase',letterSpacing:'.1em',marginBottom:4}}>{p.category}</div>
                    <div style={{fontSize:13,fontWeight:600,marginBottom:6,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.name}</div>
                    <div style={{display:'flex',alignItems:'baseline',gap:6,marginBottom:10}}>
                      <span style={{fontSize:15,fontWeight:700,color:C.primaryDark}}>₹{Number(p.price).toLocaleString('en-IN')}</span>
                      {p.originalPrice&&<span style={{fontSize:12,color:'#aaa',textDecoration:'line-through'}}>₹{Number(p.originalPrice).toLocaleString('en-IN')}</span>}
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={e=>{e.stopPropagation();handleCart(p)}} style={{flex:1,padding:'9px 0',background:'transparent',color:C.primary,border:`1.5px solid ${C.primary}`,cursor:'pointer',borderRadius:2,fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif"}}>+ Cart</button>
                      <button onClick={e=>{e.stopPropagation();handleCart(p).then(()=>navigate('/checkout')).catch(()=>{})}} style={{flex:1,padding:'9px 0',background:C.bgAccent,color:C.primary,border:`1.5px solid ${C.border}`,cursor:'pointer',borderRadius:2,fontSize:10,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',fontFamily:"'Jost',sans-serif",transition:'all .2s'}} onMouseEnter={e=>{e.currentTarget.style.background=C.primary;e.currentTarget.style.color='#fff'}} onMouseLeave={e=>{e.currentTarget.style.background=C.bgAccent;e.currentTarget.style.color=C.primary}}>Buy Now</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ):null}
          <div style={{textAlign:'center',marginTop:32}}>
            <button onClick={()=>navigate('/shop')} style={{background:'transparent',color:C.primaryMid,border:`1.5px solid ${C.accentMid}`,padding:'14px 40px',fontSize:12,fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',borderRadius:2,fontFamily:"'Jost',sans-serif",transition:'all .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.background=`${C.primary}12`;e.currentTarget.style.borderColor=C.primary}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=C.accentMid}}
            >{isSilver?'Shop All Silver Coated →':'Shop All Festive Picks →'}</button>
          </div>
        </div>
      </section>

      {/* SHOP BY MATERIAL */}
      <section style={{background:'#fff',padding:'clamp(40px,5vw,64px) 5%'}}>
        <SectionHeader title="Shop by Material" subtitle="Find your metal" onViewAll={()=>navigate('/shop')}/>
        <div style={{display:'flex',gap:16,overflowX:'auto',paddingBottom:8,scrollSnapType:'x mandatory',WebkitOverflowScrolling:'touch'}}>
          {[{label:'Gold',sub:'18K & 22K',img:'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&auto=format&fit=crop&q=80',filter:'Gold'},{label:'Silver',sub:'925 Sterling',img:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&auto=format&fit=crop&q=80',filter:'Silver'},{label:'Platinum',sub:'950 Pure',img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',filter:'Platinum'},{label:'Diamond',sub:'IGI Certified',img:'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=600&auto=format&fit=crop&q=80',filter:'Diamond'}].map(mat=>(
            <div key={mat.label} onClick={()=>navigate(`/shop?material=${mat.filter}`)} style={{position:'relative',borderRadius:8,overflow:'hidden',cursor:'pointer',height:220,width:'calc(50vw - 28px)',maxWidth:220,minWidth:160,flexShrink:0,background:'#111',scrollSnapAlign:'start'}}
              onMouseEnter={e=>{const img=e.currentTarget.querySelector('img');if(img){img.style.transform='scale(1.06)';img.style.opacity='.45'}}}
              onMouseLeave={e=>{const img=e.currentTarget.querySelector('img');if(img){img.style.transform='scale(1)';img.style.opacity='.6'}}}
            >
              <img src={mat.img} alt={mat.label} loading="lazy" crossOrigin="anonymous" style={{width:'100%',height:'100%',objectFit:'cover',opacity:.6,transition:'transform .5s ease,opacity .3s'}} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80'}}/>
              <div style={{position:'absolute',inset:0,background:C.materialGrad,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'20px 18px'}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:600,fontStyle:'italic',color:'#fff',lineHeight:1.1,marginBottom:4}}>{mat.label}</div>
                <div style={{fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',color:C.accent,fontWeight:600,marginBottom:12}}>{mat.sub}</div>
                <span style={{fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',fontWeight:700,color:C.gradText,display:'flex',alignItems:'center',gap:5}}>Shop Now<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section style={{padding:'clamp(40px,5vw,64px) 5%',background:C.bgLight}}>
        <SectionHeader title={isSilver?'New Arrivals — Silver Coated':'New Arrivals'} subtitle={isSilver?'Latest silver coated pieces':'Just landed'} onViewAll={()=>navigate('/shop')}/>
        {loading?(
          <div className="grid-2-col-mobile" style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:16}}>
            {Array.from({length:4}).map((_,i)=><SkeletonCard key={i}/>)}
          </div>
        ):products.length>0?(
          <div className="grid-2-col-mobile" style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:16}}>
            {products.map(p=><GridProductCard key={p.id} product={p} onPress={()=>navigate(`/product/${p.id}`)} onAddToCart={()=>handleCart(p)} onBuyNow={()=>{handleCart(p).then(()=>navigate('/checkout')).catch(()=>{})}} onWishlist={()=>handleWishlist(p)} wishlisted={wishlist.includes(p.id)}/>)}
          </div>
        ):(
          <div style={{textAlign:'center',padding:'48px 0',color:C.textSub}}>
            <div style={{fontSize:40,marginBottom:12}}>💍</div>
            <p style={{fontSize:14}}>{isSilver?'No silver coated products yet. Check back soon!':'No products found.'}</p>
            <BtnPrimary onClick={()=>navigate('/shop')} style={{marginTop:16}}>Browse All Products</BtnPrimary>
          </div>
        )}
      </section>

      {/* SHOP BY STYLE — HORIZONTAL */}
      <section style={{padding:'clamp(40px,5vw,64px) clamp(16px,5%,80px)',background:C.styleBg,overflowX:'hidden'}}>
        <SectionHeader title="Shop by Style" subtitle="Curated for you" onViewAll={()=>navigate('/shop')}/>
        <div className="home-two-col" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          {[
            {label:'For Her',sub:'Rings, Necklaces, Earrings & more',img:'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',filter:'Women'},
            {label:'For Him',sub:'Chains, Bracelets, Rings & more',img:'https://images.unsplash.com/photo-1603518418367-25a6ea43d00b?w=800&auto=format&fit=crop&q=80',filter:'Men'},
          ].map(g=>(
            <div key={g.label} onClick={()=>navigate(`/shop?gender=${g.filter}`)} style={{position:'relative',borderRadius:10,overflow:'hidden',cursor:'pointer',height:'clamp(200px, 35vw, 420px)',background:'#111'}}>
              <img src={g.img} alt={g.label} loading="lazy" crossOrigin="anonymous" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'center top',opacity:.65,transition:'transform .5s ease',display:'block',filter:isSilver?'saturate(0.5)':'none'}}
                onMouseEnter={e=>e.currentTarget.style.transform='scale(1.04)'}
                onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80'}}
              />
              <div style={{position:'absolute',inset:0,background:isSilver?'linear-gradient(to top, rgba(27,38,49,.88) 0%, transparent 55%)':'linear-gradient(to top, rgba(45,10,30,.85) 0%, transparent 55%)',display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:'clamp(16px,3vw,32px)'}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(24px,3vw,38px)',fontWeight:600,fontStyle:'italic',color:'#fff',marginBottom:8}}>{g.label}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.65)',marginBottom:16}}>{g.sub}</div>
                <BtnPrimary onClick={e=>{e.stopPropagation();navigate(`/shop?gender=${g.filter}`)}} style={{alignSelf:'flex-start',padding:'10px 24px',fontSize:11}}>Explore →</BtnPrimary>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP BY BOND — HORIZONTAL RECTANGULAR */}
      <section style={{padding:'clamp(40px,5vw,64px) clamp(16px,5%,80px)',background:C.bg,overflowX:'hidden'}}>
        <SectionHeader title="Shop by Bond" subtitle="Gifts that go beyond jewellery" onViewAll={()=>navigate('/shop/bond/all')}/>
        <div style={{overflowX:'auto',paddingBottom:8,marginBottom:-8,scrollbarWidth:'none'}}>
          <div style={{display:'flex',gap:14,padding:'4px 0',width:'max-content'}}>
            {[
              {label:'For Mother',img:'https://images.unsplash.com/photo-1607354977956-a62a3fb0df78?w=400&auto=format&fit=crop&q=80',tag:'mother'},
              {label:'For Father',img:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',tag:'father'},
              {label:'For Wife',img:'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&auto=format&fit=crop&q=80',tag:'wife'},
              {label:'For Girlfriend',img:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',tag:'girlfriend'},
              {label:'For Boyfriend',img:'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=400&auto=format&fit=crop&q=80',tag:'boyfriend'},
              {label:'For Sister',img:'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80',tag:'sister'},
              {label:'For Brother',img:'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&auto=format&fit=crop&q=80',tag:'brother'},
              {label:'For Son',img:'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&auto=format&fit=crop&q=80',tag:'son'},
              {label:'For Daughter',img:'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80',tag:'daughter'},
              {label:'For Friend',img:'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&auto=format&fit=crop&q=80',tag:'friend'},
            ].map(b=>(
              <div key={b.tag} onClick={()=>navigate(`/shop/bond/${b.tag}`)} style={{position:'relative',flexShrink:0,cursor:'pointer',width:'clamp(130px,18vw,180px)',borderRadius:10,overflow:'hidden',background:'#111',boxShadow:'0 2px 12px rgba(0,0,0,.12)',transition:'transform .25s,box-shadow .25s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow=`0 8px 24px ${C.primary}30`}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.12)'}}
              >
                <div style={{aspectRatio:'3/4',overflow:'hidden'}}>
                  <img src={b.img} alt={b.label} loading="lazy" crossOrigin="anonymous" style={{width:'100%',height:'100%',objectFit:'cover',display:'block',transition:'transform .4s',filter:isSilver?'saturate(0.5) brightness(1.1)':'none'}}
                    onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
                    onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
                    onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80'}}
                  />
                </div>
                <div style={{position:'absolute',bottom:0,left:0,right:0,background:`linear-gradient(to top, ${C.primaryDark}EE 0%, transparent 70%)`,padding:'28px 10px 12px'}}>
                  <span style={{fontSize:11,letterSpacing:'.08em',textTransform:'uppercase',fontWeight:700,color:'#fff',display:'block',textAlign:'center'}}>{b.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO BANNERS */}
      <section className="promo-banners" style={{padding:'0 5% clamp(40px,5vw,64px)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        {[
          {img:'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&auto=format&fit=crop&q=80',tag:'New Brides',title:'Bridal\nCollection',cta:'Explore',cat:'Necklaces'},
          {img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&auto=format&fit=crop&q=80',tag:'Best Seller',title:'Solitaire\nRings',cta:'Shop Now',cat:'Rings'},
        ].map((b,i)=>(
          <div key={i} onClick={()=>navigate(`/shop?category=${b.cat}`)} style={{position:'relative',overflow:'hidden',cursor:'pointer',borderRadius:3,height:'clamp(200px, 30vw, 340px)',background:'#111'}}>
            <img src={b.img} alt={b.title} loading="lazy" crossOrigin="anonymous" style={{width:'100%',height:'100%',objectFit:'cover',opacity:.6,transition:'transform .5s ease,opacity .3s',filter:isSilver?'saturate(0.5)':'none'}}
              onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04)';e.currentTarget.style.opacity='.5'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.opacity='.6'}}
              onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80'}}
            />
            <div style={{position:'absolute',inset:0,background:C.promoGrad,display:'flex',flexDirection:'column',justifyContent:'flex-end',padding:28}}>
              <div style={{fontSize:10,letterSpacing:'.2em',textTransform:'uppercase',color:C.accent,marginBottom:8,fontWeight:600}}>{b.tag}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(22px, 3vw, 34px)',fontWeight:600,fontStyle:'italic',color:'#fff',whiteSpace:'pre-line',lineHeight:1.15,marginBottom:16}}>{b.title}</div>
              <span style={{fontSize:11,letterSpacing:'.14em',textTransform:'uppercase',fontWeight:700,color:C.gradText,display:'flex',alignItems:'center',gap:6}}>{b.cta}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></span>
            </div>
          </div>
        ))}
      </section>

      {/* TRENDING NOW */}
      <section style={{padding:'0 5% clamp(40px,5vw,64px)',background:C.bg}}>
        <SectionHeader title={isSilver?'Trending Now — Silver Coated':'Trending Now'} subtitle={isSilver?'Most loved silver pieces':'Most loved'} onViewAll={()=>navigate('/shop?sort=rating')}/>
        {loading?(
          <div className="grid-2-col-mobile" style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:16}}>
            {Array.from({length:4}).map((_,i)=><SkeletonCard key={i}/>)}
          </div>
        ):trending.length>0?(
          <div className="grid-2-col-mobile" style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:16}}>
            {trending.map(p=><GridProductCard key={p.id} product={p} onPress={()=>navigate(`/product/${p.id}`)} onAddToCart={()=>handleCart(p)} onBuyNow={()=>{handleCart(p).then(()=>navigate('/checkout')).catch(()=>{})}} onWishlist={()=>handleWishlist(p)} wishlisted={wishlist.includes(p.id)}/>)}
          </div>
        ):(
          <div style={{textAlign:'center',padding:'48px 0',color:C.textSub}}>
            <p style={{fontSize:14}}>{isSilver?'No trending silver coated products yet.':'No trending products found.'}</p>
          </div>
        )}
      </section>

      {/* RING SIZER */}
      <section style={{padding:'clamp(32px,4vw,48px) 5%',background:C.bg,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
        <div style={{maxWidth:900,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',gap:24,flexWrap:'wrap'}}>
          <div style={{display:'flex',alignItems:'center',gap:18}}>
            <div style={{width:56,height:56,borderRadius:'50%',background:'#fff',border:`1.5px solid ${C.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0}}>💍</div>
            <div>
              <div style={{fontSize:16,fontWeight:700,marginBottom:4,color:C.primaryDark}}>Not sure about your ring size?</div>
              <div style={{fontSize:13,color:'#888',lineHeight:1.5}}>Use our free Ring Sizer tool — get your exact size in seconds.</div>
            </div>
          </div>
          <BtnPrimary onClick={()=>navigate('/profile')} style={{flexShrink:0}}>Open Ring Sizer →</BtnPrimary>
        </div>
      </section>

      {/* GIFTING */}
      <section style={{position:'relative',overflow:'hidden',background:C.darkGrad,padding:'clamp(48px,6vw,80px) 0'}}>
        <div style={{position:'absolute',inset:0,opacity:.04,backgroundImage:`radial-gradient(circle, ${C.dotPattern} 1px, transparent 1px)`,backgroundSize:'32px 32px',pointerEvents:'none'}}/>
        <div style={{textAlign:'center',marginBottom:36,padding:'0 5%',position:'relative',zIndex:2}}>
          <div style={{fontSize:11,letterSpacing:'.24em',textTransform:'uppercase',color:C.gradText,fontWeight:700,marginBottom:12,opacity:.8}}>✦ Premium Gifting ✦</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(28px,4.5vw,52px)',fontWeight:600,fontStyle:'italic',color:'#fff',lineHeight:1.1,marginBottom:12}}>Gift Something Unforgettable</h2>
          <p style={{fontSize:14,color:'rgba(255,255,255,.5)',maxWidth:460,margin:'0 auto',lineHeight:1.8}}>Curated luxury gift sets — jewellery, flowers, chocolates & VIP packaging delivered with love.</p>
        </div>
        <div style={{overflow:'hidden',marginBottom:36}}>
          <div style={{display:'flex',gap:16,padding:'4px 5%',overflowX:'auto',scrollbarWidth:'none',WebkitOverflowScrolling:'touch',scrollSnapType:'x mandatory'}}>
            {[
              {img:'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=700&auto=format&fit=crop&q=85',tag:'Most Popular',title:'VIP Gift Box',desc:'Luxury velvet-lined keepsake with ribbon & authenticity card'},
              {img:'https://images.unsplash.com/photo-1548532928-b34e3be62062?w=700&auto=format&fit=crop&q=85',tag:'Most Romantic',title:'Flowers & Chocolates',desc:'Premium roses + Belgian chocolates with your jewellery piece'},
              {img:'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=700&auto=format&fit=crop&q=85',tag:'Premium',title:'Complete Hamper',desc:'Everything together — jewellery, box, flowers & surprise add-on'},
              {img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&auto=format&fit=crop&q=85',tag:'Bestseller',title:'Jewellery Gift Set',desc:'Certified 925 silver pieces beautifully packed for gifting'},
              {img:'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=700&auto=format&fit=crop&q=85',tag:'Exclusive',title:'Gold Jewellery Gifts',desc:'BIS hallmarked gold pieces — the most timeless gift of all'},
            ].map((card,i)=>(
              <div key={i} onClick={()=>navigate('/gifting')} style={{position:'relative',flexShrink:0,cursor:'pointer',width:'clamp(260px, 38vw, 340px)',height:420,borderRadius:12,overflow:'hidden',background:'#111',scrollSnapAlign:'start',transition:'transform .3s',border:'1px solid rgba(255,255,255,.08)'}}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-6px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
              >
                <img src={card.img} alt={card.title} loading="lazy" crossOrigin="anonymous" style={{width:'100%',height:'100%',objectFit:'cover',opacity:.7}} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&auto=format&fit=crop&q=80'}}/>
                <div style={{position:'absolute',inset:0,background:`linear-gradient(to top, ${C.bgDark3}F5 0%, ${C.bgDark2}66 55%, transparent 100%)`}}/>
                <div style={{position:'absolute',top:14,left:14,background:C.primary,color:'#fff',fontSize:9,fontWeight:800,letterSpacing:'.12em',textTransform:'uppercase',padding:'4px 10px',borderRadius:20}}>{card.tag}</div>
                <div style={{position:'absolute',bottom:0,left:0,right:0,padding:'24px 20px'}}>
                  <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,fontStyle:'italic',color:'#fff',marginBottom:6}}>{card.title}</div>
                  <div style={{fontSize:12,color:'rgba(255,255,255,.55)',lineHeight:1.5,marginBottom:14}}>{card.desc}</div>
                  <span style={{fontSize:10,letterSpacing:'.14em',textTransform:'uppercase',fontWeight:700,color:C.gradText,display:'flex',alignItems:'center',gap:5}}>Explore →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap',padding:'0 5%',position:'relative',zIndex:2}}>
          <BtnPrimary onClick={()=>navigate('/gifting')} style={{padding:'14px 40px',fontSize:13,borderRadius:6}}>Explore All Gift Sets →</BtnPrimary>
          <button onClick={()=>navigate('/gifting')} style={{background:'transparent',color:C.gradText,border:`1.5px solid ${C.gradText}4D`,padding:'13px 32px',fontSize:12,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer',borderRadius:6,fontFamily:"'Jost',sans-serif",transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${C.gradText}12`;e.currentTarget.style.borderColor=`${C.gradText}99`}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=`${C.gradText}4D`}}
          >Custom Gift Piece</button>
        </div>
      </section>

      {/* ADORE PROMISE */}
      <section style={{background:C.bg,padding:'clamp(40px,5vw,64px) 5%'}}>
        <SectionHeader title="The ADORE Promise" subtitle="Why choose us" centered/>
        <div className="home-trust" style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:1,background:C.trustBorder,border:`1px solid ${C.trustBorder}`}}>
          {TRUST_ITEMS.map((item,i)=>(
            <div key={i} style={{background:'#fff',padding:'28px 24px',display:'flex',alignItems:'flex-start',gap:16,transition:'background .2s'}}
              onMouseEnter={e=>e.currentTarget.style.background=C.trustBg}
              onMouseLeave={e=>e.currentTarget.style.background='#fff'}
            >
              <div style={{width:52,height:52,borderRadius:'50%',background:C.trustCircle,border:`1px solid ${C.trustBorder}`,display:'flex',alignItems:'center',justifyContent:'center',color:C.trustIcon,flexShrink:0}}>{item.icon}</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.trustLabel,marginBottom:6,letterSpacing:'.02em'}}>{item.label}</div>
                <div style={{fontSize:13,color:'#888',lineHeight:1.6}}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP BY COLOR — near bottom */}
      <section style={{padding:'clamp(40px,5vw,64px) 5%',background:C.bgLight}}>
        <SectionHeader title="Shop by Color" subtitle="Find your shade" onViewAll={()=>navigate('/shop')}/>
        <div style={{display:'flex',gap:14,overflowX:'auto',paddingBottom:8,marginBottom:-8}}>
          {[
            {label:'Yellow Gold',color:'#D4AF37',hex:'Yellow Gold',img:'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&auto=format&fit=crop&q=80'},
            {label:'Rose Gold',color:'#B76E79',hex:'Rose Gold',img:'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&auto=format&fit=crop&q=80'},
            {label:'White Gold',color:'#E8E8E8',hex:'White Gold',img:'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80'},
            {label:'Silver',color:'#C0C0C0',hex:'Silver',img:'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&auto=format&fit=crop&q=80'},
            {label:'Diamond',color:'#B9F2FF',hex:'Diamond',img:'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=80'},
            {label:'Ruby Red',color:'#9B111E',hex:'Ruby',img:'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&auto=format&fit=crop&q=80'},
            {label:'Emerald',color:'#50C878',hex:'Emerald',img:'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&auto=format&fit=crop&q=80'},
            {label:'Sapphire',color:'#0F52BA',hex:'Sapphire',img:'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=400&auto=format&fit=crop&q=80'},
          ].map(c=>(
            <div key={c.label} onClick={()=>navigate(`/shop?color=${encodeURIComponent(c.hex)}`)} style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:10,cursor:'pointer',width:90}}>
              <div style={{width:80,height:80,borderRadius:'50%',overflow:'hidden',position:'relative',border:'3px solid transparent',boxShadow:'0 2px 12px rgba(0,0,0,.12)',transition:'transform .25s,box-shadow .25s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.08)';e.currentTarget.style.boxShadow=`0 4px 20px ${c.color}55`}}
                onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,.12)'}}
              >
                <img src={c.img} alt={c.label} loading="lazy" crossOrigin="anonymous" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e=>{e.currentTarget.onerror=null;e.currentTarget.style.display='none'}}/>
                <div style={{position:'absolute',inset:0,background:c.color,opacity:0.45,mixBlendMode:'color'}}/>
              </div>
              <span style={{fontSize:11,letterSpacing:'.08em',textTransform:'uppercase',fontWeight:700,color:C.text,textAlign:'center',lineHeight:1.3}}>{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CRAFT YOUR OWN — above certified & trusted */}
      <div style={{background:C.customGrad,padding:'clamp(32px, 5vw, 56px) 5%',display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',gap:14,position:'relative',overflow:'hidden',borderTop:`1px solid ${C.customBorder}`,borderBottom:`1px solid ${C.customBorder}`}}>
        <div style={{position:'absolute',inset:0,opacity:.04,backgroundImage:`radial-gradient(circle, ${C.sectionPattern} 1px, transparent 1px)`,backgroundSize:'24px 24px',pointerEvents:'none'}}/>
        <span style={{fontSize:10,letterSpacing:'.22em',textTransform:'uppercase',color:C.primary,fontWeight:700,position:'relative',zIndex:1}}>✦ Bespoke Jewellery</span>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontStyle:'italic',fontSize:'clamp(28px, 5vw, 52px)',fontWeight:600,color:C.primaryDark,lineHeight:1.1,margin:0,position:'relative',zIndex:1}}>Craft Your Own Piece</h2>
        <p style={{fontSize:14,color:C.textMid,maxWidth:400,lineHeight:1.7,margin:0,position:'relative',zIndex:1,opacity:.85}}>Tell us your vision — we'll handcraft it in gold, silver, or platinum</p>
        <BtnPrimary onClick={()=>navigate('/custom-jewellery')} style={{marginTop:8,position:'relative',zIndex:1,borderRadius:6}}>Customize Now →</BtnPrimary>
        <div style={{height:1,width:60,background:C.border,marginTop:8,position:'relative',zIndex:1}}/>
        <div style={{display:'flex',justifyContent:'center',gap:32,marginTop:8,flexWrap:'wrap',position:'relative',zIndex:1}}>
          {[{val:'3–6 weeks',lbl:'Delivery Time'},{val:'100%',lbl:'Certified'},{val:'₹5k+',lbl:'Starting Budget'}].map(st=>(
            <div key={st.lbl} style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:C.primary,marginBottom:4}}>{st.val}</div>
              <div style={{fontSize:10,letterSpacing:'.12em',textTransform:'uppercase',color:C.textMid,fontWeight:600,opacity:.7}}>{st.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CERTIFIED & TRUSTED + OUR COMMITMENT */}
      <section style={{padding:'clamp(40px,5vw,64px) 5%',borderTop:`1px solid ${C.primary}14`,background:'#fff'}}>
        <SectionHeader title="Certified & Trusted" subtitle="Our guarantees" centered/>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))',gap:16,marginBottom:48}}>
          {CERTIFICATIONS.map((cert,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'18px 20px',border:'1.5px solid',borderColor:cert.color+'30',borderRadius:4,background:cert.color+'08'}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:cert.color+'15',border:`1.5px solid ${cert.color}40`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={cert.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              </div>
              <div>
                <div style={{fontSize:14,fontWeight:700,color:cert.color,letterSpacing:'.02em',marginBottom:3}}>{cert.name}</div>
                <div style={{fontSize:11,color:'#888',lineHeight:1.4}}>{cert.detail}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="commitment-grid" style={{background:C.commitGrad,borderRadius:4,padding:'clamp(32px, 5vw, 56px)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:32,alignItems:'center'}}>
          <div>
            <div style={{fontSize:11,letterSpacing:'.2em',textTransform:'uppercase',color:C.gradText,marginBottom:12,fontWeight:600}}>Our Commitment</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(24px, 3.5vw, 40px)',fontWeight:600,color:'#fff',lineHeight:1.2,marginBottom:16,fontStyle:'italic'}}>Every piece is tested,<br/>certified & guaranteed</h3>
            <p style={{fontSize:13,color:'rgba(255,255,255,.55)',lineHeight:1.8,maxWidth:380}}>Each ADORE piece undergoes rigorous quality testing at government-approved labs. Our gold is BIS hallmarked, our diamonds are IGI/GIA certified, and every gemstone is lab-verified for authenticity.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {[{val:'100%',lbl:'BIS Certified'},{val:'18K+',lbl:'Gold Standard'},{val:'50,000+',lbl:'Happy Customers'},{val:'5★',lbl:'Avg Rating'}].map((stat,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,.06)',border:`1px solid ${C.gradText}26`,borderRadius:4,padding:'20px 16px',textAlign:'center'}}>
                <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:C.gradText,marginBottom:6}}>{stat.val}</div>
                <div style={{fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.45)',fontWeight:600}}>{stat.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{background:C.nlBg,padding:'clamp(48px,6vw,72px) 5%',textAlign:'center'}}>
        <div style={{maxWidth:520,margin:'0 auto'}}>
          <div style={{fontSize:11,letterSpacing:'.22em',textTransform:'uppercase',color:C.nlAccent,fontWeight:600,marginBottom:14}}>Stay in the loop</div>
          <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(28px, 4vw, 44px)',fontWeight:600,fontStyle:'italic',color:'#fff',lineHeight:1.15,marginBottom:12}}>Exclusive offers &<br/>new arrivals first</h2>
          <p style={{fontSize:13,color:'rgba(255,255,255,.5)',marginBottom:28,lineHeight:1.6}}>Subscribe and get ₹500 off on your first order.</p>
          {subscribed?(
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,color:C.nlAccent,fontSize:15}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              You're subscribed! Check your inbox for ₹500 off.
            </div>
          ):(
            <form onSubmit={handleSubscribe} style={{display:'flex',gap:0,maxWidth:440,margin:'0 auto',border:'1.5px solid rgba(255,255,255,.15)',borderRadius:2,overflow:'hidden'}}>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email address" style={{flex:1,padding:'14px 18px',background:'rgba(255,255,255,.07)',border:'none',color:'#fff',fontSize:14,outline:'none',fontFamily:"'Jost',sans-serif"}}/>
              <button type="submit" style={{background:C.btnBg,color:'#4A2C0A',border:'none',padding:'14px 24px',fontSize:12,fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',fontFamily:"'Jost',sans-serif",flexShrink:0}}>Subscribe</button>
            </form>
          )}
          <p style={{fontSize:11,color:'rgba(255,255,255,.25)',marginTop:14,letterSpacing:'.04em'}}>No spam, unsubscribe anytime.</p>
        </div>
      </section>

      <style>{`
        @media(max-width:600px){
          .home-two-col{grid-template-columns:1fr!important}
          .promo-banners{grid-template-columns:1fr!important}
          .commitment-grid{grid-template-columns:1fr!important}
          .commitment-grid>div:last-child{grid-template-columns:1fr 1fr!important}
          .grid-2-col-mobile{grid-template-columns:repeat(2,1fr)!important}
          .shubh-prices-grid{grid-template-columns:repeat(2,1fr)!important}
        }
        @media(max-width:480px){
          .shubh-prices-grid{grid-template-columns:repeat(2,1fr)!important}
        }
      `}</style>
    </div>
  )
}

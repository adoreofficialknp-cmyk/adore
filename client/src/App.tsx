import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Home as HomeIcon, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Plus, 
  Minus, 
  Trash2,
  Settings as SettingsIcon,
  Package,
  Users,
  LayoutDashboard,
  LogOut,
  Bell,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  Info,
  Upload,
  Edit,
  Trash,
  Send,
  Truck,
  CheckCircle2,
  Star,
  ShieldCheck,
  Award,
  RefreshCcw,
  Download,
  ExternalLink,
  Instagram,
  Facebook,
  Linkedin,
  MessageCircle,
  Ruler,
  Tag,
  MapPin,
  Clock,
  ArrowRight,
  LayoutGrid,
  List,
  Filter,
  ArrowLeft,
  ArrowUpDown,
  CreditCard,
  Camera,
  Percent,
  Ticket
} from 'lucide-react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useStore } from './store';
import { Product, CartItem, User, Order, Category, HomepageContent, Settings, Review, Coupon } from './types';
import { signInWithGoogle, checkGoogleRedirectResult, isFirebaseConfigured } from './firebaseConfig';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const LoadingJewelry = () => {
  return (
    <div className="fixed inset-0 z-[200] bg-aura-paper flex flex-col items-center justify-center">
      <div className="relative w-24 h-24">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            borderRadius: ["20%", "50%", "20%"],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            repeat: Infinity,
          }}
          className="w-full h-full border-4 border-aura-gold/30 flex items-center justify-center"
        >
          <ShoppingBag className="w-10 h-10 text-aura-gold" />
        </motion.div>
        <motion.div
          animate={{
            scale: [1.5, 1, 1.5],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="absolute inset-0 bg-aura-gold/10 rounded-full blur-xl"
        />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-[10px] uppercase tracking-[0.4em] font-bold text-aura-ink/40"
      >
        Crafting Perfection...
      </motion.p>
    </div>
  );
};

const LocationPicker = ({ onSelect, onClose }: { onSelect: (city: string, country: string) => void, onClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  const detectLocation = () => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            // In a real app, we'd use reverse geocoding here
            // For now, we'll simulate it or use a public API
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`);
            const data = await res.json();
            onSelect(data.city || data.locality || 'Mumbai', data.countryName || 'India');
            onClose();
          } catch (err) {
            console.error(err);
            onSelect('Mumbai', 'India');
            onClose();
          } finally {
            setLoading(false);
          }
        },
        (err) => {
          console.error(err);
          setLoading(false);
          alert("Location access denied. Please select manually.");
        }
      );
    } else {
      setLoading(false);
      alert("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-aura-ink/60 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-white rounded-[3rem] p-10 shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-serif">Select Location</h2>
          <button onClick={onClose} className="p-2 hover:bg-aura-paper rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <button 
            onClick={detectLocation}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-aura-gold text-white py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-aura-ink transition-all shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
            {loading ? 'Detecting...' : 'Detect My Location'}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-aura-ink/5"></div></div>
            <span className="relative bg-white px-4 text-[10px] uppercase tracking-widest text-aura-ink/40 font-bold">or search</span>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-ink/40" />
              <input 
                type="text" 
                placeholder="Search city..."
                className="w-full bg-aura-paper border border-aura-ink/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-aura-gold transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-48 overflow-y-auto scrollbar-hide space-y-2">
              {['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad']
                .filter(city => city.toLowerCase().includes(search.toLowerCase()))
                .map(city => (
                  <button 
                    key={city}
                    onClick={() => {
                      onSelect(city, 'India');
                      onClose();
                    }}
                    className="w-full text-left px-6 py-3 rounded-xl hover:bg-aura-paper text-sm transition-colors flex items-center justify-between group"
                  >
                    <span>{city}, India</span>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-aura-gold" />
                  </button>
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const TopBar = ({ cartCount, wishlistCount }: { cartCount: number; wishlistCount: number }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationData, setLocationData] = useState<{ city: string, country: string } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const savedLocation = localStorage.getItem('user_location');
    if (savedLocation) {
      setLocationData(JSON.parse(savedLocation));
    } else {
      fetch('https://api.bigdatacloud.net/data/reverse-geocode-client')
        .then(res => res.json())
        .then(data => {
          const loc = { city: data.city || 'Mumbai', country: data.countryName || 'India' };
          setLocationData(loc);
          localStorage.setItem('user_location', JSON.stringify(loc));
        })
        .catch(() => setLocationData({ city: 'Mumbai', country: 'India' }));
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLocationSelect = (city: string, country: string) => {
    const loc = { city, country };
    setLocationData(loc);
    localStorage.setItem('user_location', JSON.stringify(loc));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-2 sm:px-4 md:px-8",
      isScrolled ? "py-1 sm:py-2" : "py-2 sm:py-4"
    )}>
      <div className={cn(
        "max-w-7xl mx-auto rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-500 flex flex-col gap-1 sm:gap-2",
        isScrolled ? "bg-white/90 backdrop-blur-xl shadow-lg p-2 sm:p-3" : "bg-white/40 backdrop-blur-md p-3 sm:p-4"
      )}>
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 sm:gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-aura-ink text-white flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-lg">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-lg sm:text-xl font-serif tracking-tighter block">ADORE</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative group">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-aura-paper/50 border border-aura-ink/5 rounded-full py-1.5 sm:py-2.5 pl-9 sm:pl-12 pr-4 outline-none focus:bg-white focus:border-aura-gold/30 transition-all text-xs sm:text-sm"
            />
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-aura-ink/40 group-focus-within:text-aura-gold transition-colors" />
          </form>

          {/* Icons */}
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            <Link to="/wishlist" className="relative p-1.5 sm:p-2 hover:bg-aura-paper rounded-full transition-colors">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-aura-ink" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-aura-gold text-white text-[8px] sm:text-[10px] w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative p-1.5 sm:p-2 hover:bg-aura-paper rounded-full transition-colors">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-aura-ink" />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-aura-gold text-white text-[8px] sm:text-[10px] w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Location Bar */}
        <div className="flex items-center justify-between px-2 sm:px-4">
          <div className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] uppercase tracking-widest text-aura-ink/40 font-bold">
            <MapPin className="w-2.5 h-2.5 sm:w-3 h-3 text-aura-gold" />
            <span className="truncate max-w-[150px] sm:max-w-none">Deliver to: {locationData ? `${locationData.city}, ${locationData.country}` : 'Loading...'}</span>
          </div>
          <button 
            onClick={() => setShowLocationPicker(true)}
            className="text-[7px] sm:text-[8px] uppercase tracking-widest font-bold text-aura-gold hover:text-aura-ink transition-colors border-b border-aura-gold/20"
          >
            Change
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showLocationPicker && (
          <LocationPicker 
            onSelect={handleLocationSelect} 
            onClose={() => setShowLocationPicker(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const BottomNav = () => {
  const location = useLocation();
  const { user } = useStore();
  
  const navItems = [
    { icon: HomeIcon, label: 'Home', path: '/' },
    { icon: Search, label: 'Shop', path: '/shop' },
    { icon: Heart, label: 'Gifting', path: '/shop?category=Gifting' },
    { icon: UserIcon, label: 'Profile', path: '/profile' },
  ];

  if (user?.role === 'admin') {
    navItems.push({ icon: LayoutDashboard, label: 'Admin', path: '/admin-portal-secure-access' });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 glass bottom-nav-shadow z-50 flex items-center justify-around px-4">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.label === 'Gifting' && location.search.includes('category=Gifting'));
        return (
          <Link 
            key={item.path} 
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors duration-300",
              isActive ? "text-aura-gold" : "text-aura-ink/40"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-widest font-medium">{item.label}</span>
            {isActive && (
              <motion.div 
                layoutId="nav-indicator"
                className="w-1 h-1 bg-aura-gold rounded-full mt-1"
              />
            )}
          </Link>
        );
      })}
    </div>
  );
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(price);
};

const validateMobile = (phone: string) => {
  // Validates 10 digit Indian mobile number starting with 6-9
  return /^[6-9]\d{9}$/.test(phone.trim());
};

const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted }: { 
  product: Product; 
  onAddToCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  isWishlisted: boolean;
  key?: string;
}) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer bg-white rounded-xl p-2 md:p-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500 flex flex-col h-full relative"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-aura-paper mb-4 shrink-0">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'; }}
          referrerPolicy="no-referrer"
        />
        
        {/* Wishlist Icon */}
        <button 
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleWishlist(product.id); }}
          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 backdrop-blur-md hover:bg-white transition-all z-10 shadow-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 duration-300"
        >
          <Heart className={cn("w-3.5 h-3.5 transition-all", isWishlisted ? "fill-red-500 text-red-500 scale-110" : "text-aura-ink")} />
        </button>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.is_best_seller && (
            <div className="bg-aura-gold/90 backdrop-blur-md px-2 py-0.5 rounded shadow-sm">
              <span className="text-[7px] font-bold text-white uppercase tracking-widest">Best Seller</span>
            </div>
          )}
          {product.is_top_rated && (
            <div className="bg-aura-ink/90 backdrop-blur-md px-2 py-0.5 rounded shadow-sm">
              <span className="text-[7px] font-bold text-white uppercase tracking-widest">Top Rated</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col px-1">
        <div className="space-y-1 mb-4">
          <p className="text-[7px] uppercase tracking-[0.2em] text-aura-gold font-bold">{product.category}</p>
          <h3 className="font-serif text-[11px] md:text-xs leading-tight line-clamp-2 group-hover:text-aura-gold transition-colors">{product.name}</h3>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-xs md:text-sm font-bold text-aura-ink">₹{product.price.toLocaleString('en-IN')}</p>
            {product.original_price && (
              <p className="text-[9px] md:text-[10px] text-aura-ink/30 line-through font-light">₹{product.original_price.toLocaleString('en-IN')}</p>
            )}
          </div>
        </div>
        
        <div className="mt-auto pt-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <button 
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onAddToCart(product.id); }}
              className="text-aura-ink text-[8px] font-bold uppercase tracking-widest hover:text-aura-gold transition-all flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3 h-3" /> Add to Bag
            </button>
            <ArrowRight className="w-3 h-3 text-aura-ink/20 group-hover:text-aura-gold group-hover:translate-x-1 transition-all" />
          </div>
          <button 
            onClick={(e) => { 
              e.stopPropagation(); 
              e.preventDefault(); 
              onAddToCart(product.id);
              navigate('/cart');
            }}
            className="w-full bg-aura-gold text-white py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-aura-ink transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <ArrowRight className="w-3 h-3" /> Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// --- Ring Sizer Component ---
const RingSizerContent = () => {
  const [showInteractiveSizer, setShowInteractiveSizer] = useState(false);

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-aura-gold/10 p-8 rounded-[2rem] border border-aura-gold/20">
        <div className="max-w-md">
          <h3 className="text-2xl font-serif mb-2">Not sure about your size?</h3>
          <p className="text-aura-ink/60 text-sm">Use our interactive ring sizer to measure your finger diameter directly on your screen.</p>
        </div>
        <button 
          onClick={() => setShowInteractiveSizer(true)}
          className="bg-aura-gold text-white px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-aura-ink transition-all shadow-lg flex items-center gap-3"
        >
          <Ruler className="w-4 h-4" />
          Measure Now
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="bg-aura-paper p-8 rounded-3xl border border-aura-ink/5">
            <h3 className="text-xl font-serif mb-4">How to measure?</h3>
            <ol className="space-y-4 list-decimal list-inside text-sm text-aura-ink/60 leading-relaxed">
              <li>Wrap a piece of string or paper around the base of your finger.</li>
              <li>Mark the point where the ends meet with a pen.</li>
              <li>Measure the string or paper with a ruler (mm).</li>
              <li>Pick the closest measurement on the ring size chart to find your size.</li>
            </ol>
          </div>
          <div className="bg-aura-gold/5 p-8 rounded-3xl border border-aura-gold/10">
            <h3 className="text-xl font-serif mb-4 text-aura-gold">Pro Tips</h3>
            <ul className="space-y-3 list-disc list-inside text-sm text-aura-ink/60 leading-relaxed">
              <li>Measure your finger at the end of the day when it's at its largest.</li>
              <li>Measure 3-4 times to eliminate an erroneous reading.</li>
              <li>Avoid using string or paper that stretches.</li>
            </ul>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-aura-ink/10">
                <th className="py-4 text-[10px] uppercase tracking-widest font-bold text-aura-ink/40">Inside Diameter (mm)</th>
                <th className="py-4 text-[10px] uppercase tracking-widest font-bold text-aura-ink/40">Indian Size</th>
                <th className="py-4 text-[10px] uppercase tracking-widest font-bold text-aura-ink/40">US Size</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { d: '14.1', in: '6', us: '3' },
                { d: '14.9', in: '8', us: '4' },
                { d: '15.7', in: '10', us: '5' },
                { d: '16.5', in: '12', us: '6' },
                { d: '17.3', in: '14', us: '7' },
                { d: '18.1', in: '16', us: '8' },
                { d: '19.0', in: '18', us: '9' },
                { d: '19.8', in: '20', us: '10' }
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-aura-ink/5 hover:bg-aura-paper transition-colors">
                  <td className="py-4 font-mono">{row.d}</td>
                  <td className="py-4 font-bold">{row.in}</td>
                  <td className="py-4">{row.us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showInteractiveSizer && (
          <RingSizer onClose={() => setShowInteractiveSizer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const RingSizer = ({ onClose }: { onClose: () => void }) => {
  const [size, setSize] = useState(50); // diameter in pixels
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-aura-ink/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white rounded-[3rem] p-8 max-w-md w-full shadow-2xl text-center"
      >
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-aura-paper rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <Ruler className="w-12 h-12 text-aura-gold mx-auto mb-6" />
        <h2 className="text-3xl font-serif mb-2">Ring Sizer</h2>
        <p className="text-aura-ink/60 text-sm mb-8">Place your ring on the circle and adjust the slider until it matches the inner edge of your ring.</p>
        
        <div className="relative flex items-center justify-center h-64 mb-8 bg-aura-paper rounded-[2rem] border-2 border-dashed border-aura-ink/5">
          <div 
            className="rounded-full border-4 border-aura-gold bg-white shadow-inner transition-all duration-300"
            style={{ width: `${size}px`, height: `${size}px` }}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-widest text-aura-gold">
            Inner Diameter: {(size / 3.78).toFixed(1)} mm
          </div>
        </div>
        
        <div className="space-y-6">
          <input 
            type="range" 
            min="40" 
            max="150" 
            value={size} 
            onChange={(e) => setSize(parseInt(e.target.value))}
            className="w-full accent-aura-gold"
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-aura-paper p-4 rounded-2xl">
              <p className="text-[10px] uppercase tracking-widest text-aura-ink/40 font-bold mb-1">Indian Size</p>
              <p className="text-2xl font-serif">{Math.round((size / 3.78) - 10)}</p>
            </div>
            <div className="bg-aura-paper p-4 rounded-2xl">
              <p className="text-[10px] uppercase tracking-widest text-aura-ink/40 font-bold mb-1">US Size</p>
              <p className="text-2xl font-serif">{((size / 3.78) / 2.5).toFixed(1)}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams();
  const { products, addToCart, toggleWishlist, wishlist, user, homepageContent } = useStore();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productContent = homepageContent
    .filter(item => item.active && (item.page === 'product' || (item.page === 'all' && item.type !== 'color_grid')))
    .sort((a, b) => a.order_index - b.order_index);

  const fetchReviews = useCallback(async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/products/${id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      fetch(`/api/products/${id}/view`, { method: 'POST' }).catch(() => {});
    }
    window.scrollTo(0, 0);
    fetchReviews();
  }, [id, fetchReviews, product]);

  if (!product) return <div className="pt-32 text-center">Product not found</div>;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/profile');
      return;
    }
    if (!newReview.comment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          rating: newReview.rating,
          comment: newReview.comment
        })
      });
      if (res.ok) {
        setNewReview({ rating: 5, comment: '' });
        fetchReviews();
      }
    } catch (err) {
      console.error("Failed to submit review", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const similarProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="pb-24 pt-24 px-6 max-w-7xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-aura-ink/60 hover:text-aura-ink mb-8 text-xs uppercase tracking-widest font-bold">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-24">
        <div className="space-y-6">
          <div className="aspect-square rounded-[3rem] overflow-hidden bg-white border border-aura-ink/5">
            <img src={product.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'} className="w-full h-full object-cover" alt={product.name} referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800'; }} />
          </div>
          {((): string[] => {
              const imgs = product.images;
              if (Array.isArray(imgs)) return imgs;
              if (typeof imgs === 'string') { try { return JSON.parse(imgs); } catch { return []; } }
              return [];
            })().length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {((): string[] => {
                const imgs = product.images;
                if (Array.isArray(imgs)) return imgs;
                if (typeof imgs === 'string') { try { return JSON.parse(imgs); } catch { return []; } }
                return [];
              })().map((img, i) => (
                <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-aura-ink/5">
                  <img src={img} className="w-full h-full object-cover" alt={`${product.name} ${i}`} referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-aura-gold text-xs uppercase tracking-[0.3em] font-bold mb-4">{product.category} • {product.subcategory}</p>
          <h1 className="text-4xl md:text-6xl font-serif mb-6 leading-tight">{product.name}</h1>
          <p className="text-3xl font-light text-aura-ink/90 mb-8">{formatPrice(product.price)}</p>
          
          <div className="prose prose-stone mb-12">
            <p className="text-aura-ink/60 leading-relaxed text-lg">{product.description}</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button 
              onClick={() => addToCart(product.id)}
              className="flex-1 bg-aura-ink text-white py-5 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-aura-gold transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <ShoppingBag className="w-5 h-5" /> Add to Bag
            </button>
            <button 
              onClick={() => {
                addToCart(product.id);
                navigate('/cart');
              }}
              className="flex-1 bg-aura-gold text-white py-5 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-aura-ink transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <ArrowRight className="w-5 h-5" /> Buy Now
            </button>
          </div>
          <div className="mb-12">
            <button 
              onClick={() => toggleWishlist(product.id)}
              className={cn(
                "w-full py-5 rounded-2xl border transition-all flex items-center justify-center gap-3",
                wishlist.includes(product.id) 
                  ? "bg-red-50 border-red-100 text-red-500" 
                  : "border-aura-ink/10 hover:bg-aura-paper"
              )}
            >
              <Heart className={cn("w-5 h-5", wishlist.includes(product.id) && "fill-current")} />
              {wishlist.includes(product.id) ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-8 border-t border-aura-ink/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-aura-gold/10 flex items-center justify-center text-aura-gold">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold">Free Shipping</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-aura-gold/10 flex items-center justify-center text-aura-gold">
                <Info className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold">Authentic</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-aura-gold/10 flex items-center justify-center text-aura-gold">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] uppercase tracking-widest font-bold">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-1">
            <h2 className="text-3xl font-serif mb-8">Customer Reviews</h2>
            {user ? (
              <form onSubmit={handleSubmitReview} className="bg-white p-8 rounded-[2rem] border border-aura-ink/5 shadow-sm">
                <h3 className="text-lg font-serif mb-6">Write a Review</h3>
                <div className="mb-6">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-aura-ink/40 mb-3">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1 transition-transform hover:scale-110"
                      >
                        <Star className={cn("w-6 h-6", star <= newReview.rating ? "fill-aura-gold text-aura-gold" : "text-aura-ink/10")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-8">
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-aura-ink/40 mb-3">Your Comment</label>
                  <textarea
                    required
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-2xl px-4 py-4 outline-none focus:border-aura-gold h-32 resize-none transition-colors"
                    placeholder="Share your thoughts about this piece..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-aura-ink text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-aura-gold transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Review'}
                </button>
              </form>
            ) : (
              <div className="bg-aura-paper/50 p-8 rounded-[2rem] border border-aura-ink/5 text-center">
                <p className="text-aura-ink/60 mb-6">Please log in to share your experience.</p>
                <Link to="/profile" className="text-aura-gold font-bold uppercase tracking-widest text-[10px] border-b border-aura-gold pb-1">Login Now</Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-8">
              {reviews.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[2.5rem] border border-aura-ink/5">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-aura-ink/10" />
                  <p className="text-aura-ink/40 italic">No reviews yet. Be the first to review this masterpiece.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    key={review.id}
                    className="bg-white p-8 rounded-[2rem] border border-aura-ink/5 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-aura-ink mb-1">{review.user_name}</h4>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star key={star} className={cn("w-3 h-3", star <= review.rating ? "fill-aura-gold text-aura-gold" : "text-aura-ink/10")} />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-aura-ink/40 font-bold">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-aura-ink/70 leading-relaxed italic">"{review.comment}"</p>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Product Page Content Sections */}
      {productContent.length > 0 && (
        <div className="mb-24">
          {productContent.map(item => (
            <ContentSection key={item.id} item={item} />
          ))}
        </div>
      )}

      {similarProducts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-serif">Similar Products</h2>
            <Link to={`/shop?category=${product.category}`} className="text-xs uppercase tracking-widest text-aura-gold font-bold">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map(p => (
              <ProductCard 
                key={p.id} 
                product={p} 
                onAddToCart={addToCart} 
                onToggleWishlist={toggleWishlist} 
                isWishlisted={wishlist.includes(p.id)} 
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// --- Pages ---

const ContentSection: React.FC<{ item: HomepageContent; isGridItem?: boolean }> = ({ item, isGridItem = false }) => {
  const navigate = useNavigate();
  const { products, addToCart, toggleWishlist, wishlist } = useStore();

  if (!item.active) return null;

  const handleAction = () => {
    navigate(item.button_link || item.link_url || '/shop');
  };

  return (
    <motion.section 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={cn(
        "relative z-10",
        isGridItem ? "" : item.type === 'gifting' ? "mb-0 px-6 sm:px-8" : "mb-12 px-6 sm:px-8"
      )}
    >
      <div className={cn(isGridItem ? "" : "max-w-7xl mx-auto")}>
      {item.type === 'section' && (
        <div className={cn(
          "bg-white rounded-[2.5rem] border border-aura-ink/5 shadow-sm overflow-hidden relative min-h-[350px] flex flex-col md:flex-row items-stretch",
          item.layout === 'left' ? "md:flex-row-reverse" : 
          item.layout === 'top' ? "flex-col" : "md:flex-row"
        )}>
          <div className={cn(
            "relative z-10 w-full p-8 md:p-16 flex flex-col justify-center",
            item.layout === 'background' ? "bg-white/80 backdrop-blur-md m-6 md:m-16 rounded-3xl max-w-xl" : 
            item.layout === 'top' ? "text-center max-w-3xl mx-auto" : "md:w-1/2"
          )}>
            <h3 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">{item.title}</h3>
            <p className="text-aura-ink/60 mb-10 text-base leading-relaxed">{item.subtitle}</p>
            {item.button_text && (
              <div className={cn(item.layout === 'top' && "flex justify-center")}>
                <button 
                  onClick={handleAction}
                  className="bg-aura-ink text-white px-12 py-5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-aura-gold transition-all shadow-lg hover:shadow-aura-gold/20"
                >
                  {item.button_text}
                </button>
              </div>
            )}
          </div>
          {item.image_url && (
            <div className={cn(
              "relative overflow-hidden",
              item.layout === 'background' ? "absolute inset-0 w-full h-full -z-0" : 
              item.layout === 'top' ? "w-full h-80 md:h-[500px]" : "w-full md:w-1/2 h-80 md:h-auto"
            )}>
              <motion.img 
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 1.5 }}
                src={item.image_url} 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
              {item.layout === 'background' && <div className="absolute inset-0 bg-black/5" />}
            </div>
          )}
        </div>
      )}
      
      {item.type === 'gifting' && (
        <div className={cn(
          "bg-white rounded-[3rem] border border-aura-ink/5 shadow-sm overflow-hidden relative",
          item.layout === 'background' ? "bg-aura-ink text-white p-8 sm:p-12 md:p-24" : ""
        )}>
          {item.layout === 'background' ? (
            <>
              <div className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-30 pointer-events-none">
                <img 
                  src={item.image_url} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="relative z-20 max-w-xl">
                <span className="text-aura-gold text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block">The Art of Gifting</span>
                <h3 className="text-3xl md:text-6xl font-serif mb-6 md:mb-8 leading-tight">{item.title}</h3>
                <p className="text-white/60 text-sm md:text-lg mb-8 md:mb-12 font-light leading-relaxed">{item.subtitle}</p>
                <div className="flex flex-wrap gap-4 md:gap-6">
                  {item.button_text && (
                    <button 
                      onClick={handleAction}
                      className="bg-aura-gold text-white px-8 md:px-10 py-3 md:py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-aura-ink transition-all duration-500 shadow-2xl"
                    >
                      {item.button_text}
                    </button>
                  )}
                  <button 
                    onClick={() => navigate('/shop?category=Gifting')}
                    className="border border-white/20 text-white px-8 md:px-10 py-3 md:py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                  >
                    Explore Gifts
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-2",
              item.layout === 'left' && "md:flex md:flex-row-reverse"
            )}>
              <div className="p-10 md:p-20 flex flex-col justify-center md:w-1/2">
                <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-aura-gold mb-6 block">The Art of Gifting</span>
                <h3 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">{item.title}</h3>
                <p className="text-aura-ink/60 mb-10 text-base leading-relaxed">{item.subtitle}</p>
                <div className="flex flex-wrap gap-6">
                  {item.button_text && (
                    <button 
                      onClick={handleAction}
                      className="bg-aura-ink text-white px-12 py-5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-aura-gold transition-all shadow-xl"
                    >
                      {item.button_text}
                    </button>
                  )}
                  <button 
                    onClick={() => navigate('/shop?category=Gifting')}
                    className="bg-aura-paper text-aura-ink px-12 py-5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-aura-ink hover:text-white transition-all border border-aura-ink/5"
                  >
                    Explore Gifts
                  </button>
                </div>
              </div>
              <div className="relative h-96 md:h-auto min-h-[500px] md:w-1/2 overflow-hidden">
                <motion.img 
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 2 }}
                  src={item.image_url} 
                  className="absolute inset-0 w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-l" />
              </div>
            </div>
          )}
        </div>
      )}

      {item.type === 'collection' && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h2 className="text-2xl font-serif italic">{item.title}</h2>
              <div className="h-1 w-12 bg-aura-gold mt-2 rounded-full" />
            </div>
            <Link to={item.link_url || '/shop'} className="text-[10px] font-bold text-aura-gold uppercase tracking-widest border-b border-aura-gold/20 pb-1 hover:border-aura-gold transition-all">
              {item.button_text || 'Explore All'}
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {(() => {
              let displayProducts = [];
              if (item.product_ids && item.product_ids.length > 0) {
                displayProducts = products.filter(p => item.product_ids?.includes(p.id));
              } else {
                displayProducts = products.filter(p => p.category === item.subtitle || p.subcategory === item.subtitle);
              }
              return displayProducts.slice(0, 4).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                />
              ));
            })()}
          </div>
        </div>
      )}

      {item.type === 'luxury_grid' && (
        <div className="py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h2 className="text-2xl font-serif italic">{item.subtitle} {item.title}</h2>
              <div className="h-1 w-12 bg-aura-gold mt-2 rounded-full" />
            </div>
            <Link to={item.link_url || `/shop?maxPrice=${item.title}`} className="text-[10px] font-bold text-aura-gold uppercase tracking-widest border-b border-aura-gold/20 pb-1 hover:border-aura-gold transition-all">
              {item.button_text || 'View All'}
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {(() => {
              let displayProducts = [];
              if (item.product_ids && item.product_ids.length > 0) {
                displayProducts = products.filter(p => item.product_ids?.includes(p.id));
              } else {
                displayProducts = products.filter(p => p.price <= Number(item.title));
              }
              return displayProducts.slice(0, 4).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                />
              ));
            })()}
          </div>
        </div>
      )}

      {item.type === 'loyalty' && (
        <div className="bg-pink-50 rounded-3xl p-8 border border-pink-100 relative overflow-hidden">
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
              <Package className="w-8 h-8 text-aura-gold" />
            </div>
            <h3 className="text-aura-ink font-serif text-2xl mb-4">{item.title}</h3>
            <p className="text-aura-ink/60 mb-8 max-w-md">{item.subtitle}</p>
            {item.button_text && (
              <button 
                onClick={handleAction}
                className="bg-aura-gold text-white px-10 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-aura-ink transition-all shadow-lg"
              >
                {item.button_text}
              </button>
            )}
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-4 left-4 w-8 h-8 bg-aura-gold rounded-full blur-xl" />
            <div className="absolute bottom-4 right-4 w-12 h-12 bg-aura-gold rounded-full blur-xl" />
          </div>
        </div>
      )}

      {item.type === 'trust' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-aura-ink/5">
          <div className="flex flex-col items-center text-center px-6">
            <div className="w-12 h-12 rounded-full bg-aura-gold/10 flex items-center justify-center text-aura-gold mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg mb-2">{item.title}</h4>
            <p className="text-xs text-aura-ink/60 leading-relaxed">{item.subtitle}</p>
          </div>
          <div className="flex flex-col items-center text-center px-6">
            <div className="w-12 h-12 rounded-full bg-aura-gold/10 flex items-center justify-center text-aura-gold mb-4">
              <Award className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg mb-2">Certified Quality</h4>
            <p className="text-xs text-aura-ink/60 leading-relaxed">Every piece is certified for purity and authenticity by leading labs.</p>
          </div>
          <div className="flex flex-col items-center text-center px-6">
            <div className="w-12 h-12 rounded-full bg-aura-gold/10 flex items-center justify-center text-aura-gold mb-4">
              <RefreshCcw className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg mb-2">Easy Returns</h4>
            <p className="text-xs text-aura-ink/60 leading-relaxed">15-day hassle-free returns and lifetime buyback guarantee.</p>
          </div>
        </div>
      )}

      {item.type === 'color_grid' && (
        <div className="py-20 bg-white rounded-[3rem] border border-aura-ink/5 shadow-sm px-8 md:px-12">
          <div className="flex flex-col items-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif text-center">{item.title}</h2>
            <div className="h-1 w-20 bg-aura-gold mt-4 rounded-full" />
            <p className="text-aura-ink/40 text-[10px] uppercase tracking-[0.3em] mt-6 text-center">{item.subtitle && !item.subtitle.startsWith('[') ? item.subtitle : 'Discover our collection by gemstone hues'}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
            {(() => {
              try {
                let colors = [];
                if (item.subtitle && (item.subtitle.startsWith('[') || item.subtitle.startsWith('{'))) {
                  colors = JSON.parse(item.subtitle);
                }
                
                // Add some default luxury colors if the list is short or empty
                if (colors.length < 5) {
                  const defaultColors = [
                    { name: 'Pure Gold', color: '#D4AF37', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=600' },
                    { name: 'Rose Gold', color: '#B76E79', image: 'https://images.unsplash.com/photo-1598560912005-59a09551e501?auto=format&fit=crop&q=80&w=600' },
                    { name: 'Silver', color: '#C0C0C0', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600' },
                    { name: 'Emerald', color: '#50C878', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=600' },
                    { name: 'Ruby', color: '#E0115F', image: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&q=80&w=600' }
                  ];
                  
                  // Only add defaults that aren't already there by name
                  const existingNames = new Set(colors.map((c: any) => c.name));
                  defaultColors.forEach(dc => {
                    if (!existingNames.has(dc.name)) colors.push(dc);
                  });
                }
                
                if (colors.length === 0) return <p className="col-span-full text-center text-aura-ink/40 py-12">No color items found. Add them in CMS.</p>;
                
                return colors.map((c: any, i: number) => {
                  const imageUrl = c.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600';
                  return (
                    <Link 
                      key={i}
                      to={c.link || `/shop?color=${c.name}`}
                      className="group flex flex-col items-center gap-6"
                    >
                      <div className="aspect-square w-full rounded-[3rem] bg-white overflow-hidden border border-aura-ink/5 shadow-sm group-hover:shadow-2xl group-hover:border-aura-gold/20 transition-all duration-700 p-3">
                        <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative">
                          <img 
                            src={imageUrl} 
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600'; }}
                          />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                            <div className="w-8 h-8 rounded-full border-4 border-white shadow-xl" style={{ backgroundColor: c.color || '#000' }} />
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[10px] font-black text-aura-ink uppercase tracking-[0.3em] group-hover:text-aura-gold transition-colors block mb-1">{c.name}</span>
                        <span className="text-[8px] text-aura-ink/30 uppercase tracking-widest">Collection</span>
                      </div>
                    </Link>
                  );
                });
              } catch (e) {
                console.error("Error parsing color_grid JSON:", e);
                return <p className="col-span-full text-center text-red-500 py-12">Error loading color items. Please check CMS data.</p>;
              }
            })()}
          </div>
        </div>
      )}

      {item.type === 'shop_section' && (
        <div className={cn(
          "relative rounded-[3rem] overflow-hidden group",
          isGridItem ? "aspect-square" : "h-[40vh] min-h-[300px] mb-12"
        )}>
          <img src={item.image_url} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex flex-col items-center justify-center text-center p-8">
            <h2 className={cn(
              "text-white font-serif mb-4",
              isGridItem ? "text-2xl md:text-3xl" : "text-4xl md:text-6xl"
            )}>{item.title}</h2>
            <p className="text-white/80 max-w-2xl font-light text-xs md:text-sm line-clamp-2">{item.subtitle}</p>
            <button 
              onClick={handleAction}
              className="mt-6 bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-aura-ink transition-all"
            >
              {item.button_text || 'Shop Now'}
            </button>
          </div>
        </div>
      )}
      </div>
    </motion.section>
  );
};

const Home = () => {
  const { products, settings, addToCart, toggleWishlist, wishlist, homepageContent, categories, location } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate initial loading for a premium feel
    const timer = setTimeout(() => setIsInitialLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  
  const heroSlides = useMemo(() => {
    const banners = homepageContent.filter(item => item.type === 'banner' && item.active && (item.page === 'home' || !item.page || item.page === 'all'));
    if (banners.length > 0) {
      return banners.sort((a, b) => a.order_index - b.order_index).map(b => ({
        image: b.image_url,
        title: b.title,
        subtitle: b.subtitle,
        link: b.link_url,
        buttonText: b.button_text,
        buttonLink: b.button_link,
        layout: b.layout || 'right'
      }));
    }
    return [
      {
        image: settings?.hero_image || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop",
        title: settings?.hero_title || "Timeless Elegance",
        subtitle: settings?.hero_subtitle || "Discover our curated collection of fine jewellery designed for your most precious moments.",
        link: "/shop",
        buttonText: "Explore Collection",
        buttonLink: "/shop",
        layout: 'left'
      },
      {
        image: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=2070&auto=format&fit=crop",
        title: "The Diamond Edit",
        subtitle: "Brilliance that lasts forever. Explore our new diamond arrivals.",
        link: "/shop?category=Diamond",
        buttonText: "Shop Diamonds",
        buttonLink: "/shop?category=Diamond",
        layout: 'right'
      }
    ];
  }, [homepageContent, settings]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const mainCategories = categories.filter(c => c.type === 'category').slice(0, 12);
  const [showRingSizer, setShowRingSizer] = useState(false);
  const [selectedLuxuryPrice, setSelectedLuxuryPrice] = useState(5000);
  
  if (isInitialLoading) return <LoadingJewelry />;

  return (
    <div className="pb-0 pt-0">
      {/* Hero Slider Section */}
      <section className="mb-12 relative h-[70vh] min-h-[500px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 z-10" />
              <motion.img 
                key={heroSlides[currentSlide]?.image}
                initial={{ scale: 1.1, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={heroSlides[currentSlide]?.image || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop"} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            <div className={cn(
              "absolute inset-0 flex flex-col justify-end pb-20 px-8 z-20",
              heroSlides[currentSlide].layout === 'left' ? "items-start text-left" : 
              heroSlides[currentSlide].layout === 'background' ? "items-center text-center justify-center" : 
              "items-end text-right"
            )}>
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className={cn(
                  "max-w-xl",
                  heroSlides[currentSlide].layout === 'background' ? "bg-white/10 backdrop-blur-md p-10 rounded-[3rem] border border-white/20" : ""
                )}
              >
                <motion.span 
                  className="text-aura-gold text-[10px] uppercase tracking-[0.4em] font-bold mb-4 block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Exclusive Collection {location && `• Shipping to ${location.country}`}
                </motion.span>
                <h2 className="text-white text-5xl md:text-7xl font-serif mb-6 leading-[1.1]">
                  {heroSlides[currentSlide].title}
                </h2>
                <p className="text-white/70 text-base md:text-lg mb-10 max-w-md font-light leading-relaxed mx-auto md:mx-0">
                  {heroSlides[currentSlide].subtitle}
                </p>
                <div className={cn(
                  "flex items-center gap-6",
                  heroSlides[currentSlide].layout === 'left' ? "justify-start" : 
                  heroSlides[currentSlide].layout === 'background' ? "justify-center" : 
                  "justify-end"
                )}>
                  {heroSlides[currentSlide].buttonText ? (
                    <button
                      onClick={() => navigate(heroSlides[currentSlide].buttonLink || heroSlides[currentSlide].link || '/shop')}
                      className="bg-white text-aura-ink px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-aura-gold hover:text-white transition-all duration-500 shadow-2xl"
                    >
                      {heroSlides[currentSlide].buttonText}
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate(heroSlides[currentSlide].link || '/shop')}
                      className="bg-white text-aura-ink px-10 py-4 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-aura-gold hover:text-white transition-all duration-500 shadow-2xl"
                    >
                      Explore Now
                    </button>
                  )}
                  <button
                    onClick={() => navigate('/shop')}
                    className="text-white border-b border-white/30 pb-1 text-[10px] font-bold uppercase tracking-[0.2em] hover:border-white transition-all"
                  >
                    View Collection
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Indicators */}
        {heroSlides.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={cn(
                  "h-1 transition-all duration-500 rounded-full",
                  currentSlide === idx ? "w-8 bg-white" : "w-2 bg-white/30"
                )}
              />
            ))}
          </div>
        )}
      </section>

      <div className="px-6">
        {/* Categories Section - Rounded Squares 2 Rows */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col">
              <h2 className="text-3xl font-serif">Shop By Category</h2>
              <div className="h-1 w-16 bg-aura-gold mt-2 rounded-full" />
            </div>
            <Link to="/shop" className="text-[10px] font-bold text-aura-gold uppercase tracking-widest border-b border-aura-gold/20 pb-1 hover:border-aura-gold transition-all">View All</Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6">
            {mainCategories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.name}`} className="group flex flex-col items-center gap-4">
                <div className="aspect-square w-full rounded-[2rem] bg-white overflow-hidden border border-aura-ink/5 shadow-sm group-hover:shadow-xl group-hover:border-aura-gold/20 transition-all duration-500 p-2">
                  <div className="w-full h-full rounded-[1.5rem] overflow-hidden">
                    <img src={cat.image || `https://picsum.photos/seed/${cat.name}/600`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-aura-ink uppercase tracking-[0.2em] group-hover:text-aura-gold transition-colors text-center">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Promotional Banner */}
        {homepageContent
          .filter(item => item.type === 'promo_banner' && item.active)
          .sort((a, b) => a.order_index - b.order_index)
          .map(item => (
            <section key={item.id} className="mb-20">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden group cursor-pointer"
                style={{ 
                  height: item.layout || '400px',
                  borderRadius: item.button_link || '3rem'
                }}
                onClick={() => navigate(item.link_url || '/shop')}
              >
                <img 
                  src={item.image_url} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  alt={item.title}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-6 md:px-12">
                  <span className="text-aura-gold text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Limited Time Offer</span>
                  <h2 className="text-white text-2xl md:text-4xl font-serif mb-4">{item.title}</h2>
                  <p className="text-white/80 text-sm md:text-lg font-light mb-8 max-w-md">{item.subtitle}</p>
                  <button className="w-fit bg-white text-aura-ink px-6 md:px-8 py-2 md:py-3 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-aura-gold hover:text-white transition-all">Shop Now</button>
                </div>
                {item.link_url?.includes('discount') && (
                  <div className="absolute top-4 right-4 md:top-8 md:right-8 bg-aura-gold text-white w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center shadow-xl animate-pulse">
                    <span className="text-[10px] md:text-xs font-bold">UP TO</span>
                    <span className="text-xl md:text-2xl font-black">40%</span>
                    <span className="text-[6px] md:text-[8px] font-bold">OFF</span>
                  </div>
                )}
              </motion.div>
            </section>
          ))}

        {/* Fallback Promotional Banner if none in CMS */}
        {homepageContent.filter(item => item.type === 'promo_banner' && item.active).length === 0 && (
          <section className="mb-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative h-64 md:h-80 rounded-[2rem] md:rounded-[3rem] overflow-hidden group cursor-pointer"
              onClick={() => navigate('/shop')}
            >
              <img 
                src="https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=1200" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                alt="Promotion"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent flex flex-col justify-center px-8 md:px-12">
                <span className="text-aura-gold text-[8px] md:text-[10px] font-bold uppercase tracking-[0.4em] mb-4">Limited Time Offer</span>
                <h2 className="text-white text-2xl md:text-4xl font-serif mb-4">Festive Celebration Sale</h2>
                <p className="text-white/80 text-sm md:text-lg font-light mb-8">Up to 40% Off on Diamond Collections</p>
                <button className="w-fit bg-white text-aura-ink px-6 md:px-8 py-2 md:py-3 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest hover:bg-aura-gold hover:text-white transition-all">Shop Now</button>
              </div>
            </motion.div>
          </section>
        )}

        {/* Luxury within Reach - Minimalist Design */}
        <section className="mb-24 px-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center mb-12 text-center">
              <span className="text-aura-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-3">Curated Selection</span>
              <h2 className="text-3xl md:text-4xl font-serif mb-4">Luxury within Reach</h2>
              <div className="w-12 h-0.5 bg-aura-gold/30 mb-8" />
              
              <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                {[2000, 5000, 10000, 20000, 50000].map(price => (
                  <button 
                    key={price}
                    onClick={() => setSelectedLuxuryPrice(price)}
                    className={cn(
                      "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border duration-300",
                      selectedLuxuryPrice === price 
                        ? "bg-aura-ink text-white border-aura-ink shadow-lg" 
                        : "bg-white text-aura-ink border-aura-ink/10 hover:border-aura-gold/30"
                    )}
                  >
                    Under ₹{(price/1000).toFixed(0)}K
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedLuxuryPrice}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8"
              >
                {products
                  .filter(p => p.price <= selectedLuxuryPrice)
                  .slice(0, 4)
                  .map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={addToCart}
                      onToggleWishlist={toggleWishlist}
                      isWishlisted={wishlist.includes(product.id)}
                    />
                  ))}
                {products.filter(p => p.price <= selectedLuxuryPrice).length === 0 && (
                  <div className="col-span-full text-center py-20 bg-aura-paper/30 rounded-[3rem] border border-dashed border-aura-ink/10">
                    <p className="text-aura-ink/40 font-serif italic">No exquisite pieces found in this range yet.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 text-center">
              <Link 
                to={`/shop?maxPrice=${selectedLuxuryPrice}`}
                className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-aura-gold hover:text-aura-ink transition-all group"
              >
                Explore More Under ₹{selectedLuxuryPrice.toLocaleString()}
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Best Sellers - Improved Grid */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col">
              <h2 className="text-3xl font-serif">Best Sellers</h2>
              <div className="h-1 w-16 bg-aura-gold mt-2 rounded-full" />
            </div>
            <Link to="/shop?filter=best-seller" className="text-[10px] font-bold text-aura-gold uppercase tracking-widest border-b border-aura-gold/20 pb-1 hover:border-aura-gold transition-all">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.filter(p => p.is_best_seller).slice(0, 8).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
              />
            ))}
            {products.filter(p => p.is_best_seller).length === 0 && products.slice(0, 8).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
              />
            ))}
          </div>
        </section>

        {/* Top Rated Section */}
        {products.filter(p => p.is_top_rated).length > 0 && (
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                <h2 className="text-3xl font-serif">Top Rated</h2>
                <div className="h-1 w-16 bg-aura-gold mt-2 rounded-full" />
              </div>
              <Link to="/shop?filter=top-rated" className="text-[10px] font-bold text-aura-gold uppercase tracking-widest border-b border-aura-gold/20 pb-1 hover:border-aura-gold transition-all">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.filter(p => p.is_top_rated).slice(0, 4).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  isWishlisted={wishlist.includes(product.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Ring Sizer Trigger */}
        <section className="mb-20">
          <div 
            onClick={() => setShowRingSizer(true)}
            className="bg-aura-ink text-white p-12 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer hover:bg-aura-ink/90 transition-all group"
          >
            <div className="space-y-4 text-center md:text-left">
              <h2 className="text-4xl font-serif">Not sure about your size?</h2>
              <p className="text-white/60 font-light max-w-md">Use our interactive ring sizer to find your perfect fit from the comfort of your home.</p>
              <button className="bg-white text-aura-ink px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest group-hover:bg-aura-gold group-hover:text-white transition-all">Measure Now</button>
            </div>
            <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center group-hover:border-aura-gold transition-colors">
              <Ruler className="w-12 h-12 text-aura-gold" />
            </div>
          </div>
        </section>

        {showRingSizer && <RingSizer onClose={() => setShowRingSizer(false)} />}

        {/* Dynamic Homepage Content */}
        {homepageContent
          .filter(item => 
            item.type !== 'banner' && 
            item.type !== 'luxury_grid' && 
            item.type !== 'promo_banner' && 
            item.active && 
            (item.page === 'home' || !item.page || item.page === 'all' || item.page === 'home_bottom')
          )
          .sort((a, b) => a.order_index - b.order_index)
          .map(item => (
            <ContentSection key={item.id} item={item} />
          ))}
      </div>

    </div>
  );
};

const Shop = () => {
  const { products, addToCart, toggleWishlist, wishlist, categories, homepageContent, cart } = useStore();
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category');
  const subcategoryFilter = queryParams.get('subcategory');
  const maxPriceFilter = queryParams.get('maxPrice');
  const searchQuery = queryParams.get('search');
  const filterType = queryParams.get('filter');
  const colorFilter = queryParams.get('color');
  const bondFilter = queryParams.get('bond');

  const cartCount = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);

  // Find content sections for shop page
  const shopContent = homepageContent
    .filter(item => item.active && (item.page === 'shop' || (item.page === 'all' && item.type !== 'color_grid')))
    .sort((a, b) => a.order_index - b.order_index);

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(p => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (subcategoryFilter && p.subcategory !== subcategoryFilter) return false;
      if (colorFilter && p.color !== colorFilter) return false;
      if (bondFilter && p.bond !== bondFilter) return false;
      if (maxPriceFilter && p.price > Number(maxPriceFilter)) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(query) || 
               p.description.toLowerCase().includes(query) ||
               p.category.toLowerCase().includes(query) ||
               p.subcategory.toLowerCase().includes(query);
      }
      if (filterType === 'new') return p.is_new;
      if (filterType === 'top-rated') return p.is_top_rated;
      if (filterType === 'best-seller') return p.is_best_seller;
      return true;
    });

    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    
    return filtered;
  }, [products, categoryFilter, subcategoryFilter, maxPriceFilter, searchQuery, filterType, sortBy, colorFilter, bondFilter]);

  if (isLoading) return <LoadingJewelry />;

  return (
    <div className="min-h-screen bg-white pt-24">
      {/* Top Header Section - Only show if not on home page or if scrolled */}
      <div className="bg-white border-b border-aura-border/20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-aura-grey-light rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-serif font-bold">{bondFilter ? `For ${bondFilter}` : (categoryFilter || 'Collection')}</h1>
        </div>
      </div>

      <div className="pb-32 px-4 max-w-7xl mx-auto">
        {/* Filter Chips */}
        <div className="flex items-center gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4">
          {[
            { name: 'All', path: '/shop' },
            { name: 'Best Seller', path: '/shop?filter=best-seller' },
            { name: 'Top Rated', path: '/shop?filter=top-rated' },
            { name: 'New', path: '/shop?filter=new' },
            { name: 'Colour', path: '/shop?filter=colour' },
            { name: 'Price', path: '/shop?filter=price' }
          ].map(chip => {
            const isActive = location.search === chip.path.split('?')[1] || (chip.name === 'All' && !location.search);
            return (
              <Link 
                key={chip.name}
                to={chip.path}
                className={cn(
                  "px-6 py-2.5 rounded-full border text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap",
                  isActive 
                    ? "bg-aura-gold text-white border-aura-gold shadow-md"
                    : "bg-white border-aura-gold/30 text-aura-gold hover:bg-aura-gold/5"
                )}
              >
                {chip.name}
              </Link>
            );
          })}
        </div>

        {/* Shop Page Content Sections (Men, Women in 2-column Grid or Gifting Section) */}
        {categoryFilter === 'Gifting' ? (
          homepageContent.filter(i => i.type === 'gifting' && i.active).map(item => (
            <div key={item.id} className="mb-16">
              <ContentSection item={item} />
            </div>
          ))
        ) : (
          shopContent.filter(i => i.type === 'shop_section' && (i.id === 'shop_men' || i.id === 'shop_women')).length > 0 && (
            <div className="mb-16">
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                {shopContent.filter(i => i.type === 'shop_section' && (i.id === 'shop_men' || i.id === 'shop_women')).map(item => (
                  <ContentSection key={item.id} item={item} isGridItem={true} />
                ))}
              </div>
            </div>
          )
        )}

        {/* Shop by Bond Section (Smaller) */}
        {categoryFilter !== 'Gifting' && shopContent.filter(i => i.id === 'shop_bond').map(item => (
          <div key={item.id} className="mb-16 max-w-4xl mx-auto">
            <div className="scale-90 transition-transform">
              <ContentSection item={item} isGridItem={false} />
            </div>
          </div>
        ))}

        {/* Other Shop Page Content (like Color Grid) */}
        {shopContent.filter(i => i.type !== 'shop_section' && i.id !== 'shop_bond' && (categoryFilter !== 'Gifting' || i.type !== 'gifting')).map(item => (
          <div key={item.id} className="mb-16">
            <ContentSection item={item} />
          </div>
        ))}

        {/* Product Grid - 2 Column Responsive */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              isWishlisted={wishlist.includes(product.id)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-aura-ink/40 font-serif text-xl italic">No pieces found in this selection.</p>
            <button 
              onClick={() => navigate('/shop')}
              className="mt-6 text-aura-gold border-b border-aura-gold pb-1 text-xs uppercase tracking-widest font-bold"
            >
              View All Collection
            </button>
          </div>
        )}
      </div>

      {/* Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-aura-border/20 px-6 h-16 flex items-center divide-x divide-aura-border/20">
        <button 
          onClick={() => setShowFilters(true)}
          className="flex-1 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-aura-ink hover:text-aura-gold transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button 
          onClick={() => setSortBy(sortBy === 'price-low' ? 'price-high' : 'price-low')}
          className="flex-1 flex items-center justify-center gap-2 text-[10px] uppercase tracking-widest font-bold text-aura-ink hover:text-aura-gold transition-colors"
        >
          <ArrowUpDown className="w-4 h-4" />
          Sort By
        </button>
      </div>
    </div>
  );
};

const Cart = () => {
  const { cart, products, updateCartQuantity, removeFromCart, user, settings, clearCart, homepageContent } = useStore();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);

  const cartContent = homepageContent
    .filter(item => item.active && (item.page === 'cart' || item.page === 'all'))
    .sort((a, b) => a.order_index - b.order_index);

  const [shipping, setShipping] = useState({
    name: user?.name || '',
    address: '',
    city: '',
    pincode: '',
    // Strip +91 prefix for display in the 10-digit input field
    phone: user?.phone ? user.phone.replace(/^\+91/, '') : '',
    paymentMethod: 'Razorpay'
  });

  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, quantity]) => {
      const product = products.find(p => p.id === id);
      return product ? { ...product, quantity } : null;
    }).filter(Boolean) as CartItem[];
  }, [cart, products]);

  const total = cartItems.reduce((sum, item) => sum + ((Number(item.price) || 0) * (item.quantity || 1)), 0);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch(`/api/coupons/${couponCode.toUpperCase()}`);
      if (!res.ok) {
        alert('Invalid or expired coupon code');
        return;
      }
      const couponData = await res.json();
      const coupon = couponData.coupon || couponData;
      if (total < coupon.min_purchase) {
        alert(`Minimum purchase of ${formatPrice(coupon.min_purchase)} required for this coupon`);
        return;
      }
      setAppliedCoupon(coupon);
      alert('Coupon applied successfully!');
    } catch (err) {
      alert('Error applying coupon');
    }
  };

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'percentage') {
      return (total * appliedCoupon.discount_value) / 100;
    }
    return appliedCoupon.discount_value;
  }, [appliedCoupon, total]);

  const finalTotal = total - discountAmount;

  const handleCheckout = async () => {
    if (!user) {
      navigate('/profile');
      return;
    }

    // Guest users cannot checkout - redirect to proper login
    if (user.id?.startsWith('guest_')) {
      alert('Please log in with your mobile number or Google to place an order.');
      navigate('/profile');
      return;
    }

    if (!shipping.name || !shipping.address || !shipping.city || !shipping.pincode || !shipping.phone) {
      alert('Please fill in all mandatory fields: Name, Address, City, Pincode, and Mobile Number.');
      return;
    }

    if (shipping.name.trim().length < 3) {
      alert('Please enter a valid full name (at least 3 characters).');
      return;
    }

    if (shipping.address.trim().length < 10) {
      alert('Please enter a detailed address (at least 10 characters).');
      return;
    }

    if (shipping.pincode.trim().length !== 6 || isNaN(Number(shipping.pincode))) {
      alert('Please enter a valid 6-digit pincode.');
      return;
    }

    if (!validateMobile(shipping.phone)) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    try {
      // 1. Create order in our database first (status: pending)
      const _orderToken = localStorage.getItem('aura_token');
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(_orderToken ? { Authorization: `Bearer ${_orderToken}` } : {})
        },
        body: JSON.stringify({
          userId: user.id,
          items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
          total: finalTotal,
          discount: discountAmount,
          coupon_id: appliedCoupon?.id,
          shipping,
          payment_status: 'pending'
        })
      });

      if (!orderRes.ok) {
        const errBody = await orderRes.json().catch(() => ({}));
        throw new Error(errBody.message || `Failed to create order (${orderRes.status})`);
      }
      const { orderId } = await orderRes.json();

      if (shipping.paymentMethod === 'COD') {
        alert('Order placed successfully with Cash on Delivery!');
        clearCart();
        navigate('/profile');
        return;
      }

      // 2. Create Razorpay order
      const _rzpToken = localStorage.getItem('aura_token');
      const rzpOrderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(_rzpToken ? { Authorization: `Bearer ${_rzpToken}` } : {})
        },
        body: JSON.stringify({ amount: finalTotal })
      });

      if (!rzpOrderRes.ok) {
        const errorData = await rzpOrderRes.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
          errorData.error ||
          'Online payment is currently unavailable. Please use Cash on Delivery.'
        );
      }
      const rzpOrder = await rzpOrderRes.json();

      // 3. Open Razorpay Checkout
      if (!(window as any).Razorpay) {
        throw new Error('Payment gateway (Razorpay) failed to load. Please check your internet connection or try again later.');
      }

      const options = {
        key: settings?.razorpay_key_id || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "ADORE",
        description: "Jewellery Purchase",
        order_id: rzpOrder.id,
        handler: async (response: any) => {
          // 4. Verify Payment
          try {
            const _vToken = localStorage.getItem('aura_token');
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(_vToken ? { Authorization: `Bearer ${_vToken}` } : {})
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId
              })
            });

            if (verifyRes.ok) {
              alert('Payment Successful! Your order has been placed.');
              clearCart();
              navigate('/profile');
            } else {
              const verifyError = await verifyRes.json();
              alert('Order Not Placed: Payment verification failed. ' + (verifyError.error || 'Please contact support with your Payment ID: ' + response.razorpay_payment_id));
            }
          } catch (err) {
            alert('Order Not Placed: An error occurred during payment verification. Please contact support.');
          }
        },
        prefill: {
          name: shipping.name,
          email: user.email,
          contact: shipping.phone
        },
        theme: {
          color: "#d4af37"
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            alert('Payment cancelled. Your order is not confirmed. Please complete the payment to place your order.');
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert('Order Not Placed: Payment failed. ' + response.error.description);
        setIsProcessingPayment(false);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Checkout Error:", error);
      alert('Order Not Placed: ' + (error.message || 'An unexpected error occurred. Please try again.'));
      setIsProcessingPayment(false);
    }
    // Note: for Razorpay flow, isProcessingPayment is reset via ondismiss/payment.failed callbacks
  };

  return (
    <div className="pb-24 pt-24 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif mb-12">{showCheckout ? 'Checkout' : 'Your Shopping Bag'}</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-aura-ink/20" />
          <p className="text-aura-ink/60 mb-8">Your bag is empty.</p>
          <Link to="/shop" className="bg-aura-ink text-white px-10 py-4 rounded-full text-sm font-medium uppercase tracking-widest">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-6 items-center border-b border-aura-ink/5 pb-8">
                <div className="w-24 h-32 rounded-xl overflow-hidden bg-white">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200'; }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-xl mb-1">{item.name}</h3>
                  <p className="text-aura-ink/60 text-xs uppercase tracking-widest mb-4">{item.category}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-aura-ink/10 rounded-lg">
                      <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="p-2 hover:text-aura-gold"><Minus className="w-4 h-4" /></button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="p-2 hover:text-aura-gold"><Plus className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-aura-ink/40 hover:text-red-500"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            {showCheckout ? (
              <div className="bg-white p-8 rounded-3xl border border-aura-ink/5 space-y-6">
                <h2 className="text-2xl font-serif">Shipping Details</h2>
                <div className="space-y-4">
                  <input 
                    type="text" placeholder="Full Name *" 
                    required
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="Address *" 
                    required
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="City *" 
                      required
                      className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                      value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})}
                    />
                    <input 
                      type="text" placeholder="Pincode *" 
                      required
                      className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                      value={shipping.pincode} onChange={e => setShipping({...shipping, pincode: e.target.value})}
                    />
                  </div>
                  <input 
                    type="tel" placeholder="Mobile Number *" 
                    required
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={shipping.phone} onChange={e => setShipping({...shipping, phone: e.target.value})}
                  />
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => setShipping({...shipping, paymentMethod: 'Razorpay'})}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-[10px] uppercase tracking-widest font-bold transition-all",
                          shipping.paymentMethod === 'Razorpay' ? "bg-aura-ink text-white border-aura-ink" : "bg-white border-aura-ink/10 text-aura-ink/60"
                        )}
                      >
                        Razorpay / Cards
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShipping({...shipping, paymentMethod: 'COD'})}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-[10px] uppercase tracking-widest font-bold transition-all",
                          shipping.paymentMethod === 'COD' ? "bg-aura-ink text-white border-aura-ink" : "bg-white border-aura-ink/10 text-aura-ink/60"
                        )}
                      >
                        Cash on Delivery
                      </button>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-aura-ink/5">
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-aura-ink/60">Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600 font-medium">
                        <span>Discount</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-serif pt-4 border-t border-aura-ink/5">
                      <span>Total</span>
                      <span>{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    disabled={isProcessingPayment}
                    className="w-full bg-aura-ink text-white py-5 rounded-2xl text-sm font-medium uppercase tracking-widest hover:bg-aura-gold transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      'Proceed to Payment'
                    )}
                  </button>
                  <button 
                    onClick={() => setShowCheckout(false)}
                    className="w-full text-aura-ink/40 text-xs uppercase tracking-widest mt-4 hover:text-aura-ink"
                  >
                    Back to Bag
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-aura-ink/5">
                <div className="space-y-4 mb-8">
                  <label className="block text-[10px] uppercase tracking-widest font-semibold text-aura-gold">Have a Coupon?</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Enter Code" 
                      className="flex-1 bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold font-mono uppercase"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      className="bg-aura-ink text-white px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-aura-gold transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center justify-between bg-green-50 border border-green-100 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-green-600" />
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">{appliedCoupon.code} Applied</span>
                      </div>
                      <button onClick={() => setAppliedCoupon(null)} className="text-red-500 hover:text-red-700"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-8 pt-8 border-t border-aura-ink/5">
                  <div className="flex justify-between text-sm">
                    <span className="text-aura-ink/60">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Discount</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-serif pt-4 border-t border-aura-ink/5">
                    <span>Total</span>
                    <span>{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-aura-ink text-white py-5 rounded-2xl text-sm font-medium uppercase tracking-widest hover:bg-aura-gold transition-colors"
                >
                  Checkout Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Page Content Sections */}
      {cartContent.length > 0 && (
        <div className="mt-24">
          {cartContent.map(item => (
            <ContentSection key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

const HelpSupport = () => {
  return (
    <div className="pb-24 pt-24 px-6 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-serif mb-4">Help & Support</h1>
        <p className="text-aura-ink/60">We're here to assist you with any questions or concerns.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div className="bg-white p-8 rounded-3xl border border-aura-ink/5 text-center">
          <Phone className="w-10 h-10 mx-auto mb-4 text-aura-gold" />
          <h3 className="font-serif text-xl mb-2">Call Us</h3>
          <p className="text-sm text-aura-ink/60">+91 1800 123 4567</p>
          <p className="text-[10px] uppercase tracking-widest mt-2">Mon - Sat, 10am - 7pm</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-aura-ink/5 text-center">
          <Mail className="w-10 h-10 mx-auto mb-4 text-aura-gold" />
          <h3 className="font-serif text-xl mb-2">Email Us</h3>
          <p className="text-sm text-aura-ink/60">support@adore.com</p>
          <p className="text-[10px] uppercase tracking-widest mt-2">Response within 24h</p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-aura-ink/5 text-center">
          <MessageSquare className="w-10 h-10 mx-auto mb-4 text-aura-gold" />
          <h3 className="font-serif text-xl mb-2">Live Chat</h3>
          <p className="text-sm text-aura-ink/60">Available on website</p>
          <p className="text-[10px] uppercase tracking-widest mt-2">Instant assistance</p>
        </div>
      </div>

      <div className="space-y-8">
        <h2 className="text-3xl font-serif mb-8">Frequently Asked Questions</h2>
        {[
          { q: "How can I track my order?", a: "You can track your order in the 'Orders' section of your profile page. We also send tracking details via email once your order is shipped." },
          { q: "What is your return policy?", a: "We offer a 15-day return policy for all unworn jewellery in its original packaging. Please contact support to initiate a return." },
          { q: "Do you offer international shipping?", a: "Yes, we ship to over 50 countries worldwide. Shipping costs and delivery times vary by location." },
          { q: "Is my payment secure?", a: "Absolutely. We use industry-standard encryption and secure payment gateways to ensure your data is protected." }
        ].map((faq, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border border-aura-ink/5">
            <h3 className="font-serif text-xl mb-4 flex items-center gap-3">
              <Info className="w-5 h-5 text-aura-gold" />
              {faq.q}
            </h3>
            <p className="text-aura-ink/60 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const NotificationCenter = () => {
  const { notifications, markNotificationAsRead } = useStore();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 hover:bg-aura-gold/10 rounded-full transition-colors">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="fixed md:absolute right-4 left-4 md:left-auto md:right-0 mt-4 md:w-80 bg-white rounded-3xl shadow-2xl border border-aura-ink/5 z-[100] overflow-hidden"
            >
              <div className="p-6 border-b border-aura-ink/5 flex justify-between items-center">
                <h3 className="font-serif text-lg">Notifications</h3>
                <span className="text-[10px] uppercase tracking-widest font-bold text-aura-gold">{unreadCount} New</span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-12 text-center">
                    <Bell className="w-8 h-8 mx-auto mb-4 text-aura-ink/10" />
                    <p className="text-xs text-aura-ink/40">No notifications yet.</p>
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className={cn(
                        "p-6 border-b border-aura-ink/5 hover:bg-aura-paper transition-colors cursor-pointer",
                        !notif.is_read && "bg-aura-gold/5"
                      )}
                      onClick={() => markNotificationAsRead(notif.id)}
                    >
                      <div className="flex gap-4">
                        {notif.image && <img src={notif.image} className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).style.display='none'; }} />}
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold mb-1">{notif.title}</h4>
                          <p className="text-xs text-aura-ink/60 leading-relaxed">{notif.message}</p>
                          <p className="text-[8px] uppercase tracking-widest mt-2 text-aura-ink/40">
                            {new Date(notif.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const Profile = () => {
  const { user, login, logout, loginAsGuest, updateUser, addresses, getAddresses, addAddress, deleteAddress, setDefaultAddress, orderHistory, getOrderHistory } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'addresses' | 'details' | 'sizer'>('orders');
  const [formData, setFormData] = useState({ email: '', name: '', phone: '', address: '', city: '', pincode: '' });
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', address: '', city: '', pincode: '' });
  const [newAddress, setNewAddress] = useState({ name: '', address: '', city: '', pincode: '', phone: '', is_default: false });
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // .catch() needed — try/catch does NOT catch async rejections
      getOrderHistory().catch(() => {});
      getAddresses().catch(() => {});
      setEditFormData({
        name:    user.name    || '',
        phone:   user.phone   || '',
        address: user.address || '',
        city:    user.city    || '',
        pincode: user.pincode || ''
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // On mount: pick up any pending Google redirect sign-in result (mobile flow)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const idToken = await checkGoogleRedirectResult();
        if (cancelled || !idToken) return;
        setLoading(true);
        await completeGoogleLogin(idToken);
      } catch (err: any) {
        if (!cancelled) {
          // Don't surface redirect errors as blocking — just log them
          console.warn('Google redirect result error:', err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Shared helper: send Firebase ID token to backend and store session
  const completeGoogleLogin = async (idToken: string) => {
    try {
      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken }),
      });
      const data = await res.json().catch(() => ({ success: false, message: 'Server returned invalid response' }));
      if (data.success) {
        const result = await login({
          id:    data.user.id,
          email: data.user.email || '',
          name:  data.user.name  || 'User',
          phone: data.user.phone || null,
          _preAuthenticated: true,
          _token: data.token,
        } as any);
        if (!result.success) {
          setError(result.error || 'Login setup failed');
        }
      } else {
        // Show the specific backend error so user knows what to fix
        setError(data.message || 'Google login failed. Please try phone login instead.');
      }
    } catch (err: any) {
      setError('Network error during Google login: ' + (err.message || 'Please check your connection'));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const idToken = await signInWithGoogle();

      if (idToken === null) {
        // Demo mode — Firebase not configured
        const result = await login({
          id:    'demo_user_123',
          email: 'demo@example.com',
          name:  'Demo User',
          phone: null,
        });
        if (!result.success) setError(result.error || 'Demo login failed');
        return;
      }

      if (idToken === '__redirect__') {
        // Redirect flow initiated on mobile — page will reload and
        // checkGoogleRedirectResult() in the useEffect above will finish login
        return;
      }

      await completeGoogleLogin(idToken);
    } catch (error: any) {
      console.error('Firebase Login Error', error);
      // auth/unauthorized-domain is the most common issue - give clear instructions
      if (error.message?.includes('not an authorised domain') || error.message?.includes('not authorized')) {
        setError('This domain is not authorized in Firebase. Add it under Firebase Console → Authentication → Authorized Domains.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Check your internet connection and try again.');
      } else {
        setError(error.message || 'Google login failed. Try phone login instead.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    await updateUser(editFormData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleAddAddress = async () => {
    if (!user) return;
    if (!newAddress.name || !newAddress.address || !newAddress.city || !newAddress.pincode || !newAddress.phone) {
      alert('Please fill all address fields');
      return;
    }
    await addAddress(newAddress);
    setNewAddress({ name: '', address: '', city: '', pincode: '', phone: '', is_default: false });
    setShowAddAddress(false);
  };

  if (!user) {
    return (
      <div className="pb-24 pt-32 px-6 max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 bg-aura-gold/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <UserIcon className="w-10 h-10 text-aura-gold" />
          </div>
          <h1 className="text-4xl font-serif mb-4">Welcome to Adore</h1>
          <p className="text-aura-ink/60">Join our exclusive circle of luxury and elegance.</p>
        </motion.div>
        
        <div className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl text-xs font-medium flex items-center gap-3 shadow-sm"
            >
              <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <X className="w-3 h-3" />
              </div>
              {error}
            </motion.div>
          )}
          <div className="bg-white p-8 rounded-[3rem] border border-aura-ink/5 shadow-xl space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border border-aura-ink/10 rounded-2xl px-4 py-4 flex items-center justify-center gap-3 hover:bg-aura-paper transition-all shadow-sm disabled:opacity-50 active:scale-95"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
                <span className="text-sm font-bold uppercase tracking-widest">
                  {loading ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>
              
              <div className="relative flex items-center justify-center py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-aura-ink/5"></div></div>
                <span className="relative bg-white px-4 text-[10px] uppercase tracking-widest text-aura-ink/40 font-bold">or use mobile</span>
              </div>
            </div>

            <div className="space-y-5">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-aura-ink/40 mb-2 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-2xl px-5 py-4 outline-none focus:border-aura-gold transition-all"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                </motion.div>
              )}
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-aura-ink/40 mb-2 ml-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-aura-ink/40 font-bold text-sm">+91</span>
                  <input 
                    type="tel" 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-2xl pl-14 pr-5 py-4 outline-none focus:border-aura-gold transition-all font-mono tracking-wider"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="00000 00000"
                    maxLength={10}
                  />
                </div>
              </div>
              <button 
                onClick={async () => {
                  setError(null);
                  if (!validateMobile(formData.phone)) {
                    setError('Please enter a valid 10-digit mobile number starting with 6-9.');
                    return;
                  }
                  if (!isLogin && !formData.name) {
                    setError('Please enter your full name.');
                    return;
                  }
                  setLoading(true);
                  try {
                    // Format as E.164 (+91XXXXXXXXXX) for the backend
                    const e164Phone = '+91' + formData.phone.trim();
                    const res = await fetch('/api/auth/phone-login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ phone: e164Phone, name: formData.name || undefined }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      // Directly set user and token via login helper using pre-auth shortcut
                      const result = await login({
                        id:    data.user.id,
                        email: data.user.email || '',
                        name:  data.user.name  || formData.name || 'User',
                        phone: data.user.phone || e164Phone,
                        _preAuthenticated: true,
                        _token: data.token,
                      } as any);
                      if (!result.success) setError(result.error || 'Login failed');
                    } else {
                      setError(data.message || 'Authentication failed');
                    }
                  } catch (err: any) {
                    setError(err.message || 'Network error. Please try again.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full bg-aura-ink text-white py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-aura-gold transition-all shadow-lg disabled:opacity-50 active:scale-95"
              >
                {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
              </button>

              <div className="text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[10px] uppercase tracking-widest font-bold text-aura-gold hover:text-aura-ink transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
              </div>
            </div>
          </div>

            <div className="relative flex items-center justify-center py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-aura-ink/5"></div></div>
              <span className="relative bg-aura-paper px-4 text-[10px] uppercase tracking-widest text-aura-ink/40 font-bold">or</span>
            </div>

            <button 
              onClick={() => loginAsGuest()}
              className="w-full bg-white border border-aura-ink/10 rounded-2xl px-4 py-5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-aura-paper transition-all shadow-sm active:scale-95"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      );
    }

  return (
    <div className="pb-32 pt-28 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 mb-12">
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-serif">Hello, {user.name || 'there'}</h1>
            {user.role === 'admin' && (
              <span className="bg-aura-gold/10 text-aura-gold text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-aura-gold/20">
                Administrator
              </span>
            )}
          </div>
          <p className="text-aura-ink/60 text-sm">{user.email || user.phone || ''}</p>
        </div>
        <div className="flex gap-3">
          {user.role === 'admin' && (
            <Link 
              to="/admin-portal-secure-access" 
              className="inline-flex items-center gap-2 bg-aura-gold text-white px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-aura-ink transition-all shadow-lg"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          )}
          <button onClick={logout} className="p-3 bg-white border border-aura-ink/5 rounded-xl text-aura-ink/40 hover:text-red-500 transition-colors shadow-sm">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-aura-ink/5 mb-12 overflow-x-auto scrollbar-hide">
        {[
          { id: 'orders', label: 'Order History', icon: Clock },
          { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
          { id: 'details', label: 'Account Details', icon: UserIcon },
          { id: 'sizer', label: 'Ring Sizer', icon: Ruler }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-3 px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id ? "border-aura-gold text-aura-gold" : "border-transparent text-aura-ink/40 hover:text-aura-ink"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'orders' && (
          <motion.section 
            key="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {(!Array.isArray(orderHistory) || orderHistory.length === 0) ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-aura-ink/5">
                <Clock className="w-12 h-12 mx-auto mb-4 text-aura-ink/10" />
                <p className="text-aura-ink/40 italic">No orders yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {(Array.isArray(orderHistory) ? orderHistory : []).map(order => (
                  <div key={order.id} className="bg-white p-8 rounded-[3rem] border border-aura-ink/5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-aura-paper flex items-center justify-center">
                          <Package className="w-6 h-6 text-aura-gold" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold mb-1">Order #{(order.id || '').slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-aura-ink/40">{order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "text-[10px] uppercase tracking-widest font-bold px-4 py-2 rounded-full",
                          order.status === 'delivered' ? "bg-green-50 text-green-600" : 
                          order.status === 'shipped' ? "bg-blue-50 text-blue-600" :
                          order.status === 'cancelled' ? "bg-red-50 text-red-600" :
                          "bg-aura-paper text-aura-ink/60"
                        )}>
                          {order.status}
                        </span>
                        <Link 
                          to={`/track-order?orderId=${order.id}`}
                          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-aura-gold hover:text-aura-ink transition-colors"
                        >
                          <Truck className="w-4 h-4" />
                          Track
                        </Link>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      <div className="space-y-4">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/40">Items</p>
                        <div className="flex flex-wrap gap-4">
                          {((): any[] => {
                            try {
                              const raw = order.items;
                              if (!raw) return [];
                              const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
                              return Array.isArray(arr) ? arr : [];
                            } catch { return []; }
                          })().map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 bg-aura-paper/50 p-2 rounded-2xl border border-aura-ink/5">
                              <div className="w-14 h-14 rounded-xl overflow-hidden bg-white">
                                <img src={item.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200'} className="w-full h-full object-cover" alt={item.name || ''} referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200'; }} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold truncate max-w-[120px]">{item.name}</p>
                                <p className="text-[8px] text-aura-ink/40 uppercase tracking-widest font-bold">Qty: {item.quantity} • {formatPrice(Number(item.price) || 0)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/40">Shipping Details</p>
                        <div className="bg-aura-paper/30 p-4 rounded-2xl border border-aura-ink/5">
                          <p className="text-xs font-serif leading-relaxed">
                            <span className="font-bold">{order.shipping_name}</span><br />
                            {order.shipping_address}<br />
                            {order.shipping_city} - {order.shipping_pincode}<br />
                            Phone: {order.shipping_phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-aura-ink/5">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-aura-gold" />
                        <span className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/40">Payment: {(order.payment_method || 'N/A').toUpperCase()}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/40 mb-1">Total Amount</p>
                        <p className="text-2xl font-serif text-aura-ink">{formatPrice(Number(order.total) || 0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {activeTab === 'addresses' && (
          <motion.section 
            key="addresses"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif">Your Addresses</h2>
              <button 
                onClick={() => setShowAddAddress(true)}
                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-aura-gold hover:text-aura-ink transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Address
              </button>
            </div>

            {showAddAddress && (
              <div className="bg-white p-8 rounded-[3rem] border border-aura-gold/20 shadow-xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Full Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={newAddress.name}
                        onChange={e => setNewAddress({ ...newAddress, name: e.target.value })}
                        placeholder="Receiver's Name"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Phone Number</label>
                      <input 
                        type="tel" 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={newAddress.phone}
                        onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })}
                        placeholder="10-digit mobile"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Address</label>
                      <input 
                        type="text" 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={newAddress.address}
                        onChange={e => setNewAddress({ ...newAddress, address: e.target.value })}
                        placeholder="House No, Street, Area"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">City</label>
                        <input 
                          type="text" 
                          className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                          value={newAddress.city}
                          onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Pincode</label>
                        <input 
                          type="text" 
                          className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                          value={newAddress.pincode}
                          onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          placeholder="6-digit"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    id="isDefault"
                    checked={newAddress.is_default}
                    onChange={e => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                    className="w-4 h-4 accent-aura-gold"
                  />
                  <label htmlFor="isDefault" className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/60">Set as default address</label>
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={handleAddAddress}
                    className="flex-1 bg-aura-ink text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-aura-gold transition-all"
                  >
                    Save Address
                  </button>
                  <button 
                    onClick={() => setShowAddAddress(false)}
                    className="flex-1 bg-aura-paper text-aura-ink py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-aura-ink/5 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(Array.isArray(addresses) ? addresses : []).map(addr => (
                <div key={addr.id} className="bg-white p-8 rounded-[3rem] border border-aura-ink/5 shadow-sm relative group">
                  <div className="absolute top-6 right-6 flex items-center gap-2">
                    {addr.is_default ? (
                      <span className="bg-aura-gold/10 text-aura-gold text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Default</span>
                    ) : (
                      <button 
                        onClick={() => setDefaultAddress(addr.id)}
                        className="opacity-0 group-hover:opacity-100 bg-aura-paper text-aura-ink/40 hover:text-aura-gold text-[8px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-aura-paper flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-aura-gold" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg">{addr.name}</h3>
                      <p className="text-[10px] text-aura-ink/40 font-bold uppercase tracking-widest">{addr.phone}</p>
                    </div>
                  </div>
                  <p className="text-sm text-aura-ink/60 leading-relaxed mb-8">
                    {addr.address}<br />
                    {addr.city} - {addr.pincode}
                  </p>
                  <button 
                    onClick={() => deleteAddress(addr.id)}
                    className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-700 transition-all opacity-0 group-hover:opacity-100"
                  >
                    Remove Address
                  </button>
                </div>
              ))}
              {addresses.length === 0 && !showAddAddress && (
                <div className="col-span-full text-center py-20 bg-white rounded-[3rem] border border-aura-ink/5">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-aura-ink/10" />
                  <p className="text-aura-ink/40 italic">No saved addresses found.</p>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {activeTab === 'details' && (
          <motion.section 
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-10 rounded-[3rem] border border-aura-ink/5 shadow-sm">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-serif">Profile Information</h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-aura-gold hover:text-aura-ink transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Full Name</label>
                        <input 
                          type="text" 
                          className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                          value={editFormData.name}
                          onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Mobile Number</label>
                        <input 
                          type="tel" 
                          className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                          value={editFormData.phone}
                          onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Default Address</label>
                        <input 
                          type="text" 
                          className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                          value={editFormData.address}
                          onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
                          placeholder="Street Address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">City</label>
                          <input 
                            type="text" 
                            className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                            value={editFormData.city}
                            onChange={e => setEditFormData({ ...editFormData, city: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Pincode</label>
                          <input 
                            type="text" 
                            className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                            value={editFormData.pincode}
                            onChange={e => setEditFormData({ ...editFormData, pincode: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleUpdateProfile}
                    className="w-full bg-aura-ink text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-aura-gold transition-all shadow-lg"
                  >
                    Save Profile Changes
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-aura-ink/5 shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-aura-paper flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-aura-gold" />
                        </div>
                        <h3 className="font-serif text-xl">Personal Information</h3>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/40 mb-1">Full Name</p>
                          <p className="text-lg font-serif">{user.name}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/40 mb-1">Email Address</p>
                          <p className="text-lg font-serif">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/40 mb-1">Mobile Number</p>
                          <p className="text-lg font-serif">{user.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-aura-ink/5 shadow-sm">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-aura-paper flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-aura-gold" />
                        </div>
                        <h3 className="font-serif text-xl">Primary Address</h3>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/40 mb-1">Address Details</p>
                          <p className="text-lg font-serif leading-relaxed">
                            {user.address ? (
                              <>
                                {user.address}<br />
                                {user.city} - {user.pincode}
                              </>
                            ) : (
                              <span className="text-aura-ink/40 italic text-sm">No primary address set.</span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/40 mb-1">Member Since</p>
                          <p className="text-lg font-serif">{new Date(user.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        )}

        {activeTab === 'sizer' && (
          <motion.section 
            key="sizer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-10 rounded-[3rem] border border-aura-ink/5 shadow-sm">
              <h2 className="text-2xl font-serif mb-8">Ring Sizer Guide</h2>
              <RingSizerContent />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

const Wishlist = () => {
  const { wishlist, products, toggleWishlist, addToCart } = useStore();
  
  const wishlistedProducts = useMemo(() => {
    return products.filter(p => wishlist.includes(p.id));
  }, [wishlist, products]);

  return (
    <div className="pb-24 pt-24 px-6">
      <h1 className="text-4xl font-serif mb-12">Your Wishlist</h1>
      {wishlistedProducts.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 mx-auto mb-6 text-aura-ink/20" />
          <p className="text-aura-ink/60">Your wishlist is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlistedProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              isWishlisted={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const BondsPage = () => {
  const navigate = useNavigate();
  const bonds = [
    { name: 'Mom', image: 'https://images.unsplash.com/photo-1594122230689-45899d9e6f69?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Dad', image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Brother', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Sister', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Boyfriend', image: 'https://images.unsplash.com/photo-1516589174184-c685266e430c?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Girlfriend', image: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Wife', image: 'https://images.unsplash.com/photo-1511733334857-e82f64b75a95?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Husband', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Friend', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Other', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2070&auto=format&fit=crop' }
  ];

  return (
    <div className="min-h-screen bg-white pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-serif mb-4">Shop by Bond</h1>
          <p className="text-aura-ink/60 italic">Celebrate every connection with a piece that speaks from the heart.</p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:gap-8">
          {bonds.map((bond) => (
            <button
              key={bond.name}
              onClick={() => navigate(`/shop?bond=${bond.name}`)}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
            >
              <img 
                src={bond.image} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-left">
                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1 block">For</span>
                <h3 className="text-2xl font-serif text-white">{bond.name}</h3>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const { products, settings, user, token, refreshProducts, refreshSettings, categories, refreshCategories, homepageContent, refreshHomepageContent, setHomepageContent, setCategories, deleteOrder, deleteCategory, deleteHomepageContent, coupons, refreshCoupons } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'users' | 'activity' | 'notifications' | 'settings' | 'categories' | 'homepage' | 'coupons'>('overview');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingHomepage, setEditingHomepage] = useState<Partial<HomepageContent> | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [cmsSettings, setCmsSettings] = useState<Partial<Settings>>({});
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [notifData, setNotifData] = useState({ title: '', message: '', image: '', targetUserId: '' });

  const [adminUserData, setAdminUserData] = useState<{ carts: any[], wishlists: any[] }>({ carts: [], wishlists: [] });

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const _adminToken = localStorage.getItem('aura_token');
      const headers = _adminToken
        ? { Authorization: `Bearer ${_adminToken}` }
        : {};
      const [ordersRes, usersRes, activityRes, statsRes, userDataRes] = await Promise.all([
        fetch('/api/orders',         { headers }).then(res => res.ok ? res.json() : Promise.reject("Orders failed: " + res.status)),
        fetch('/api/users',          { headers }).then(res => res.ok ? res.json() : Promise.reject("Users failed: " + res.status)),
        fetch('/api/activity',       { headers }).then(res => res.ok ? res.json() : Promise.reject("Activity failed: " + res.status)),
        fetch('/api/admin/stats',    { headers }).then(res => res.ok ? res.json() : Promise.reject("Stats failed: " + res.status)),
        fetch('/api/admin/user-data',{ headers }).then(res => res.ok ? res.json() : Promise.reject("User data failed: " + res.status)),
      ]);
      setAllOrders(ordersRes);
      setAllUsers(usersRes);
      setActivities(activityRes);
      setStats(statsRes);
      setAdminUserData(userDataRes);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setError("Failed to load dashboard data. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  // Stable primitive deps prevent re-creation on every user state change
  }, [user?.id, user?.role]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (settings) setCmsSettings(settings);
  }, [settings]);

  if (user?.role !== 'admin') {
    return (
      <div className="pt-40 text-center">
        <X className="w-16 h-16 mx-auto mb-6 text-red-500/20" />
        <h2 className="text-2xl font-serif mb-2">Access Denied</h2>
        <p className="text-aura-ink/60 mb-8">You do not have permission to view this page.</p>
        <Link to="/profile" className="text-aura-gold underline">Return to Profile</Link>
      </div>
    );
  }

  const handleUpdateOrderStatus = async (orderId: string, status: string, tracking_id?: string, tracking_status?: string) => {
    if (!user) return;
    const _oToken = localStorage.getItem('aura_token');
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(_oToken ? { Authorization: `Bearer ${_oToken}` } : {})
      },
      body: JSON.stringify({ status, tracking_id, tracking_status })
    });
    fetchData();
  };

  const handleUpdatePaymentStatus = async (orderId: string, payment_status: string) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to mark this order as ${payment_status}?`)) return;
    const _pToken = localStorage.getItem('aura_token');
    await fetch(`/api/orders/${orderId}/payment-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(_pToken ? { Authorization: `Bearer ${_pToken}` } : {})
      },
      body: JSON.stringify({ payment_status })
    });
    fetchData();
  };

  const handleSaveProduct = async (data: Partial<Product>) => {
    if (!user) return;
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/products/${data.id}` : '/api/products';
    
    // Ensure images is always an array before sending to backend
    const normalizedImages = (() => {
      if (!data.images) return [];
      if (Array.isArray(data.images)) return data.images;
      if (typeof data.images === 'string') {
        try { return JSON.parse(data.images as string); } catch { return []; }
      }
      return [];
    })();
    
    const payload = data.id
      ? { ...data, images: normalizedImages }
      : { ...data, images: normalizedImages, id: 'p_' + Math.random().toString(36).substr(2, 9) };

    await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    setEditingProduct(null);
    refreshProducts();
  };

  const handleSaveCategory = async (data: Partial<Category>) => {
    if (!user) return;
    const payload = data.id ? data : { ...data, id: 'cat_' + Math.random().toString(36).substr(2, 9) };
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    setEditingCategory(null);
    refreshCategories();
  };

  const handleSaveHomepageContent = async (data: Partial<HomepageContent>) => {
    if (!user) return;
    try {
      const payload = data.id ? data : { ...data, id: 'hp_' + Math.random().toString(36).substr(2, 9) };
      const res = await fetch('/api/homepage-content', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setEditingHomepage(null);
        refreshHomepageContent();
      } else {
        const error = await res.json();
        alert('Failed to save content: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.error("Save content error:", err);
      alert('An error occurred while saving content.');
    }
  };

  const handleSaveUser = async () => {
    if (!editingUser || !user) return;
    const _suToken = localStorage.getItem('aura_token');
    if (editingUser.id) {
      await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(_suToken ? { Authorization: `Bearer ${_suToken}` } : {})
        },
        body: JSON.stringify(editingUser)
      });
    } else {
      const phone = editingUser.phone?.trim();
      if (phone) {
        const e164 = phone.startsWith('+') ? phone : `+91${phone}`;
        await fetch('/api/auth/phone-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: e164, name: editingUser.name })
        });
      } else {
        await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editingUser.name, email: editingUser.email })
        });
      }
    }
    setEditingUser(null);
    fetchData();
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    const _sToken = localStorage.getItem('aura_token');
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(_sToken ? { Authorization: `Bearer ${_sToken}` } : {})
      },
      body: JSON.stringify(cmsSettings)
    });
    if (res.ok) {
      refreshSettings();
      alert('Settings updated!');
    } else {
      alert('Failed to update settings.');
    }
  };

  const handleSaveCoupon = async (data: Partial<Coupon>) => {
    if (!user) return;
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/coupons/${data.id}` : '/api/coupons';
    
    await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
          ...( localStorage.getItem('aura_token') ? { Authorization: `Bearer ${localStorage.getItem('aura_token')}` } : {})
        },
      body: JSON.stringify(data)
    });
    setEditingCoupon(null);
    refreshCoupons();
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!user || !confirm('Are you sure?')) return;
    await fetch(`/api/coupons/${id}`, {
      method: 'DELETE',
      headers: { ...( localStorage.getItem('aura_token') ? { Authorization: `Bearer ${localStorage.getItem('aura_token')}` } : {}) }
    });
    refreshCoupons();
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.imageUrl || data.url || null;
      }
      const errData = await res.json().catch(() => ({}));
      console.error('Upload failed:', errData.message || res.status);
      return null;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?') || !user) return;
    await fetch(`/api/products/${id}`, { 
      method: 'DELETE',
      headers: { ...( localStorage.getItem('aura_token') ? { Authorization: `Bearer ${localStorage.getItem('aura_token')}` } : {}) }
    });
    refreshProducts();
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user) return;
    // Directly delete from UI (Optimistic)
    setCategories(prev => prev.filter(c => c.id !== id));
    
    try {
      await fetch(`/api/categories/${id}`, { 
        method: 'DELETE',
        headers: { ...( localStorage.getItem('aura_token') ? { Authorization: `Bearer ${localStorage.getItem('aura_token')}` } : {}) }
      });
      refreshCategories();
    } catch (err) {
      console.error("Delete category error:", err);
      refreshCategories(); // Revert on error
    }
  };

  const handleExportOrders = () => {
    const data = allOrders.map(o => ({
      'Order ID': o.id,
      'Customer Name': o.user_name,
      'Customer Email': o.user_email,
      'Total Amount': o.total,
      'Status': o.status,
      'Payment Status': o.payment_status,
      'Payment Method': o.payment_method,
      'Razorpay ID': o.razorpay_payment_id || 'N/A',
      'Shipping Name': o.shipping_name,
      'Shipping Phone': o.shipping_phone,
      'Shipping Address': `${o.shipping_address}, ${o.shipping_city} - ${o.shipping_pincode}`,
      'Date': new Date(o.created_at).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Adore_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportUsers = () => {
    const data = allUsers.map(u => ({
      'User ID': u.id,
      'Name': u.name,
      'Email': u.email,
      'Phone': u.phone || 'N/A',
      'Role': u.role,
      'Joined Date': new Date(u.created_at).toLocaleString()
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `Adore_Customers_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDeleteHomepageContent = async (id: string) => {
    if (!user) return;
    // Directly delete from UI (Optimistic)
    setHomepageContent(prev => prev.filter(item => item.id !== id));
    
    try {
      const res = await fetch(`/api/homepage-content/${id}`, { 
        method: 'DELETE',
        headers: { ...( localStorage.getItem('aura_token') ? { Authorization: `Bearer ${localStorage.getItem('aura_token')}` } : {}) }
      });
      if (!res.ok) {
        const error = await res.json();
        console.error('Failed to delete content:', error);
        refreshHomepageContent(); // Revert on error
      }
    } catch (err) {
      console.error("Delete content error:", err);
      refreshHomepageContent(); // Revert on error
    }
  };

  const handleUpdateUserRole = async (targetUserId: string, role: string) => {
    if (!user) return;
    await fetch(`/api/users/${targetUserId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
          ...( localStorage.getItem('aura_token') ? { Authorization: `Bearer ${localStorage.getItem('aura_token')}` } : {})
        },
      body: JSON.stringify({ role })
    });
    fetchData();
  };

  const handleSendNotification = async () => {
    if (!user) return;
    const _nToken = localStorage.getItem('aura_token');
    await fetch('/api/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(_nToken ? { Authorization: `Bearer ${_nToken}` } : {})
      },
      body: JSON.stringify(notifData)
    });
    setNotifData({ title: '', message: '', image: '', targetUserId: '' });
    alert('Notification sent!');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    const _token = localStorage.getItem('aura_token');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: _token ? { Authorization: `Bearer ${_token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Upload failed: ' + (err.message || `HTTP ${res.status}`));
        return;
      }
      const data = await res.json();
      const url = data.imageUrl || data.url;
      if (url) callback(url);
      else alert('Upload succeeded but no URL was returned.');
    } catch (err: any) {
      alert('Upload error: ' + (err.message || 'Network error'));
    }
  };

  return (
    <div className="pb-32 pt-28 px-4 md:px-8 max-w-7xl mx-auto min-h-screen bg-aura-paper">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-6xl font-serif leading-tight">Admin Dashboard</h1>
          <p className="text-aura-ink/40 text-sm md:text-base">Welcome back, {user?.name}. Here's what's happening with your store today.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button 
            onClick={fetchData} 
            disabled={isLoading}
            className="p-4 bg-white border border-aura-ink/5 rounded-2xl transition-all disabled:opacity-50 shadow-sm hover:shadow-md active:scale-95"
          >
            <Package className={cn("w-6 h-6 text-aura-gold", isLoading && "animate-spin")} />
          </button>
          <div className="flex gap-2 glass p-2 rounded-[1.5rem] overflow-x-auto w-full sm:w-auto scrollbar-thin scrollbar-thumb-aura-gold/20 scrollbar-track-transparent pb-3">
            {[
              { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
              { id: 'orders', icon: Package, label: 'Orders' },
              { id: 'products', icon: ShoppingBag, label: 'Products' },
              { id: 'categories', icon: Menu, label: 'Categories' },
              { id: 'homepage', icon: HomeIcon, label: 'CMS' },
              { id: 'users', icon: Users, label: 'Users' },
              { id: 'activity', icon: HomeIcon, label: 'Activity' },
              { id: 'notifications', icon: Bell, label: 'Push' },
              { id: 'coupons', icon: Ticket, label: 'Coupons' },
              { id: 'settings', icon: SettingsIcon, label: 'Settings' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id !== 'activity') setUserFilter(null);
                }}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-bold transition-all whitespace-nowrap",
                  activeTab === tab.id ? "bg-aura-ink text-white shadow-xl scale-105" : "text-aura-ink/60 hover:text-aura-ink hover:bg-white/80"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {viewingUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setViewingUser(null)}
              className="absolute inset-0 bg-aura-ink/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-aura-paper rounded-[2.5rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
            >
              <div className="p-6 md:p-8 border-b border-aura-ink/5 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-xl md:text-2xl font-serif">{viewingUser.name}</h2>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/40">{viewingUser.email}</p>
                </div>
                <button onClick={() => setViewingUser(null)} className="p-2 hover:bg-aura-paper rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 md:p-8 space-y-8 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="bg-white p-5 rounded-2xl border border-aura-ink/5">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold mb-1">Role</p>
                    <p className="text-sm font-medium capitalize">{viewingUser.role}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-aura-ink/5">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold mb-1">Joined</p>
                    <p className="text-sm font-medium">{new Date(viewingUser.created_at || '').toLocaleDateString()}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-aura-ink/5">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold mb-1">Phone</p>
                    <p className="text-sm font-medium">{viewingUser.phone || 'N/A'}</p>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-aura-ink/5">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold mb-1">User ID</p>
                    <p className="text-[10px] font-mono break-all">{viewingUser.id}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-aura-ink/5">
                  <h3 className="text-lg font-serif mb-4">Shipping Address</h3>
                  {viewingUser.address ? (
                    <div className="text-sm space-y-1 text-aura-ink/70">
                      <p className="font-medium">{viewingUser.address}</p>
                      <p>{viewingUser.city} - {viewingUser.pincode}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-aura-ink/30 italic">No address saved.</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-serif mb-4">Recent Orders</h3>
                  <div className="space-y-3">
                    {allOrders.filter(o => o.user_id === viewingUser.id).length > 0 ? (
                      allOrders.filter(o => o.user_id === viewingUser.id).map(order => (
                        <div key={order.id} className="bg-white p-5 rounded-2xl border border-aura-ink/5 flex justify-between items-center hover:border-aura-gold/20 transition-colors">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold">Order #{order.id.slice(-6)}</p>
                            <p className="text-xs text-aura-ink/40">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">{formatPrice(Number(order.total) || 0)}</p>
                            <span className={cn(
                              "text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full",
                              order.status === 'delivered' ? "bg-green-100 text-green-700" : "bg-aura-gold/10 text-aura-gold"
                            )}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-aura-ink/30 italic">No orders found for this user.</p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button 
                    onClick={() => {
                      setUserFilter(viewingUser.id);
                      setActiveTab('activity');
                      setViewingUser(null);
                    }}
                    className="flex-1 bg-aura-ink text-white py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-aura-gold transition-all shadow-lg"
                  >
                    View Full Activity
                  </button>
                  <button 
                    onClick={() => {
                      setNotifData({ ...notifData, targetUserId: viewingUser.id, title: `Hello ${viewingUser.name}!` });
                      setActiveTab('notifications');
                      setViewingUser(null);
                    }}
                    className="flex-1 border border-aura-ink/10 py-4 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-aura-paper transition-all"
                  >
                    Send Notification
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {activeTab === 'notifications' && (
          <motion.div 
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-3xl border border-aura-ink/5">
              <h2 className="text-2xl font-serif mb-8">Send Push Notification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Title</label>
                    <input 
                      type="text" 
                      className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                      value={notifData.title}
                      onChange={e => setNotifData({ ...notifData, title: e.target.value })}
                      placeholder="Special Offer!"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Message</label>
                    <textarea 
                      className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold h-32"
                      value={notifData.message}
                      onChange={e => setNotifData({ ...notifData, message: e.target.value })}
                      placeholder="Get 20% off on all diamond rings today."
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Image URL (Optional)</label>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        className="flex-1 bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={notifData.image}
                        onChange={e => setNotifData({ ...notifData, image: e.target.value })}
                      />
                      <label className="bg-aura-gold text-white p-3 rounded-xl cursor-pointer hover:bg-aura-ink transition-colors">
                        <Upload className="w-5 h-5" />
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, (url) => setNotifData({ ...notifData, image: url }))} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Target User ID (Optional - Leave blank for all)</label>
                    <input 
                      type="text" 
                      className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                      value={notifData.targetUserId}
                      onChange={e => setNotifData({ ...notifData, targetUserId: e.target.value })}
                      placeholder="e.g. google_12345"
                    />
                  </div>
                  <button 
                    onClick={handleSendNotification}
                    className="w-full bg-aura-ink text-white py-4 rounded-xl text-sm font-medium uppercase tracking-widest hover:bg-aura-gold transition-colors shadow-lg"
                  >
                    Send Notification
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'coupons' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => setEditingCoupon({ code: '', discount_type: 'percentage', discount_value: 0, min_purchase: 0, active: 1 })}
                className="bg-aura-ink text-white px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Coupon
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-aura-ink/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-aura-paper border-b border-aura-ink/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Code</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Discount</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Min Purchase</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Expiry</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Status</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-ink/5">
                  {Array.isArray(coupons) && coupons.map(coupon => (
                    <tr key={coupon.id}>
                      <td className="px-6 py-4 font-mono font-bold">{coupon.code}</td>
                      <td className="px-6 py-4">
                        {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : formatPrice(coupon.discount_value)}
                      </td>
                      <td className="px-6 py-4">{formatPrice(coupon.min_purchase)}</td>
                      <td className="px-6 py-4 text-xs">{coupon.expiry_date || 'No expiry'}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full",
                          coupon.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        )}>
                          {coupon.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 flex gap-4">
                        <button onClick={() => setEditingCoupon(coupon)} className="text-[10px] uppercase tracking-widest font-bold text-aura-gold hover:underline">Edit</button>
                        <button onClick={() => handleDeleteCoupon(coupon.id)} className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
      {activeTab === 'categories' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => setEditingCategory({ name: '', type: 'category', parent_id: null })}
                className="bg-aura-ink text-white px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Category
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white p-6 rounded-2xl border border-aura-ink/5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-serif text-xl">{cat.name}</h3>
                      <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold">{cat.type}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingCategory(cat)} className="p-2 hover:bg-aura-paper rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash className="w-4 h-4" /></button>
                    </div>
                  </div>
                  {cat.type === 'category' && (
                    <div className="space-y-2">
                      <p className="text-[8px] uppercase tracking-widest font-bold text-aura-ink/40">Subcategories</p>
                      <div className="flex flex-wrap gap-2">
                        {categories.filter(s => s.parent_id === cat.id).map(sub => (
                          <span key={sub.id} className="px-2 py-1 bg-aura-paper rounded text-[10px]">{sub.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'homepage' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-aura-ink/5">
              <div>
                <h2 className="text-2xl font-serif">Homepage CMS</h2>
                <p className="text-aura-ink/40 text-sm">Manage banners, sections, and collections on your home page.</p>
              </div>
              <button 
                onClick={() => setEditingHomepage({ type: 'banner', title: '', subtitle: '', image_url: '', link_url: '', button_text: '', button_link: '', order_index: 0, active: 1 })}
                className="bg-aura-ink text-white px-8 py-4 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center gap-2 hover:bg-aura-gold transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" /> Add New Section
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {[...homepageContent].sort((a, b) => a.order_index - b.order_index).map(item => (
                <div key={item.id} className="bg-white p-6 rounded-3xl border border-aura-ink/5 flex flex-col md:flex-row gap-8 items-center group hover:border-aura-gold/20 transition-all">
                  <div className="w-full md:w-48 h-32 bg-aura-paper rounded-2xl overflow-hidden flex-shrink-0 relative">
                    {item.image_url ? (
                      <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-aura-ink/20">
                        <HomeIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-serif text-xl">{item.title || 'Untitled Section'}</h3>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[8px] uppercase font-black tracking-widest",
                        item.type === 'banner' ? "bg-blue-50 text-blue-600" :
                        item.type === 'gifting' ? "bg-aura-gold/10 text-aura-gold" :
                        "bg-aura-paper text-aura-ink/60"
                      )}>
                        {item.type}
                      </span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[8px] uppercase font-black tracking-widest",
                        item.active ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"
                      )}>
                        {item.active ? 'Active' : 'Inactive'}
                      </span>
                      {item.page && (
                        <span className="px-3 py-1 bg-aura-paper rounded-full text-[8px] uppercase font-black tracking-widest text-aura-ink/40">
                          Page: {item.page}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-aura-ink/60 line-clamp-2 mb-4">{item.subtitle}</p>
                    <div className="flex items-center gap-4 text-[10px] text-aura-ink/40 font-mono">
                      {item.link_url && <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> {item.link_url}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <button 
                      onClick={() => setEditingHomepage(item)}
                      className="p-4 bg-aura-paper hover:bg-aura-gold/10 hover:text-aura-gold rounded-2xl transition-all"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteHomepageContent(item.id)}
                      className="p-4 bg-aura-paper hover:bg-red-50 hover:text-red-500 rounded-2xl transition-all"
                      title="Delete"
                    >
                      <Trash className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {!isFirebaseConfigured && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                    <Info className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-blue-900 font-bold uppercase tracking-widest text-xs mb-1">Firebase Configuration Required</h3>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      Google Authentication is currently running in <strong>Demo Mode</strong>. To enable real Google Login, you must add your Firebase API keys to the environment variables.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isFirebaseConfigured && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-amber-900 font-bold uppercase tracking-widest text-xs mb-1">Authorized Domains Check</h3>
                    <p className="text-amber-700 text-sm leading-relaxed mb-4">
                      Ensure this domain is added to your Firebase Console under <strong>Authentication &gt; Settings &gt; Authorized Domains</strong>:
                    </p>
                    <code className="bg-white/80 px-4 py-2 rounded-lg border border-amber-200 text-xs font-mono text-amber-900 block w-fit">
                      {window.location.hostname}
                    </code>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-2xl mb-8 flex items-center justify-between">
                <p className="text-sm font-medium">{error}</p>
                <button onClick={fetchData} className="text-xs font-bold uppercase tracking-widest underline">Retry</button>
              </div>
            )}

            {isLoading || !stats ? (
              <div className="flex items-center justify-center py-20">
                <Package className="w-12 h-12 text-aura-gold animate-spin" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                  {[
                    { label: 'Total Revenue', value: formatPrice(stats.stats.revenue), icon: ShoppingBag },
                    { label: 'Total Orders', value: stats.stats.orders, icon: Package },
                    { label: 'Total Customers', value: stats.stats.users, icon: Users },
                    { label: 'Active Products', value: stats.stats.products, icon: HomeIcon },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-aura-ink/5">
                      <stat.icon className="w-8 h-8 text-aura-gold mb-4" />
                      <p className="text-[10px] uppercase tracking-widest text-aura-ink/40 font-bold mb-1">{stat.label}</p>
                      <p className="text-2xl font-serif">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                  <div className="bg-white p-8 rounded-2xl border border-aura-ink/5">
                    <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-aura-gold" />
                      Most Viewed Products
                    </h3>
                    <div className="space-y-4">
                      {products
                        .sort((a, b) => (b.views || 0) - (a.views || 0))
                        .slice(0, 5)
                        .map(p => (
                          <div key={p.id} className="flex items-center gap-4 py-2 border-b border-aura-ink/5 last:border-0">
                            <img src={p.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=100'} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=100'; }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{p.name}</p>
                              <p className="text-[10px] text-aura-ink/40">{p.views || 0} views</p>
                            </div>
                            <p className="text-xs font-bold text-aura-gold">{formatPrice(p.price)}</p>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-aura-ink/5">
                    <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-aura-gold" />
                      User Carts
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {adminUserData.carts.length === 0 ? (
                        <p className="text-xs text-aura-ink/40 italic">No active carts</p>
                      ) : (
                        adminUserData.carts.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 py-2 border-b border-aura-ink/5 last:border-0">
                            <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{item.user_name}</p>
                              <p className="text-[10px] text-aura-ink/40">{item.product_name} (x{item.quantity})</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-aura-ink/5">
                    <h3 className="text-xl font-serif mb-6 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-red-500" />
                      User Wishlists
                    </h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {adminUserData.wishlists.length === 0 ? (
                        <p className="text-xs text-aura-ink/40 italic">No active wishlists</p>
                      ) : (
                        adminUserData.wishlists.map((item, i) => (
                          <div key={i} className="flex items-center gap-4 py-2 border-b border-aura-ink/5 last:border-0">
                            <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium truncate">{item.user_name}</p>
                              <p className="text-[10px] text-aura-ink/40">{item.product_name}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-aura-ink/5">
                    <h3 className="text-xl font-serif mb-6">Recent Orders</h3>
                    <div className="space-y-4">
                      {stats.recentOrders.map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between py-3 border-b border-aura-ink/5 last:border-0">
                          <div>
                            <p className="text-sm font-medium">{order.user_name}</p>
                            <p className="text-[10px] text-aura-ink/40">#{order.id.slice(-6)} • {new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatPrice(Number(order.total) || 0)}</p>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold">{order.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-aura-ink/5">
                    <h3 className="text-xl font-serif mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setActiveTab('products')} className="p-4 bg-aura-paper rounded-xl text-center hover:bg-aura-gold/10 transition-colors">
                        <Plus className="w-6 h-6 mx-auto mb-2 text-aura-gold" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Add Product</span>
                      </button>
                      <button onClick={() => setActiveTab('settings')} className="p-4 bg-aura-paper rounded-xl text-center hover:bg-aura-gold/10 transition-colors">
                        <SettingsIcon className="w-6 h-6 mx-auto mb-2 text-aura-gold" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Edit CMS</span>
                      </button>
                      <button onClick={handleExportOrders} className="p-4 bg-aura-paper rounded-xl text-center hover:bg-aura-gold/10 transition-colors">
                        <Download className="w-6 h-6 mx-auto mb-2 text-aura-gold" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Export Orders</span>
                      </button>
                      <button onClick={handleExportUsers} className="p-4 bg-aura-paper rounded-xl text-center hover:bg-aura-gold/10 transition-colors">
                        <Download className="w-6 h-6 mx-auto mb-2 text-aura-gold" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Export Users</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="bg-white rounded-2xl border border-aura-ink/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                  <thead className="bg-aura-paper border-b border-aura-ink/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Order ID</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Customer</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Shipping</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Total & Payment</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Status</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-ink/5">
                  {allOrders.map(order => (
                    <tr key={order.id} className="hover:bg-aura-paper/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">#{order.id.slice(-6)}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{order.user_name}</p>
                        <p className="text-[10px] text-aura-ink/40">{order.user_email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[10px] font-medium">{order.shipping_name}</p>
                        <p className="text-[10px] text-aura-ink/40 leading-tight">{order.shipping_address}, {order.shipping_city} - {order.shipping_pincode}</p>
                        <p className="text-[10px] text-aura-ink/40">{order.shipping_phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{formatPrice(Number(order.total) || 0)}</p>
                        <div className="mt-1 space-y-1">
                          <p className={cn(
                            "text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded inline-block",
                            order.payment_status === 'paid' ? "bg-green-100 text-green-700" : 
                            order.payment_status === 'failed' ? "bg-red-100 text-red-700" : 
                            order.payment_status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-aura-gold/10 text-aura-gold"
                          )}>
                            {order.payment_method} • {order.payment_status === 'paid' ? 'SUCCESS' : 
                                                     order.payment_status === 'failed' ? 'FAILED' : 
                                                     order.payment_status === 'pending' ? 'CASH' : order.payment_status}
                          </p>
                          {order.razorpay_payment_id && (
                            <p className="text-[8px] font-mono text-aura-ink/40">ID: {order.razorpay_payment_id}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <select 
                            value={order.status} 
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value, order.tracking_id, order.tracking_status)}
                            className={cn(
                              "text-[10px] uppercase tracking-widest font-bold px-3 py-2 rounded-xl border outline-none transition-all",
                              order.status === 'delivered' ? "bg-green-50 border-green-200 text-green-700" :
                              order.status === 'shipped' ? "bg-blue-50 border-blue-200 text-blue-700" :
                              order.status === 'failed' ? "bg-red-50 border-red-200 text-red-700" :
                              "bg-aura-paper border-aura-ink/10 text-aura-ink"
                            )}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="failed">Failed</option>
                          </select>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[8px] uppercase tracking-widest font-bold px-2 py-1 rounded",
                              order.payment_status === 'paid' ? "bg-green-100 text-green-700" : 
                              order.payment_status === 'failed' ? "bg-red-100 text-red-700" : 
                              order.payment_status === 'pending' ? "bg-amber-100 text-amber-700" : "bg-aura-gold/10 text-aura-gold"
                            )}>
                              {order.payment_status === 'paid' ? 'SUCCESS' : 
                               order.payment_status === 'failed' ? 'FAILED' : 
                               order.payment_status === 'pending' ? 'CASH' : order.payment_status}
                            </span>
                            {order.payment_status !== 'paid' && (
                              <button 
                                onClick={() => handleUpdatePaymentStatus(order.id, 'paid')}
                                className="text-[8px] uppercase tracking-widest font-bold text-aura-gold hover:underline"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                          <input 
                            type="text" 
                            placeholder="Tracking ID"
                            className="text-[10px] bg-aura-paper border border-aura-ink/5 rounded px-2 py-1 outline-none focus:border-aura-gold"
                            defaultValue={order.tracking_id}
                            onBlur={(e) => handleUpdateOrderStatus(order.id, order.status, e.target.value, order.tracking_status)}
                          />
                          <input 
                            type="text" 
                            placeholder="Tracking Status"
                            className="text-[10px] bg-aura-paper border border-aura-ink/5 rounded px-2 py-1 outline-none focus:border-aura-gold"
                            defaultValue={order.tracking_status}
                            onBlur={(e) => handleUpdateOrderStatus(order.id, order.status, order.tracking_id, e.target.value)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-aura-ink/40">
                        <div className="flex flex-col gap-2">
                          {new Date(order.created_at).toLocaleDateString()}
                          <button 
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
                                await deleteOrder(order.id);
                                fetchData();
                              }
                            }}
                            className="text-red-500 hover:text-red-700 font-bold uppercase tracking-widest text-[8px] flex items-center gap-1"
                          >
                            <Trash className="w-3 h-3" /> Delete Order
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => setEditingProduct({ name: '', price: 0, category: 'Gold', subcategory: 'Women', description: '', image: '', stock: 10 })}
                className="bg-aura-ink text-white px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-aura-ink/5 flex gap-4">
                  <img src={p.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200'} className="w-20 h-20 object-cover rounded-lg" referrerPolicy="no-referrer" onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=200'; }} />
                  <div className="flex-1">
                    <h3 className="font-serif text-lg">{p.name}</h3>
                    <p className="text-xs text-aura-ink/40 mb-2">{p.category} • {p.subcategory}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-aura-gold">{formatPrice(p.price)}</span>
                      <div className="flex gap-3">
                        <button onClick={() => setEditingProduct({
                          ...p,
                          images: Array.isArray(p.images) ? p.images :
                            typeof p.images === 'string' ? (() => { try { return JSON.parse(p.images as any); } catch { return []; } })() : []
                        })} className="text-xs uppercase tracking-widest font-semibold hover:text-aura-gold">Edit</button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="text-xs uppercase tracking-widest font-semibold text-red-500 hover:text-red-700">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex justify-end mb-6">
              <button 
                onClick={() => setEditingUser({ name: '', phone: '', role: 'admin' })}
                className="bg-aura-ink text-white px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-medium flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add Admin/User
              </button>
            </div>
            <div className="bg-white rounded-2xl border border-aura-ink/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-aura-paper border-b border-aura-ink/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">User</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Role</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Joined</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-ink/5">
                  {allUsers.map(u => (
                    <tr key={u.id} className="hover:bg-aura-paper/50 transition-colors">
                      <td className="px-6 py-4 cursor-pointer group" onClick={() => setViewingUser(u)}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-aura-gold/10 flex items-center justify-center text-aura-gold font-bold text-xs uppercase">
                            {(u.name || '?').charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium group-hover:text-aura-gold transition-colors">{u.name}</p>
                            <p className="text-[10px] text-aura-ink/40 font-mono">{u.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          className="text-[10px] uppercase tracking-widest font-bold bg-aura-paper border border-aura-ink/10 rounded-lg px-2 py-1 outline-none focus:border-aura-gold"
                          value={u.role}
                          onChange={(e) => handleUpdateUserRole(u.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="support">Support</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-[10px] text-aura-ink/40">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 flex gap-4">
                        <button 
                          onClick={() => setViewingUser(u)}
                          className="text-[10px] uppercase tracking-widest font-bold text-aura-gold hover:underline"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => {
                            setUserFilter(u.id);
                            setActiveTab('activity');
                          }}
                          className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/60 hover:text-aura-ink hover:underline"
                        >
                          Activity
                        </button>
                        <button 
                          onClick={() => setNotifData({ ...notifData, targetUserId: u.id, title: `Hello ${u.name}!` })}
                          className="text-[10px] uppercase tracking-widest font-bold text-aura-ink/60 hover:text-aura-ink hover:underline"
                        >
                          Notify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

        {activeTab === 'activity' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {userFilter && (
              <div className="mb-6 flex items-center justify-between bg-aura-gold/10 p-4 rounded-xl">
                <p className="text-sm font-medium">Showing activity for: <span className="text-aura-gold">{allUsers.find(u => u.id === userFilter)?.name}</span></p>
                <button onClick={() => setUserFilter(null)} className="text-[10px] uppercase tracking-widest font-bold hover:underline">Clear Filter</button>
              </div>
            )}
            <div className="bg-white rounded-2xl border border-aura-ink/5 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-aura-paper border-b border-aura-ink/5">
                  <tr>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">User</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Action</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Details</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aura-ink/5">
                  {activities
                    .filter(act => !userFilter || act.user_id === userFilter)
                    .map(act => (
                    <tr key={act.id}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{act.user_name}</p>
                        <p className="text-[10px] text-aura-ink/40">{act.user_email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-aura-gold">{act.action}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-aura-ink/60">{act.details}</td>
                      <td className="px-6 py-4 text-[10px] text-aura-ink/40">{new Date(act.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

        {activeTab === 'settings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-aura-ink/5 space-y-8">
                <h2 className="text-2xl font-serif">Storefront CMS</h2>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-aura-gold">Hero Section</h3>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Hero Title</label>
                      <input 
                        type="text" 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={cmsSettings.hero_title || ''}
                        onChange={e => setCmsSettings({ ...cmsSettings, hero_title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Hero Image URL</label>
                      <div className="flex gap-4">
                        <input 
                          type="text" 
                          className="flex-1 bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                          value={cmsSettings.hero_image || ''}
                          onChange={e => setCmsSettings({ ...cmsSettings, hero_image: e.target.value })}
                        />
                        <label className="bg-aura-gold text-white p-3 rounded-xl cursor-pointer hover:bg-aura-ink transition-colors">
                          <Upload className="w-5 h-5" />
                          <input type="file" className="hidden" onChange={e => handleFileUpload(e, (url) => setCmsSettings({ ...cmsSettings, hero_image: url }))} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Hero Subtitle</label>
                      <textarea 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold h-24"
                        value={cmsSettings.hero_subtitle || ''}
                        onChange={e => setCmsSettings({ ...cmsSettings, hero_subtitle: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-aura-ink/5">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-aura-gold">Brand Story</h3>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Story Text</label>
                      <textarea 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold h-24"
                        value={cmsSettings.brand_story || ''}
                        onChange={e => setCmsSettings({ ...cmsSettings, brand_story: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-aura-ink/5">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-aura-gold">Gifting Section</h3>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Gifting Title</label>
                      <input 
                        type="text" 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={cmsSettings.gifting_title || ''}
                        onChange={e => setCmsSettings({ ...cmsSettings, gifting_title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Gifting Subtitle</label>
                      <textarea 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold h-24"
                        value={cmsSettings.gifting_subtitle || ''}
                        onChange={e => setCmsSettings({ ...cmsSettings, gifting_subtitle: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-aura-ink/5">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-aura-gold">Category Display</h3>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Category Grid Format</label>
                      <select 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={cmsSettings.category_grid_format || 'circle'}
                        onChange={e => setCmsSettings({ ...cmsSettings, category_grid_format: e.target.value as any })}
                      >
                        <option value="circle">Circle</option>
                        <option value="rectangle">Rectangle (3:4)</option>
                        <option value="square">Square</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-aura-ink/5">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-aura-gold">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Instagram URL</label>
                        <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={cmsSettings.social_instagram || ''} onChange={e => setCmsSettings({ ...cmsSettings, social_instagram: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Facebook URL</label>
                        <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={cmsSettings.social_facebook || ''} onChange={e => setCmsSettings({ ...cmsSettings, social_facebook: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">LinkedIn URL</label>
                        <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={cmsSettings.social_linkedin || ''} onChange={e => setCmsSettings({ ...cmsSettings, social_linkedin: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">WhatsApp Number</label>
                        <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={cmsSettings.social_whatsapp || ''} onChange={e => setCmsSettings({ ...cmsSettings, social_whatsapp: e.target.value })} placeholder="e.g. 919876543210" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-aura-ink/5">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-aura-gold">Legal Pages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Privacy Policy URL</label>
                        <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={cmsSettings.link_privacy_policy || ''} onChange={e => setCmsSettings({ ...cmsSettings, link_privacy_policy: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Terms & Conditions URL</label>
                        <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={cmsSettings.link_terms_conditions || ''} onChange={e => setCmsSettings({ ...cmsSettings, link_terms_conditions: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-aura-ink/5 space-y-8">
                <h2 className="text-2xl font-serif">Theme & Appearance</h2>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Primary Color (Gold)</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          className="w-10 h-10 rounded-lg cursor-pointer"
                          value={cmsSettings.primary_color || '#D4AF37'}
                          onChange={e => setCmsSettings({ ...cmsSettings, primary_color: e.target.value })}
                        />
                        <input 
                          type="text" 
                          className="flex-1 bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-2 text-xs font-mono"
                          value={cmsSettings.primary_color || '#D4AF37'}
                          onChange={e => setCmsSettings({ ...cmsSettings, primary_color: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Secondary Color (Ink)</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          className="w-10 h-10 rounded-lg cursor-pointer"
                          value={cmsSettings.secondary_color || '#1A1A1A'}
                          onChange={e => setCmsSettings({ ...cmsSettings, secondary_color: e.target.value })}
                        />
                        <input 
                          type="text" 
                          className="flex-1 bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-2 text-xs font-mono"
                          value={cmsSettings.secondary_color || '#1A1A1A'}
                          onChange={e => setCmsSettings({ ...cmsSettings, secondary_color: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Heading Font</label>
                    <select 
                      className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                      value={cmsSettings.font_heading || 'serif'}
                      onChange={e => setCmsSettings({ ...cmsSettings, font_heading: e.target.value })}
                    >
                      <option value="serif">Classic Serif (Playfair)</option>
                      <option value="sans">Modern Sans (Inter)</option>
                      <option value="mono">Technical Mono (JetBrains)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Body Font</label>
                    <select 
                      className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                      value={cmsSettings.font_body || 'sans'}
                      onChange={e => setCmsSettings({ ...cmsSettings, font_body: e.target.value })}
                    >
                      <option value="sans">Modern Sans (Inter)</option>
                      <option value="serif">Classic Serif (Playfair)</option>
                      <option value="mono">Technical Mono (JetBrains)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-8 border-t border-aura-ink/5">
                  <h2 className="text-2xl font-serif mb-6">Payment Gateway</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Provider</label>
                      <select 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={cmsSettings.payment_gateway_provider || 'Razorpay'}
                        onChange={e => setCmsSettings({ ...cmsSettings, payment_gateway_provider: e.target.value })}
                      >
                        <option value="Razorpay">Razorpay</option>
                        <option value="Stripe">Stripe</option>
                        <option value="PayPal">PayPal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Razorpay Key ID (VITE_RAZORPAY_KEY_ID)</label>
                      <input 
                        type="text" 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={cmsSettings.razorpay_key_id || ''}
                        onChange={e => setCmsSettings({ ...cmsSettings, razorpay_key_id: e.target.value })}
                        placeholder="rzp_test_..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Razorpay Secret Key (RAZORPAY_KEY_SECRET)</label>
                      <input 
                        type="password" 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={cmsSettings.razorpay_key_secret || ''}
                        onChange={e => setCmsSettings({ ...cmsSettings, razorpay_key_secret: e.target.value })}
                        placeholder="••••••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <button 
                onClick={handleSaveSettings}
                className="bg-aura-ink text-white px-10 py-4 rounded-xl text-sm font-medium uppercase tracking-widest hover:bg-aura-gold transition-colors"
              >
                Save All Settings
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-serif">{editingProduct.id ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setEditingProduct(null)}><X className="w-6 h-6" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={editingProduct.name || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Price</label>
                  <input 
                    type="number" 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={editingProduct.price || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Description</label>
                  <textarea 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold h-24"
                    value={editingProduct.description || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Category</label>
                  <select 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={editingProduct.category || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                  >
                    <option value="">Select Category</option>
                    {categories.filter(c => c.type === 'category').map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Bond Tag</label>
                  <select 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={editingProduct.bond || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, bond: e.target.value })}
                  >
                    <option value="">No Bond Tag</option>
                    {['Mom', 'Dad', 'Brother', 'Sister', 'Boyfriend', 'Girlfriend', 'Wife', 'Husband', 'Friend', 'Other'].map(bond => (
                      <option key={bond} value={bond}>{bond}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Subcategory</label>
                  <select 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={editingProduct.subcategory || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, subcategory: e.target.value as any })}
                  >
                    <option value="">Select Subcategory</option>
                    {categories.filter(c => c.type === 'subcategory' && (!editingProduct.category || c.parent_id === categories.find(pc => pc.name === editingProduct.category)?.id)).map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2 text-aura-gold">Product Media</label>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest font-bold text-aura-ink/40 mb-1">Thumbnail Image URL *</label>
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              className="flex-1 bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                              value={editingProduct.image || ''}
                              onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                              placeholder="Main thumbnail URL"
                            />
                            <label className="bg-aura-ink text-white px-4 py-3 rounded-xl cursor-pointer hover:bg-aura-gold transition-colors flex items-center justify-center">
                              <Plus className="w-4 h-4" />
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const url = await handleImageUpload(file);
                                    if (url) setEditingProduct({ ...editingProduct, image: url });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                        {editingProduct.image && (
                          <div className="w-20 h-20 rounded-xl overflow-hidden border border-aura-ink/10 shrink-0">
                            <img src={editingProduct.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest font-bold text-aura-ink/40 mb-1">Additional Images (comma separated)</label>
                      <div className="space-y-2">
                        <textarea 
                          className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold h-20"
                          value={(Array.isArray(editingProduct.images) ? editingProduct.images : []).join(', ')}
                          onChange={e => setEditingProduct({ ...editingProduct, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          placeholder="image1.jpg, image2.jpg, image3.jpg"
                        />
                        {editingProduct.images && editingProduct.images.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {editingProduct.images.map((img, i) => (
                              <div key={i} className="relative w-12 h-12 rounded-lg overflow-hidden border border-aura-ink/10 group">
                                <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <button 
                                  onClick={() => {
                                    const newImages = editingProduct.images?.filter((_, idx) => idx !== i);
                                    setEditingProduct({ ...editingProduct, images: newImages });
                                  }}
                                  className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <label className="w-full bg-aura-paper border border-dashed border-aura-ink/20 rounded-xl py-4 cursor-pointer hover:border-aura-gold transition-all flex flex-col items-center justify-center gap-2 group">
                          <Plus className="w-5 h-5 text-aura-ink/40 group-hover:text-aura-gold" />
                          <span className="text-[8px] uppercase tracking-widest font-bold text-aura-ink/40 group-hover:text-aura-gold">Upload Additional Image</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleImageUpload(file);
                                if (url) {
                                  const currentImages = editingProduct.images || [];
                                  setEditingProduct({ ...editingProduct, images: [...currentImages, url] });
                                }
                              }
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest font-bold text-aura-ink/40 mb-1">Video URL (Optional)</label>
                      <input 
                        type="text" 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={editingProduct.video || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, video: e.target.value })}
                        placeholder="YouTube or Video URL"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest font-bold text-aura-ink/40 mb-1">Color (Optional)</label>
                      <input 
                        type="text" 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={editingProduct.color || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, color: e.target.value })}
                        placeholder="e.g. Emerald, Ruby, Pure Gold"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Stock</label>
                  <input 
                    type="number" 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={editingProduct.stock || 0}
                    onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="is_best_seller"
                      checked={!!editingProduct.is_best_seller}
                      onChange={e => setEditingProduct({ ...editingProduct, is_best_seller: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 accent-aura-gold"
                    />
                    <label htmlFor="is_best_seller" className="text-[10px] uppercase tracking-widest font-semibold">Best Seller</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="is_top_rated"
                      checked={!!editingProduct.is_top_rated}
                      onChange={e => setEditingProduct({ ...editingProduct, is_top_rated: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 accent-aura-gold"
                    />
                    <label htmlFor="is_top_rated" className="text-[10px] uppercase tracking-widest font-semibold">Top Rated</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => handleSaveProduct(editingProduct)}
                className="flex-1 bg-aura-ink text-white py-4 rounded-xl text-sm font-medium uppercase tracking-widest hover:bg-aura-gold transition-colors"
              >
                Save Product
              </button>
              {editingProduct.id && (
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this product?')) {
                      handleDeleteProduct(editingProduct.id!);
                      setEditingProduct(null);
                    }
                  }}
                  className="px-6 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                  title="Delete Product"
                >
                  <Trash className="w-5 h-5" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Homepage Edit Modal */}
      {editingHomepage && (
        <HomepageModal 
          item={editingHomepage} 
          onSave={handleSaveHomepageContent} 
          onDelete={async (id) => {
            await deleteHomepageContent(id);
            setEditingHomepage(null);
          }}
          onClose={() => setEditingHomepage(null)} 
        />
      )}

      {/* Category Edit Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-serif">{editingCoupon.id ? 'Edit Coupon' : 'Add Coupon'}</h2>
              <button onClick={() => setEditingCoupon(null)}><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Coupon Code</label>
                <input 
                  type="text" 
                  className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold font-mono uppercase"
                  value={editingCoupon.code || ''}
                  onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Type</label>
                  <select 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={editingCoupon.discount_type || 'percentage'}
                    onChange={e => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value as any })}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Value</label>
                  <input 
                    type="number" 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={editingCoupon.discount_value || 0}
                    onChange={e => setEditingCoupon({ ...editingCoupon, discount_value: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Min Purchase</label>
                <input 
                  type="number" 
                  className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                  value={editingCoupon.min_purchase || 0}
                  onChange={e => setEditingCoupon({ ...editingCoupon, min_purchase: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Expiry Date</label>
                <input 
                  type="date" 
                  className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                  value={editingCoupon.expiry_date || ''}
                  onChange={e => setEditingCoupon({ ...editingCoupon, expiry_date: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="coupon-active"
                  checked={editingCoupon.active === 1}
                  onChange={e => setEditingCoupon({ ...editingCoupon, active: e.target.checked ? 1 : 0 })}
                />
                <label htmlFor="coupon-active" className="text-[10px] uppercase tracking-widest font-semibold">Active</label>
              </div>
              <button 
                onClick={() => handleSaveCoupon(editingCoupon)}
                className="w-full bg-aura-ink text-white py-4 rounded-xl text-sm font-medium uppercase tracking-widest hover:bg-aura-gold transition-colors mt-4"
              >
                Save Coupon
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {editingCategory && (
        <CategoryModal 
          category={editingCategory} 
          onSave={(data) => handleSaveCategory(data)} 
          onDelete={async (id) => {
            await deleteCategory(id);
            setEditingCategory(null);
          }}
          onClose={() => setEditingCategory(null)} 
          categories={categories}
        />
      )}

      {/* User Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-aura-ink/40 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif">{editingUser.id ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => setEditingUser(null)}><X className="w-6 h-6" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                  value={editingUser.name || ''}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Phone Number</label>
                <input 
                  type="text" 
                  className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                  value={editingUser.phone || ''}
                  onChange={e => setEditingUser({ ...editingUser, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Role</label>
                <select 
                  className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                  value={editingUser.role || 'user'}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="support">Support</option>
                </select>
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setEditingUser(null)} className="flex-1 py-3 rounded-xl border border-aura-ink/10 text-xs uppercase tracking-widest font-bold">Cancel</button>
                <button onClick={handleSaveUser} className="flex-1 py-3 rounded-xl bg-aura-ink text-white text-xs uppercase tracking-widest font-bold">Save User</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// --- Modals ---

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('orderId');
    if (id) {
      setOrderId(id);
      handleTrack(id);
    }
  }, [location]);

  const handleTrack = async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Order not found');
      const data = await res.json();
      setOrder(data);
    } catch (err: any) {
      setError(err.message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-32 px-6 max-w-2xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif mb-4">Track Your Order</h1>
        <p className="text-aura-ink/60">Enter your order ID to see the latest status.</p>
      </div>

      <div className="flex gap-4 mb-12">
        <input 
          type="text" 
          placeholder="Order ID (e.g. #123456)"
          className="flex-1 bg-white border border-aura-ink/10 rounded-2xl px-6 py-4 outline-none focus:border-aura-gold transition-colors"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
        />
        <button 
          onClick={() => handleTrack(orderId)}
          disabled={loading}
          className="bg-aura-ink text-white px-8 py-4 rounded-2xl text-xs uppercase tracking-widest font-bold hover:bg-aura-gold transition-colors shadow-lg disabled:opacity-50"
        >
          {loading ? 'Tracking...' : 'Track'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-6 rounded-3xl text-center mb-12">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {order && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-aura-ink/5 p-8 md:p-12 shadow-xl"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-12 border-b border-aura-ink/5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-aura-gold font-black mb-2">Order Status</p>
              <h2 className="text-3xl font-serif capitalize">{order.status}</h2>
              <div className="mt-2">
                <span className={cn(
                  "text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full",
                  order.payment_status === 'paid' ? "bg-green-100 text-green-700" : 
                  order.payment_status === 'failed' ? "bg-red-100 text-red-700" : "bg-aura-gold/10 text-aura-gold"
                )}>
                  Payment: {order.payment_status}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-[0.4em] text-aura-ink/40 font-black mb-2">Estimated Delivery</p>
              <p className="text-xl font-serif">3-5 Business Days</p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-aura-paper" />
              <div className="space-y-12">
                {[
                  { status: 'pending', label: 'Order Placed', icon: ShoppingBag, date: order.created_at },
                  { status: 'processing', label: 'Processing', icon: Package, date: null },
                  { status: 'shipped', label: 'Shipped', icon: Truck, date: null },
                  { status: 'delivered', label: 'Delivered', icon: CheckCircle2, date: null }
                ].map((step, i) => {
                  const isCompleted = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= ['pending', 'processing', 'shipped', 'delivered'].indexOf(step.status);
                  const isCurrent = order.status === step.status;

                  return (
                    <div key={step.status} className="flex gap-8 relative">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors duration-500",
                        isCompleted ? "bg-aura-gold text-white" : "bg-aura-paper text-aura-ink/20"
                      )}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className={cn(
                          "text-sm font-bold uppercase tracking-widest mb-1",
                          isCompleted ? "text-aura-ink" : "text-aura-ink/20"
                        )}>
                          {step.label}
                        </h3>
                        {isCurrent && order.tracking_status && (
                          <p className="text-aura-gold text-xs font-medium">{order.tracking_status}</p>
                        )}
                        {step.date && (
                          <p className="text-[10px] text-aura-ink/40">{new Date(step.date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {order.tracking_id && (
              <div className="bg-aura-paper/50 rounded-2xl p-6 border border-aura-ink/5">
                <p className="text-[10px] uppercase tracking-widest font-black text-aura-ink/40 mb-2">Tracking ID</p>
                <p className="text-lg font-mono font-bold text-aura-ink">{order.tracking_id}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'support' }[]>([
    { text: "Hello! How can we help you today?", sender: 'support' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { text: input, sender: 'user' }]);
    setInput('');
    // Simulate support response
    setTimeout(() => {
      setMessages(prev => [...prev, { text: "Thank you for your message. A support representative will be with you shortly.", sender: 'support' }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-24 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-[2rem] shadow-2xl border border-aura-ink/10 w-80 md:w-96 overflow-hidden mb-4 flex flex-col h-[500px]"
          >
            <div className="bg-aura-ink text-white p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-aura-gold flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-lg">Adore Support</h3>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 aura-scroll-container !flex-col !overflow-x-hidden">
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "max-w-[80%] p-4 rounded-2xl text-sm",
                  m.sender === 'user' 
                    ? "bg-aura-gold text-white ml-auto rounded-tr-none" 
                    : "bg-aura-paper text-aura-ink mr-auto rounded-tl-none"
                )}>
                  {m.text}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-aura-ink/5 flex gap-2">
              <input 
                type="text" 
                placeholder="Type your message..."
                className="flex-1 bg-aura-paper rounded-xl px-4 py-3 text-sm outline-none focus:border-aura-gold border border-transparent transition-colors"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="bg-aura-ink text-white p-3 rounded-xl hover:bg-aura-gold transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-aura-ink text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-aura-gold transition-all duration-500 group"
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8 group-hover:scale-110 transition-transform" />}
      </button>
    </div>
  );
};

const CategoryModal = ({ category, onSave, onDelete, onClose, categories }: { category: Partial<Category>, onSave: (data: Partial<Category>) => void, onDelete?: (id: string) => void, onClose: () => void, categories: Category[] }) => {
  const [data, setData] = useState(category);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    const _token = localStorage.getItem('aura_token');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: _token ? { Authorization: `Bearer ${_token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Upload failed: ' + (err.message || `HTTP ${res.status}`));
        return;
      }
      const dataRes = await res.json();
      const url = dataRes.imageUrl || dataRes.url;
      if (url) setData({ ...data, image: url });
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif">{data.id ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Name</label>
            <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.name} onChange={e => setData({ ...data, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Type</label>
            <select className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.type} onChange={e => setData({ ...data, type: e.target.value as any })}>
              <option value="category">Category</option>
              <option value="subcategory">Subcategory</option>
            </select>
          </div>
          {data.type === 'subcategory' && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Parent Category</label>
              <select className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.parent_id || ''} onChange={e => setData({ ...data, parent_id: e.target.value })}>
                <option value="">Select Parent</option>
                {categories.filter(c => c.type === 'category').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Image</label>
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 rounded-xl bg-aura-paper overflow-hidden border border-aura-ink/5">
                {data.image ? <img src={data.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-aura-ink/20"><ShoppingBag className="w-6 h-6" /></div>}
              </div>
              <label className="flex-1 bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 cursor-pointer hover:border-aura-gold transition-colors text-xs uppercase tracking-widest font-bold text-center">
                {data.image ? 'Change Image' : 'Upload Image'}
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => onSave(data)} className="flex-1 bg-aura-ink text-white py-4 rounded-xl text-sm font-medium uppercase tracking-widest hover:bg-aura-gold transition-colors">Save Category</button>
          {data.id && onDelete && (
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete this category? All subcategories will also be affected.')) {
                  onDelete(data.id!);
                }
              }}
              className="px-6 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Trash className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const HomepageModal = ({ item, onSave, onDelete, onClose }: { item: Partial<HomepageContent>, onSave: (data: Partial<HomepageContent>) => void, onDelete?: (id: string) => void, onClose: () => void }) => {
  const [data, setData] = useState(item);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { products } = useStore();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    const _token = localStorage.getItem('aura_token');
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: _token ? { Authorization: `Bearer ${_token}` } : {},
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Upload failed: ' + (err.message || `HTTP ${res.status}`));
        return;
      }
      const result = await res.json();
      const url = result.imageUrl || result.url;
      if (url) setData({ ...data, image_url: url });
      else alert('Upload succeeded but no URL returned');
    } catch (err: any) {
      alert('Upload error: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const appScreens = [
    { name: 'Home', path: '/' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Gold Collection', path: '/shop?category=Gold' },
    { name: 'Diamond Collection', path: '/shop?category=Diamond' },
    { name: 'Silver Collection', path: '/shop?category=Silver' },
    { name: 'Profile', path: '/profile' },
    { name: 'Cart', path: '/cart' },
    { name: 'Wishlist', path: '/wishlist' },
    { name: 'Track Order', path: '/track-order' },
    { name: 'Help & Support', path: '/help' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif">{data.id ? 'Edit Content' : 'Add Content'}</h2>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Title</label>
              <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.title || ''} onChange={e => setData({ ...data, title: e.target.value })} />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Subtitle / Description</label>
              <textarea 
                className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold h-24" 
                value={data.subtitle || ''} 
                onChange={e => setData({ ...data, subtitle: e.target.value })} 
                placeholder={data.type === 'collection' ? "Enter Category or Subcategory name to show products from" : "Enter section description"}
              />
              {data.type === 'collection' && <p className="text-[8px] text-aura-gold mt-1 uppercase font-bold tracking-widest">Tip: Products matching this name will be shown automatically.</p>}
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Type</label>
              <select className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.type} onChange={e => setData({ ...data, type: e.target.value as any })}>
                <option value="banner">Hero Banner</option>
                <option value="promo_banner">Promotional Banner (Festive Sale)</option>
                <option value="section">Content Section</option>
                <option value="collection">Collection Highlight</option>
                <option value="promo">Promo Strip</option>
                <option value="gifting">Gifting Section</option>
                <option value="loyalty">Offers & Loyalty</option>
                <option value="trust">Trust & Certification</option>
                <option value="color_grid">Shop by Colour Grid</option>
                <option value="luxury_grid">Luxury within Reach Grid</option>
                <option value="shop_section">Shop Page Banner</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">
                {data.type === 'promo_banner' ? 'Desktop Height (e.g. 400px)' : 'Graphic Placement (Layout)'}
              </label>
              {data.type === 'promo_banner' ? (
                <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.layout || ''} onChange={e => setData({ ...data, layout: e.target.value })} placeholder="e.g. 400px" />
              ) : (
                <select className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.layout || 'right'} onChange={e => setData({ ...data, layout: e.target.value as any })}>
                  <option value="right">Right Side (Image Right)</option>
                  <option value="left">Left Side (Image Left)</option>
                  <option value="background">Full Background (Text Overlay)</option>
                  <option value="top">Top (Image Below Text)</option>
                </select>
              )}
              <p className="text-[8px] text-aura-ink/40 mt-1 uppercase font-bold tracking-widest">
                {data.type === 'promo_banner' ? 'Controls height on desktop screens.' : 'Controls where the image appears relative to text.'}
              </p>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Display on Page</label>
              <select className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.page || 'home'} onChange={e => setData({ ...data, page: e.target.value })}>
                <option value="home">Home Page (Top)</option>
                <option value="home_bottom">Home Page (Bottom)</option>
                <option value="shop">Shop Page</option>
                <option value="product">Product Detail Page</option>
                <option value="cart">Cart Page</option>
                <option value="all">All Pages</option>
              </select>
            </div>
            
            {['collection', 'luxury_grid'].includes(data.type) && (
              <div className="col-span-full">
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2 text-aura-gold">Selected Products (Manual Override)</label>
                <div className="bg-aura-paper border border-aura-ink/10 rounded-2xl p-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(data.product_ids || []).map(pid => {
                      const p = products.find(prod => prod.id === pid);
                      return (
                        <div key={pid} className="flex items-center gap-2 bg-white border border-aura-ink/10 rounded-full pl-2 pr-1 py-1 shadow-sm">
                          <img src={p?.image} className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
                          <span className="text-[10px] font-medium truncate max-w-[100px]">{p?.name || pid}</span>
                          <button 
                            onClick={() => setData({ ...data, product_ids: (data.product_ids || []).filter(id => id !== pid) })}
                            className="p-1 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                    {(data.product_ids || []).length === 0 && <span className="text-[10px] text-aura-ink/40 uppercase tracking-widest">No products selected. Showing by category/price.</span>}
                  </div>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-aura-ink/30" />
                    <input 
                      type="text" 
                      placeholder="Search products to add..." 
                      className="w-full bg-white border border-aura-ink/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-aura-gold text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm.length > 1 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-aura-ink/10 rounded-xl mt-2 shadow-2xl z-50 max-h-48 overflow-y-auto p-2 space-y-1">
                        {products
                          .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !(data.product_ids || []).includes(p.id))
                          .slice(0, 10)
                          .map(p => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setData({ ...data, product_ids: [...(data.product_ids || []), p.id] });
                                setSearchTerm('');
                              }}
                              className="w-full flex items-center gap-3 p-2 hover:bg-aura-paper rounded-lg transition-colors text-left"
                            >
                              <img src={p.image} className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold truncate">{p.name}</p>
                                <p className="text-[8px] text-aura-ink/40 uppercase tracking-widest">{p.category}</p>
                              </div>
                              <Plus className="w-3 h-3 text-aura-gold" />
                            </button>
                          ))
                        }
                        {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) && !(data.product_ids || []).includes(p.id)).length === 0 && (
                          <p className="text-[10px] text-center py-4 text-aura-ink/40">No matching products found</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">
                {data.type === 'promo_banner' ? 'Mobile Image URL' : 'Button Text'}
              </label>
              <div className="flex gap-4">
                <div className="flex-1 flex gap-2">
                  <input type="text" className="flex-1 bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.button_text || ''} onChange={e => setData({ ...data, button_text: e.target.value })} placeholder={data.type === 'promo_banner' ? "URL for mobile image" : "e.g. Shop Now"} />
                  {data.type === 'promo_banner' && (
                    <label className="bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-aura-gold/10 transition-colors">
                      <Upload className={cn("w-5 h-5", isUploading && "animate-bounce")} />
                      <input type="file" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setIsUploading(true);
                        const formData = new FormData();
                        formData.append('image', file);
                        const _t = localStorage.getItem('aura_token');
                        try {
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            headers: _t ? { Authorization: `Bearer ${_t}` } : {},
                            body: formData,
                          });
                          if (!res.ok) { alert('Upload failed: HTTP ' + res.status); return; }
                          const result = await res.json();
                          const url = result.imageUrl || result.url;
                          if (url) setData({ ...data, button_text: url });
                        } catch (err: any) {
                          alert('Upload error: ' + err.message);
                        } finally {
                          setIsUploading(false);
                        }
                      }} accept="image/*" />
                    </label>
                  )}
                </div>
                {data.type === 'promo_banner' && data.button_text && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-aura-ink/10 shrink-0">
                    <img src={data.button_text} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">
                {data.type === 'promo_banner' ? 'Desktop Image' : 'Image'}
              </label>
              <div className="flex gap-4">
                <div className="flex-1 flex gap-2">
                  <input type="text" className="flex-1 bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.image_url || ''} onChange={e => setData({ ...data, image_url: e.target.value })} placeholder="URL or Upload" />
                  <label className="bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-aura-gold/10 transition-colors">
                    <Upload className={cn("w-5 h-5", isUploading && "animate-bounce")} />
                    <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                  </label>
                </div>
                {data.image_url && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-aura-ink/10 shrink-0">
                    <img src={data.image_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">
                {data.type === 'promo_banner' ? 'Mobile Height (e.g. 256px)' : 'Section Link (Screen or URL)'}
              </label>
              {data.type === 'promo_banner' ? (
                <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.subtitle || ''} onChange={e => setData({ ...data, subtitle: e.target.value })} placeholder="e.g. 256px" />
              ) : (
                <div className="space-y-2">
                  <select 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={appScreens.some(s => s.path === data.link_url) ? data.link_url : 'custom'}
                    onChange={e => {
                      if (e.target.value !== 'custom') setData({ ...data, link_url: e.target.value });
                    }}
                  >
                    <option value="custom">Custom URL / External</option>
                    {appScreens.map(s => <option key={s.path} value={s.path}>{s.name}</option>)}
                  </select>
                  <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.link_url || ''} onChange={e => setData({ ...data, link_url: e.target.value })} placeholder="Enter URL if custom" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">
                {data.type === 'promo_banner' ? 'Border Radius (e.g. 3rem)' : 'Button Link (Screen or URL)'}
              </label>
              {data.type === 'promo_banner' ? (
                <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.button_link || ''} onChange={e => setData({ ...data, button_link: e.target.value })} placeholder="e.g. 3rem" />
              ) : (
                <div className="space-y-2">
                  <select 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={appScreens.some(s => s.path === data.button_link) ? data.button_link : 'custom'}
                    onChange={e => {
                      if (e.target.value !== 'custom') setData({ ...data, button_link: e.target.value });
                    }}
                  >
                    <option value="custom">Custom URL / External</option>
                    {appScreens.map(s => <option key={s.path} value={s.path}>{s.name}</option>)}
                  </select>
                  <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.button_link || ''} onChange={e => setData({ ...data, button_link: e.target.value })} placeholder="Enter URL if custom" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Layout</label>
                <select className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.layout} onChange={e => setData({ ...data, layout: e.target.value as any })}>
                  <option value="left">Left Aligned</option>
                  <option value="right">Right Aligned</option>
                  <option value="background">Background Image</option>
                  <option value="top">Top Aligned</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Page</label>
                <select className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.page} onChange={e => setData({ ...data, page: e.target.value })}>
                  <option value="home">Homepage</option>
                  <option value="shop">Shop Page</option>
                  <option value="all">All Pages</option>
                  <option value="home_bottom">Homepage Bottom</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Order Index</label>
                <input type="number" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.order_index} onChange={e => setData({ ...data, order_index: parseInt(e.target.value) })} />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Status</label>
                <select className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.active} onChange={e => setData({ ...data, active: parseInt(e.target.value) })}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {data.type === 'color_grid' && (
          <div className="mb-8 p-6 bg-aura-paper rounded-2xl border border-aura-ink/5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest">Color Grid Items</h3>
              <button 
                onClick={() => {
                  const items = JSON.parse(data.subtitle || '[]');
                  items.push({ name: 'New Color', color: '#000000', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=600', link: '' });
                  setData({ ...data, subtitle: JSON.stringify(items) });
                }}
                className="text-[10px] font-bold text-aura-gold uppercase tracking-widest flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>
            <div className="space-y-4">
              {(() => {
                try {
                  const items = JSON.parse(data.subtitle || '[]');
                  return items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-end p-4 bg-white rounded-xl border border-aura-ink/5">
                      <div className="flex-1 space-y-2">
                        <label className="block text-[8px] uppercase font-bold text-aura-ink/40">Name</label>
                        <input 
                          type="text" 
                          className="w-full bg-aura-paper border border-aura-ink/10 rounded-lg px-3 py-2 text-xs" 
                          value={item.name} 
                          onChange={e => {
                            const newItems = [...items];
                            newItems[idx].name = e.target.value;
                            setData({ ...data, subtitle: JSON.stringify(newItems) });
                          }}
                        />
                      </div>
                      <div className="w-20 space-y-2">
                        <label className="block text-[8px] uppercase font-bold text-aura-ink/40">Color</label>
                        <input 
                          type="color" 
                          className="w-full h-8 bg-aura-paper border border-aura-ink/10 rounded-lg cursor-pointer" 
                          value={item.color} 
                          onChange={e => {
                            const newItems = [...items];
                            newItems[idx].color = e.target.value;
                            setData({ ...data, subtitle: JSON.stringify(newItems) });
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="block text-[8px] uppercase font-bold text-aura-ink/40">Image URL</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="flex-1 bg-aura-paper border border-aura-ink/10 rounded-lg px-3 py-2 text-xs" 
                            value={item.image} 
                            onChange={e => {
                              const newItems = [...items];
                              newItems[idx].image = e.target.value;
                              setData({ ...data, subtitle: JSON.stringify(newItems) });
                            }}
                          />
                          <label className="bg-aura-paper border border-aura-ink/10 rounded-lg px-2 py-2 cursor-pointer hover:bg-aura-gold/10 transition-colors">
                            <Upload className="w-3 h-3 text-aura-ink/40" />
                            <input type="file" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const formData = new FormData();
                              formData.append('image', file);
                              const _t = localStorage.getItem('aura_token');
                              try {
                                const res = await fetch('/api/upload', {
                                  method: 'POST',
                                  headers: _t ? { Authorization: `Bearer ${_t}` } : {},
                                  body: formData,
                                });
                                if (!res.ok) { alert('Upload failed: HTTP ' + res.status); return; }
                                const result = await res.json();
                                const url = result.imageUrl || result.url;
                                if (url) {
                                  const newItems = [...items];
                                  newItems[idx].image = url;
                                  setData({ ...data, subtitle: JSON.stringify(newItems) });
                                }
                              } catch (err: any) {
                                alert('Upload error: ' + err.message);
                              }
                            }} accept="image/*" />
                          </label>
                        </div>
                      </div>
                      {item.image && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-aura-ink/10 shrink-0 mb-1">
                          <img src={item.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <button 
                        onClick={() => {
                          const newItems = items.filter((_: any, i: number) => i !== idx);
                          setData({ ...data, subtitle: JSON.stringify(newItems) });
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ));
                } catch (e) {
                  return <p className="text-xs text-red-500">Invalid JSON in subtitle. Resetting...</p>;
                }
              })()}
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <button onClick={() => onSave(data)} className="flex-1 bg-aura-ink text-white py-4 rounded-xl text-sm font-medium uppercase tracking-widest hover:bg-aura-gold transition-colors">Save Content</button>
          {data.id && onDelete && (
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete this content section?')) {
                  onDelete(data.id!);
                }
              }}
              className="px-6 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
            >
              <Trash className="w-5 h-5" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Footer = () => {
  const { settings } = useStore();
  const navigate = useNavigate();

  return (
    <footer className="bg-white border-t border-aura-ink/5 pt-16 pb-32 px-8 mt-0">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-6">
          <h3 className="font-serif text-2xl">ADORE</h3>
          <p className="text-xs text-aura-ink/60 leading-relaxed max-w-xs">
            Crafting timeless elegance for the modern individual. Our pieces are designed to celebrate life's most precious moments.
          </p>
          <div className="flex items-center gap-4">
            {settings?.social_instagram && (
              <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-aura-paper flex items-center justify-center text-aura-ink hover:bg-aura-gold hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {settings?.social_facebook && (
              <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-aura-paper flex items-center justify-center text-aura-ink hover:bg-aura-gold hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {settings?.social_linkedin && (
              <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-aura-paper flex items-center justify-center text-aura-ink hover:bg-aura-gold hover:text-white transition-all">
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {settings?.social_whatsapp && (
              <a href={`https://wa.me/${settings.social_whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-aura-paper flex items-center justify-center text-aura-ink hover:bg-aura-gold hover:text-white transition-all">
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6">Quick Links</h4>
          <ul className="space-y-4">
            <li><button onClick={() => navigate('/shop')} className="text-xs text-aura-ink/60 hover:text-aura-gold transition-colors">Shop All</button></li>
            <li><button onClick={() => navigate('/wishlist')} className="text-xs text-aura-ink/60 hover:text-aura-gold transition-colors">Wishlist</button></li>
            <li><button onClick={() => navigate('/track-order')} className="text-xs text-aura-ink/60 hover:text-aura-gold transition-colors">Track Order</button></li>
            <li><button onClick={() => navigate('/help')} className="text-xs text-aura-ink/60 hover:text-aura-gold transition-colors">Help & Support</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6">Categories</h4>
          <ul className="space-y-4">
            <li><button onClick={() => navigate('/shop?category=Gold')} className="text-xs text-aura-ink/60 hover:text-aura-gold transition-colors">Gold Jewellery</button></li>
            <li><button onClick={() => navigate('/shop?category=Diamond')} className="text-xs text-aura-ink/60 hover:text-aura-gold transition-colors">Diamond Jewellery</button></li>
            <li><button onClick={() => navigate('/shop?category=Platinum')} className="text-xs text-aura-ink/60 hover:text-aura-gold transition-colors">Platinum Jewellery</button></li>
            <li><button onClick={() => navigate('/shop?category=Silver')} className="text-xs text-aura-ink/60 hover:text-aura-gold transition-colors">Silver Jewellery</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6">Legal</h4>
          <ul className="space-y-4">
            {settings?.link_privacy_policy && (
              <li><a href={settings.link_privacy_policy} className="text-xs text-aura-ink/60 hover:text-aura-gold transition-colors">Privacy Policy</a></li>
            )}
            {settings?.link_terms_conditions && (
              <li><a href={settings.link_terms_conditions} className="text-xs text-aura-ink/60 hover:text-aura-gold transition-colors">Terms & Conditions</a></li>
            )}
            <li><button onClick={() => navigate('/help')} className="text-xs text-aura-ink/60 hover:text-aura-gold transition-colors">Contact Us</button></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-aura-ink/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-aura-ink/40 uppercase tracking-widest">© 2024 ADORE JEWELLERY. ALL RIGHTS RESERVED.</p>
        <div className="flex items-center gap-6">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4 opacity-30 grayscale" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3 opacity-30 grayscale" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6 opacity-30 grayscale" />
        </div>
      </div>
    </footer>
  );
};

// --- Main App ---

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [pathname]);
  return null;
};

export default function App() {
  const { cart, wishlist, settings } = useStore();
  const cartCount: number = Object.values(cart).reduce((a, b) => (a as number) + (b as number), 0) as number;

  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      if (settings.primary_color) root.style.setProperty('--aura-gold', settings.primary_color);
      if (settings.secondary_color) root.style.setProperty('--aura-ink', settings.secondary_color);
      
      const headingFont = settings.font_heading === 'serif' ? "'Playfair Display', serif" : 
                          settings.font_heading === 'mono' ? "'JetBrains Mono', monospace" : 
                          "'Inter', sans-serif";
      const bodyFont = settings.font_body === 'serif' ? "'Playfair Display', serif" : 
                       settings.font_body === 'mono' ? "'JetBrains Mono', monospace" : 
                       "'Inter', sans-serif";
      
      root.style.setProperty('--font-serif', headingFont);
      root.style.setProperty('--font-sans', bodyFont);
    }
  }, [settings]);

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-aura-paper selection:bg-aura-gold selection:text-white">
        <TopBar cartCount={cartCount} wishlistCount={wishlist.length} />
        
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/bonds" element={<BondsPage />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/help" element={<HelpSupport />} />
            <Route path="/admin-portal-secure-access" element={<Admin />} />
          </Routes>
        </main>

        <BottomNav />
        <Footer />
        <LiveChat />
      </div>
    </Router>
  );
}

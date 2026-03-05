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
  MessageCircle
} from 'lucide-react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useStore } from './store';
import { Product, CartItem, User, Order, Category, HomepageContent, Settings, Review } from './types';
import { signInWithGoogle, isFirebaseConfigured } from './firebaseConfig';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const TopBar = ({ cartCount, wishlistCount }: { cartCount: number; wishlistCount: number }) => {
  const { user } = useStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 h-20 z-50 flex items-center justify-between px-6 transition-all duration-500",
      isScrolled || !isHomePage ? "glass h-16" : "bg-transparent h-24"
    )}>
      <Link to="/" className={cn(
        "text-2xl font-serif font-bold tracking-[0.3em] transition-colors duration-500",
        !isScrolled && isHomePage ? "text-white" : "text-aura-ink"
      )}>
        ADORE
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/help" className={cn(
          "hidden md:block p-2 rounded-full transition-colors",
          !isScrolled && isHomePage ? "text-white hover:bg-white/10" : "text-aura-ink hover:bg-aura-gold/10"
        )}>
          <HelpCircle className="w-6 h-6" />
        </Link>
        <NotificationCenter />
        {user?.role === 'admin' && (
          <Link to="/admin-portal-secure-access" className={cn(
            "hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold transition-colors",
            !isScrolled && isHomePage ? "text-white/80 hover:text-white" : "text-aura-gold hover:text-aura-ink"
          )}>
            <LayoutDashboard className="w-4 h-4" />
            Admin Panel
          </Link>
        )}
        <Link to="/wishlist" className="relative">
          <Heart className={cn(
            "w-6 h-6 transition-colors duration-500",
            !isScrolled && isHomePage ? "text-white" : "text-aura-ink"
          )} />
          {wishlistCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-aura-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </Link>
        <Link to="/cart" className="relative">
          <ShoppingBag className={cn(
            "w-6 h-6 transition-colors duration-500",
            !isScrolled && isHomePage ? "text-white" : "text-aura-ink"
          )} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-aura-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      </div>
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

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product.id);
    navigate('/cart');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group cursor-pointer bg-white rounded-3xl p-4 border border-aura-ink/5 hover:border-aura-gold/20 transition-all hover:shadow-xl"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-aura-paper mb-4">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onToggleWishlist(product.id); }}
          className="absolute top-3 right-3 p-2 rounded-full glass hover:bg-white transition-colors z-10"
        >
          <Heart className={cn("w-4 h-4", isWishlisted ? "fill-red-500 text-red-500" : "text-aura-ink")} />
        </button>
      </div>
      <div className="space-y-1 mb-4">
        <h3 className="font-serif text-lg truncate">{product.name}</h3>
        <p className="text-aura-ink/40 text-[10px] uppercase tracking-widest">{product.category} • {product.subcategory}</p>
        <p className="font-medium text-aura-gold">{formatPrice(product.price)}</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); e.preventDefault(); onAddToCart(product.id); }}
          className="bg-aura-paper text-aura-ink py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-aura-ink hover:text-white transition-all border border-aura-ink/5"
        >
          Add to Bag
        </button>
        <button 
          onClick={handleBuyNow}
          className="bg-aura-ink text-white py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-aura-gold transition-all"
        >
          Buy Now
        </button>
      </div>
    </motion.div>
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
    .filter(item => item.active && (item.page === 'product' || item.page === 'all'))
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
    window.scrollTo(0, 0);
    fetchReviews();
  }, [id, fetchReviews]);

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
            <img src={product.image} className="w-full h-full object-cover" alt={product.name} referrerPolicy="no-referrer" />
          </div>
          {product.images && product.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((img, i) => (
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

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <button 
              onClick={() => addToCart(product.id)}
              className="flex-1 bg-aura-ink text-white py-5 rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-aura-gold transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <ShoppingBag className="w-5 h-5" /> Add to Bag
            </button>
            <button 
              onClick={() => toggleWishlist(product.id)}
              className={cn(
                "px-8 py-5 rounded-2xl border transition-all flex items-center justify-center gap-3",
                wishlist.includes(product.id) 
                  ? "bg-red-50 border-red-100 text-red-500" 
                  : "border-aura-ink/10 hover:bg-aura-paper"
              )}
            >
              <Heart className={cn("w-5 h-5", wishlist.includes(product.id) && "fill-current")} />
              {wishlist.includes(product.id) ? 'Wishlisted' : 'Wishlist'}
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

const ContentSection: React.FC<{ item: HomepageContent }> = ({ item }) => {
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
      className="mb-16"
    >
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
        <div className="bg-white rounded-[3rem] border border-aura-ink/5 shadow-sm overflow-hidden">
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
            {products
              .filter(p => p.category === item.subtitle || p.subcategory === item.subtitle)
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
          {/* If we have multiple trust items, we might want to handle them differently, 
              but for now let's assume one section can have multiple points in subtitle separated by | or something,
              or just render the single item as a highlight. 
              Let's make it a 3-column layout if it's a 'trust' type section.
          */}
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
    </motion.section>
  );
};

const Home = () => {
  const { products, settings, addToCart, toggleWishlist, wishlist, homepageContent, categories, location } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();
  
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
        image: settings?.hero_image || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1080&h=1920",
        title: settings?.hero_title || "Glow in Motion",
        subtitle: settings?.hero_subtitle || "New designs destined to become bestsellers",
        link: "/shop",
        buttonText: "Explore Now",
        buttonLink: "/shop",
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

  const mainCategories = categories.filter(c => c.type === 'category').slice(0, 8);
  
  return (
    <div className="pb-24 pt-0">
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
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 5, ease: "linear" }}
              src={heroSlides[currentSlide].image} 
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

        {/* Floating Shop by Colour Vertical Grid */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-4">
          {homepageContent
            .filter(item => item.type === 'color_grid' && item.active)
            .sort((a, b) => a.order_index - b.order_index)
            .slice(0, 5)
            .map(item => (
              <Link 
                key={item.id}
                to={item.link_url || `/shop?search=${item.title}`}
                className="group relative w-16 h-16 rounded-2xl overflow-hidden border border-white/20 hover:border-aura-gold transition-all shadow-2xl"
              >
                <img src={item.image_url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[8px] text-white font-bold uppercase tracking-widest bg-aura-gold/80 px-2 py-1 rounded">
                    {item.title}
                  </span>
                </div>
              </Link>
            ))}
        </div>

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

      <div className="px-4">
        {/* Dynamic Homepage Content */}
        {homepageContent
          .filter(item => item.type !== 'banner' && item.active && (item.page === 'home' || !item.page || item.page === 'all'))
          .sort((a, b) => a.order_index - b.order_index)
          .map(item => (
            <ContentSection key={item.id} item={item} />
          ))}

        {/* Categories Grid */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h2 className="text-2xl font-serif">Shop By Category</h2>
              <div className="h-1 w-12 bg-aura-gold mt-2 rounded-full" />
            </div>
            <Link to="/shop" className="text-[10px] font-bold text-aura-gold uppercase tracking-widest border-b border-aura-gold/20 pb-1 hover:border-aura-gold transition-all">View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {mainCategories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.name}`} className="group flex flex-col items-center gap-4">
                <div className="aspect-square w-full rounded-full bg-white overflow-hidden border border-aura-ink/5 shadow-sm group-hover:shadow-xl group-hover:border-aura-gold/20 transition-all duration-500 p-1">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img src={cat.image || `https://picsum.photos/seed/${cat.name}/400`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-aura-ink uppercase tracking-[0.2em] group-hover:text-aura-gold transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Luxury within Reach */}
        {homepageContent.some(item => item.type === 'luxury_grid' && item.active) && (
          <section className="mb-12">
            <h2 className="text-xl font-serif text-center mb-8">Luxury within Reach</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide aura-scroll-container">
              {homepageContent
                .filter(item => item.type === 'luxury_grid' && item.active)
                .sort((a, b) => a.order_index - b.order_index)
                .map(item => (
                  <Link 
                    key={item.id}
                    to={item.link_url || `/shop?maxPrice=${item.title}`}
                    className="flex-shrink-0 w-32 aspect-square bg-purple-100 rounded-3xl flex flex-col items-center justify-center border border-purple-200 aura-scroll-item"
                  >
                    <span className="text-[10px] font-bold text-purple-800 uppercase tracking-widest mb-1">{item.subtitle || 'Under'}</span>
                    <span className="text-2xl font-black text-purple-900">₹{item.title}</span>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* Best Sellers */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif italic">Best Sellers</h2>
            <Link to="/shop" className="text-[10px] font-bold text-aura-gold uppercase tracking-widest">Checkout Now</Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {products.slice(0, 4).map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
              />
            ))}
          </div>
          <button 
            onClick={() => navigate('/shop')}
            className="w-full mt-8 py-3 rounded-xl border border-aura-ink/10 text-xs font-bold uppercase tracking-widest hover:bg-aura-paper transition-colors"
          >
            View More
          </button>
        </section>

        {/* Shop by Colour */}
        {homepageContent.some(item => item.type === 'color_grid' && item.active) && (
          <section className="mb-12">
            <h2 className="text-xl font-serif text-center mb-8">Shop by Colour</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide aura-scroll-container">
              {homepageContent
                .filter(item => item.type === 'color_grid' && item.active)
                .sort((a, b) => a.order_index - b.order_index)
                .map(item => (
                  <Link 
                    key={item.id}
                    to={item.link_url || `/shop?search=${item.title}`}
                    className="flex-shrink-0 w-48 aspect-[3/4] rounded-3xl overflow-hidden relative aura-scroll-item group"
                  >
                    <img src={item.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-0 right-0 text-center">
                      <span className="text-white font-serif text-lg">{item.title}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        )}

        {/* Dynamic Homepage Content (Bottom) */}
        {homepageContent
          .filter(item => item.type !== 'banner' && item.active && item.page === 'home_bottom')
          .sort((a, b) => a.order_index - b.order_index)
          .map(item => (
            <ContentSection key={item.id} item={item} />
          ))}
      </div>
      <LiveChat />
    </div>
  );
};

const Shop = () => {
  const { products, addToCart, toggleWishlist, wishlist, categories, homepageContent } = useStore();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category');
  const subcategoryFilter = queryParams.get('subcategory');

  // Find content sections for shop page
  const shopContent = homepageContent
    .filter(item => item.active && (item.page === 'shop' || item.page === 'all'))
    .sort((a, b) => a.order_index - b.order_index);

  const mainCategories = useMemo(() => {
    const names = categories.filter(c => c.type === 'category').map(c => c.name);
    return ['All', ...Array.from(new Set(names))];
  }, [categories]);
  const subCategories = useMemo(() => {
    if (!categoryFilter) {
      const allSubNames = categories.filter(c => c.type === 'subcategory').map(c => c.name);
      return ['All', ...Array.from(new Set(allSubNames))];
    }
    const parent = categories.find(c => c.name === categoryFilter);
    if (!parent) return ['All'];
    const subNames = categories.filter(c => c.type === 'subcategory' && c.parent_id === parent.id).map(c => c.name);
    return ['All', ...Array.from(new Set(subNames))];
  }, [categories, categoryFilter]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (subcategoryFilter && p.subcategory !== subcategoryFilter) return false;
      return true;
    });
  }, [products, categoryFilter, subcategoryFilter]);

  return (
    <div className="pb-24 pt-24 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-5xl font-serif mb-4">Our Collection</h1>
            <div className="flex items-center gap-3">
              <span className="w-8 h-[1px] bg-aura-gold"></span>
              <p className="text-aura-ink/60 tracking-[0.2em] uppercase text-[10px] font-bold">
                {categoryFilter ? `${categoryFilter} Jewellery` : 'Exquisite Masterpieces'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide aura-scroll-container">
            {mainCategories.map(cat => (
              <Link 
                key={cat}
                to={cat === 'All' ? '/shop' : `/shop?category=${cat}`}
                className={cn(
                  "px-8 py-3 rounded-2xl border text-[10px] uppercase tracking-[0.2em] font-bold transition-all whitespace-nowrap aura-scroll-item",
                  (cat === 'All' && !categoryFilter) || categoryFilter === cat
                    ? "bg-aura-ink text-white border-aura-ink shadow-xl"
                    : "bg-white border-aura-ink/5 hover:border-aura-gold text-aura-ink/60"
                )}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Subcategories Section */}
        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-aura-ink/5">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide px-2 aura-scroll-container !pb-0">
            <span className="text-[9px] uppercase tracking-widest font-black text-aura-gold/40 whitespace-nowrap">Filter by:</span>
            {subCategories.map(sub => (
              <Link 
                key={sub}
                to={sub === 'All' 
                  ? (categoryFilter ? `/shop?category=${categoryFilter}` : '/shop') 
                  : (categoryFilter ? `/shop?category=${categoryFilter}&subcategory=${sub}` : `/shop?subcategory=${sub}`)
                }
                className={cn(
                  "px-5 py-2 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all whitespace-nowrap aura-scroll-item",
                  (sub === 'All' && !subcategoryFilter) || subcategoryFilter === sub
                    ? "bg-aura-gold text-white shadow-lg"
                    : "text-aura-ink/40 hover:text-aura-gold hover:bg-aura-gold/5"
                )}
              >
                {sub}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Shop Page Content Sections */}
      {shopContent.length > 0 && (
        <div className="mb-12">
          {shopContent.map(item => (
            <ContentSection key={item.id} item={item} />
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
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
    phone: user?.phone || '',
    paymentMethod: 'Razorpay'
  });

  const cartItems = useMemo(() => {
    return Object.entries(cart).map(([id, quantity]) => {
      const product = products.find(p => p.id === id);
      return product ? { ...product, quantity } : null;
    }).filter(Boolean) as CartItem[];
  }, [cart, products]);

  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
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
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          items: cartItems.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
          total,
          shipping,
          payment_status: 'pending'
        })
      });

      if (!orderRes.ok) throw new Error('Failed to create order');
      const { orderId } = await orderRes.json();

      if (shipping.paymentMethod === 'COD') {
        alert('Order placed successfully with Cash on Delivery!');
        clearCart();
        navigate('/profile');
        return;
      }

      // 2. Create Razorpay order
      const rzpOrderRes = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });

      if (!rzpOrderRes.ok) {
        const errorData = await rzpOrderRes.json();
        throw new Error(errorData.error || 'Online payment is currently unavailable. Please try Cash on Delivery or contact support.');
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
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
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
    } finally {
      setIsProcessingPayment(false);
    }
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
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
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
                  <div className="flex justify-between text-xl font-serif mb-6">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
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
                <div className="flex justify-between text-xl font-serif mb-8">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
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
                        {notif.image && <img src={notif.image} className="w-12 h-12 rounded-lg object-cover" />}
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
  const { user, login, logout, loginAsGuest, updateUser } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLogin, setIsLogin] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ email: '', name: '', phone: '', address: '', city: '', pincode: '' });
  const [editFormData, setEditFormData] = useState({ name: '', phone: '', address: '', city: '', pincode: '' });
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetch('/api/orders', {
        headers: { 'x-user-id': user.id }
      }).then(res => {
        if (!res.ok) return [];
        return res.json();
      }).then(data => {
        if (Array.isArray(data)) {
          setOrders(data.filter((o: any) => o.user_id === user.id));
        }
      }).catch(err => {
        console.error("Failed to fetch orders:", err);
      });
      setEditFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || ''
      });
    }
  }, [user]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const firebaseUser = await signInWithGoogle();
      if (firebaseUser) {
        const result = await login({
          id: 'google_' + firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'User',
          phone: firebaseUser.phoneNumber || null
        });
        if (!result.success) {
          setError(result.error || 'Authentication failed');
        }
      }
    } catch (error: any) {
      console.error("Firebase Login Error", error);
      setError(error.message || "Failed to login with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    await updateUser(editFormData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  if (!user) {
    return (
      <div className="pb-24 pt-24 px-6 max-w-md mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif mb-4">Welcome to Adore</h1>
          <p className="text-aura-ink/60">Join our exclusive circle of luxury.</p>
        </div>
        
        <div className="space-y-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-xs font-medium flex items-center gap-3"
            >
              <X className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
          <div className="grid grid-cols-1 gap-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-aura-ink/10 rounded-xl px-4 py-4 flex items-center justify-center gap-3 hover:bg-aura-paper transition-colors shadow-sm disabled:opacity-50"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              <span className="text-sm font-semibold">
                {loading ? 'Connecting...' : !isFirebaseConfigured ? 'Login with Google (Demo Mode)' : 'Login with Google'}
              </span>
            </button>
            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-aura-ink/5"></div></div>
              <span className="relative bg-aura-paper px-4 text-[10px] uppercase tracking-widest text-aura-ink/40 font-bold">or use mobile</span>
            </div>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your name"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Mobile Number</label>
              <input 
                type="tel" 
                className="w-full bg-white border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 00000 00000"
              />
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
                const email = formData.phone + '@adore.com';
                const result = await login({ 
                  id: 'u_' + Math.random().toString(36).substr(2, 9), 
                  ...formData, 
                  email
                });
                setLoading(false);
                if (!result.success) {
                  setError(result.error || 'Authentication failed');
                }
              }}
              disabled={loading}
              className="w-full bg-aura-ink text-white py-4 rounded-xl text-sm font-semibold uppercase tracking-widest hover:bg-aura-gold transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In with Mobile' : 'Create Account')}
            </button>

            <div className="relative flex items-center justify-center py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-aura-ink/5"></div></div>
              <span className="relative bg-aura-paper px-4 text-[10px] uppercase tracking-widest text-aura-ink/40 font-bold">or</span>
            </div>

            <button 
              onClick={() => loginAsGuest()}
              className="w-full bg-white border border-aura-ink/10 rounded-xl px-4 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-aura-paper transition-colors shadow-sm"
            >
              Continue as Guest
            </button>
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-aura-ink/60 text-[10px] uppercase tracking-widest font-bold hover:text-aura-gold"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-28 px-4 md:px-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 mb-12">
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-4 mb-2">
            <h1 className="text-3xl md:text-4xl font-serif">Hello, {user.name}</h1>
            {user.role === 'admin' && (
              <span className="bg-aura-gold/10 text-aura-gold text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-aura-gold/20">
                Administrator
              </span>
            )}
          </div>
          <p className="text-aura-ink/60 text-sm">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 border border-aura-ink/10 px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-white transition-all shadow-sm"
            >
              <UserIcon className="w-4 h-4" />
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
            {user.role === 'admin' && (
              <Link 
                to="/admin-portal-secure-access" 
                className="inline-flex items-center gap-2 bg-aura-gold text-white px-6 py-3 rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-aura-ink transition-all shadow-lg"
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
            <button onClick={logout} className="p-3 bg-white border border-aura-ink/5 rounded-xl text-aura-ink/40 hover:text-red-500 transition-colors shadow-sm">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-3xl border border-aura-ink/5 mb-12"
          >
            <h2 className="text-2xl font-serif mb-8">Edit Your Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
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
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Address</label>
                  <input 
                    type="text" 
                    className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                    value={editFormData.address}
                    onChange={e => setEditFormData({ ...editFormData, address: e.target.value })}
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
              className="mt-8 bg-aura-ink text-white px-10 py-4 rounded-xl text-sm font-semibold uppercase tracking-widest hover:bg-aura-gold transition-colors"
            >
              Save Changes
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section>
              <h2 className="text-2xl font-serif mb-6">Recent Orders</h2>
              {orders.length === 0 ? (
                <p className="text-aura-ink/40 italic">No orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white p-6 rounded-2xl border border-aura-ink/5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold mb-1">Order #{order.id.slice(-6)}</p>
                          <p className="text-xs text-aura-ink/40">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-aura-paper rounded-full">{order.status}</span>
                      </div>
                      <p className="text-lg font-serif mb-4">{formatPrice(order.total)}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-aura-ink/60 leading-relaxed">
                          <p className="font-bold uppercase mb-1">Shipping to:</p>
                          <p>{order.shipping_address}, {order.shipping_city} - {order.shipping_pincode}</p>
                        </div>
                        <Link 
                          to={`/track-order?orderId=${order.id}`}
                          className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-aura-gold hover:text-aura-ink transition-colors"
                        >
                          <Truck className="w-4 h-4" />
                          Track Order
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-6">Account Details</h2>
              <div className="bg-white p-8 rounded-3xl border border-aura-ink/5 space-y-6">
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold mb-1">Mobile</p>
                  <p className="text-sm">{user.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-aura-gold mb-1">Address</p>
                  <p className="text-sm leading-relaxed">
                    {user.address ? (
                      <>
                        {user.address}<br />
                        {user.city} - {user.pincode}
                      </>
                    ) : 'No address saved.'}
                  </p>
                </div>
              </div>
            </section>
          </div>
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

const Admin = () => {
  const { products, settings, user, refreshProducts, refreshSettings, categories, refreshCategories, homepageContent, refreshHomepageContent, setHomepageContent, setCategories, deleteOrder, deleteCategory, deleteHomepageContent } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'users' | 'activity' | 'notifications' | 'settings' | 'categories' | 'homepage'>('overview');
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingHomepage, setEditingHomepage] = useState<Partial<HomepageContent> | null>(null);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [cmsSettings, setCmsSettings] = useState<Partial<Settings>>({});
  const [userFilter, setUserFilter] = useState<string | null>(null);
  const [notifData, setNotifData] = useState({ title: '', message: '', image: '', targetUserId: '' });

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const headers = { 'x-user-id': user.id };
      const [ordersRes, usersRes, activityRes, statsRes] = await Promise.all([
        fetch('/api/orders', { headers }).then(res => res.ok ? res.json() : Promise.reject("Orders failed")),
        fetch('/api/users', { headers }).then(res => res.ok ? res.json() : Promise.reject("Users failed")),
        fetch('/api/activity', { headers }).then(res => res.ok ? res.json() : Promise.reject("Activity failed")),
        fetch('/api/admin/stats', { headers }).then(res => res.ok ? res.json() : Promise.reject("Stats failed"))
      ]);
      setAllOrders(ordersRes);
      setAllUsers(usersRes);
      setActivities(activityRes);
      setStats(statsRes);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setError("Failed to load dashboard data. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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
    await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ status, tracking_id, tracking_status })
    });
    fetchData();
  };

  const handleUpdatePaymentStatus = async (orderId: string, payment_status: string) => {
    if (!user) return;
    if (!confirm(`Are you sure you want to mark this order as ${payment_status}?`)) return;
    await fetch(`/api/orders/${orderId}/payment-status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({ payment_status })
    });
    fetchData();
  };

  const handleSaveProduct = async (data: Partial<Product>) => {
    if (!user) return;
    const method = data.id ? 'PUT' : 'POST';
    const url = data.id ? `/api/products/${data.id}` : '/api/products';
    
    const payload = data.id ? data : { ...data, id: 'p_' + Math.random().toString(36).substr(2, 9) };

    await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
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
        'x-user-id': user.id
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
          'x-user-id': user.id
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
    const method = editingUser.id ? 'PUT' : 'POST';
    const url = editingUser.id ? `/api/users/${editingUser.id}` : '/api/users/login'; // Using login for creation as it handles registration
    
    const payload = editingUser.id ? editingUser : { ...editingUser, id: 'u_' + Math.random().toString(36).substr(2, 9) };

    await fetch(url, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify(payload)
    });
    setEditingUser(null);
    fetchData();
  };

  const handleSaveSettings = async () => {
    if (!user) return;
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
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

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?') || !user) return;
    await fetch(`/api/products/${id}`, { 
      method: 'DELETE',
      headers: { 'x-user-id': user.id }
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
        headers: { 'x-user-id': user.id }
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
        headers: { 'x-user-id': user.id }
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
        'x-user-id': user.id
      },
      body: JSON.stringify({ role })
    });
    fetchData();
  };

  const handleSendNotification = async () => {
    if (!user) return;
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
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
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) callback(data.imageUrl);
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
                            <p className="text-sm font-bold">{formatPrice(order.total)}</p>
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
                      <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-aura-ink rounded-lg text-[8px] uppercase font-bold shadow-sm">
                        #{item.order_index}
                      </span>
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
                            <p className="text-sm font-medium">{formatPrice(order.total)}</p>
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
              <table className="w-full text-left">
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
                        <p className="text-sm font-medium">{formatPrice(order.total)}</p>
                        <div className="mt-1 space-y-1">
                          <p className={cn(
                            "text-[8px] uppercase tracking-widest font-bold px-2 py-0.5 rounded inline-block",
                            order.payment_status === 'paid' ? "bg-green-100 text-green-700" : 
                            order.payment_status === 'failed' ? "bg-red-100 text-red-700" : "bg-aura-gold/10 text-aura-gold"
                          )}>
                            {order.payment_method} • {order.payment_status}
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
                              order.payment_status === 'failed' ? "bg-red-100 text-red-700" : "bg-aura-gold/10 text-aura-gold"
                            )}>
                              {order.payment_status}
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
                  <img src={p.image} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-serif text-lg">{p.name}</h3>
                    <p className="text-xs text-aura-ink/40 mb-2">{p.category} • {p.subcategory}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-aura-gold">{formatPrice(p.price)}</span>
                      <div className="flex gap-3">
                        <button onClick={() => setEditingProduct(p)} className="text-xs uppercase tracking-widest font-semibold hover:text-aura-gold">Edit</button>
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
              <table className="w-full text-left">
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
                    <tr key={u.id}>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{u.name}</p>
                        <p className="text-[10px] text-aura-ink/40">{u.email}</p>
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
              <table className="w-full text-left">
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
                      <input 
                        type="text" 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold"
                        value={editingProduct.image || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        placeholder="Main thumbnail URL"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] uppercase tracking-widest font-bold text-aura-ink/40 mb-1">Additional Images (comma separated)</label>
                      <textarea 
                        className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold h-20"
                        value={editingProduct.images?.join(', ') || ''}
                        onChange={e => setEditingProduct({ ...editingProduct, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                        placeholder="image1.jpg, image2.jpg, image3.jpg"
                      />
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
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const dataRes = await res.json();
    if (dataRes.success) setData({ ...data, image: dataRes.imageUrl });
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await res.json();
      if (result.success) setData({ ...data, image_url: result.imageUrl });
    } catch (err) {
      console.error("Upload failed", err);
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
                <option value="section">Content Section</option>
                <option value="collection">Collection Highlight</option>
                <option value="promo">Promo Strip</option>
                <option value="gifting">Gifting Section</option>
                <option value="loyalty">Offers & Loyalty</option>
                <option value="trust">Trust & Certification</option>
                <option value="color_grid">Shop by Colour Grid</option>
                <option value="luxury_grid">Luxury within Reach Grid</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Graphic Placement (Layout)</label>
              <select className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.layout || 'right'} onChange={e => setData({ ...data, layout: e.target.value as any })}>
                <option value="right">Right Side (Image Right)</option>
                <option value="left">Left Side (Image Left)</option>
                <option value="background">Full Background (Text Overlay)</option>
                <option value="top">Top (Image Below Text)</option>
              </select>
              <p className="text-[8px] text-aura-ink/40 mt-1 uppercase font-bold tracking-widest">Controls where the image appears relative to text.</p>
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
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Button Text</label>
              <input type="text" className="w-full bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.button_text || ''} onChange={e => setData({ ...data, button_text: e.target.value })} placeholder="e.g. Shop Now" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Image</label>
              <div className="flex gap-2">
                <input type="text" className="flex-1 bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 outline-none focus:border-aura-gold" value={data.image_url || ''} onChange={e => setData({ ...data, image_url: e.target.value })} placeholder="URL or Upload" />
                <label className="bg-aura-paper border border-aura-ink/10 rounded-xl px-4 py-3 cursor-pointer hover:bg-aura-gold/10 transition-colors">
                  <Upload className={cn("w-5 h-5", isUploading && "animate-bounce")} />
                  <input type="file" className="hidden" onChange={handleUpload} accept="image/*" />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Section Link (Screen or URL)</label>
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
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Button Link (Screen or URL)</label>
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
    <footer className="bg-white border-t border-aura-ink/5 pt-16 pb-32 px-8">
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
      <div className="min-h-screen bg-aura-paper selection:bg-aura-gold selection:text-white">
        <TopBar cartCount={cartCount} wishlistCount={wishlist.length} />
        
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
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

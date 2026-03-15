import { useState, useEffect } from 'react';
import { Product, Settings, User, Category, HomepageContent, Coupon } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function safeJson<T>(promise: Promise<Response>): Promise<T | null> {
  return promise
    .then(res => {
      if (!res.ok) return null;
      return res.json() as Promise<T>;
    })
    .catch(() => null);
}

function getStoredToken(): string | null {
  return localStorage.getItem('aura_token');
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─────────────────────────────────────────────────────────────────────────────
// Store
// ─────────────────────────────────────────────────────────────────────────────

export const useStore = () => {
  const [products,        setProducts]        = useState<Product[]>([]);
  const [categories,      setCategories]      = useState<Category[]>([]);
  const [homepageContent, setHomepageContent] = useState<HomepageContent[]>([]);
  const [coupons,         setCoupons]         = useState<Coupon[]>([]);
  const [settings,        setSettings]        = useState<Settings | null>(null);
  const [notifications,   setNotifications]   = useState<any[]>([]);
  const [addresses,       setAddresses]       = useState<any[]>([]);
  const [orderHistory,    setOrderHistory]    = useState<any[]>([]);
  const [location,        setLocation]        = useState<{ country: string; city: string } | null>(null);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('aura_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('aura_token');
  });

  const [cart, setCart] = useState<{ [id: string]: number }>(() => {
    try {
      const saved = localStorage.getItem('aura_cart');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('aura_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // ── Track user id to avoid re-running effects on object identity change ──
  const userId   = user?.id ?? null;
  const userRole = user?.role ?? null;

  // ── Fetch static app data once on mount ──────────────────────────────────
  // Does NOT depend on user — prevents the fetchData → user change → re-fetch
  // → firebase popup destroyed cycle.
  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(d => Array.isArray(d) && setProducts(d.map(normalizeProduct)))
      .catch(() => {});
    fetch('/api/categories')
      .then(r => r.json()).then(d => Array.isArray(d) && setCategories(d)).catch(() => {});
    fetch('/api/homepage-content')
      .then(r => r.json()).then(d => Array.isArray(d) && setHomepageContent(d)).catch(() => {});
    fetch('/api/coupons')
      .then(r => r.json()).then(d => Array.isArray(d) && setCoupons(d)).catch(() => {});
    fetch('/api/settings')
      .then(r => r.json()).then(d => d && typeof d === 'object' && setSettings(d)).catch(() => {});
    fetch('/api/location')
      .then(r => r.json()).then(d => d?.country && setLocation(d))
      .catch(() => setLocation({ country: 'India', city: 'Mumbai' }));
    // Refresh user data from DB on startup — ensures role is always fresh
    // (handles case where role changed in DB but localStorage has stale data)
    const _t = localStorage.getItem('aura_token');
    if (_t) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${_t}` } })
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.success && data.user) { setUser(data.user); setToken(_t); } })
        .catch(() => {});
    }
  }, []); // ← Empty array: runs once, never re-runs on user change

  // ── Fetch user-specific data only when userId changes ────────────────────
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      return;
    }
    // Use userId (primitive string) as dependency — stable across re-renders
    fetch(`/api/notifications/${userId}`, { headers: authHeaders() })
      .then(r => { if (r.ok) return r.json(); return []; })
      .then(d => Array.isArray(d) && setNotifications(d))
      .catch(() => {});
  }, [userId]); // ← Only re-runs when userId string changes

  // ── WebSocket for real-time updates ──────────────────────────────────────
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let ws: WebSocket;
    try {
      ws = new WebSocket(`${protocol}//${window.location.host}`);
    } catch { return; }

    ws.onerror = () => {};
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case 'PRODUCTS_UPDATED':
            fetch('/api/products').then(r => r.json()).then(d => Array.isArray(d) && setProducts(d.map(normalizeProduct))).catch(() => {});
            break;
          case 'CATEGORIES_UPDATED':
            fetch('/api/categories').then(r => r.json()).then(d => Array.isArray(d) && setCategories(d)).catch(() => {});
            break;
          case 'HOMEPAGE_UPDATED':
            fetch('/api/homepage-content').then(r => r.json()).then(d => Array.isArray(d) && setHomepageContent(d)).catch(() => {});
            break;
          case 'COUPONS_UPDATED':
            fetch('/api/coupons').then(r => r.json()).then(d => Array.isArray(d) && setCoupons(d)).catch(() => {});
            break;
          case 'SETTINGS_UPDATED':
            fetch('/api/settings').then(r => r.json()).then(d => d && setSettings(d)).catch(() => {});
            break;
          case 'NOTIFICATIONS_UPDATED':
            if (userId && (!data.targetUserId || data.targetUserId === userId)) {
              fetch(`/api/notifications/${userId}`, { headers: authHeaders() })
                .then(r => r.ok ? r.json() : [])
                .then(d => Array.isArray(d) && setNotifications(d))
                .catch(() => {});
            }
            break;
        }
      } catch {}
    };

    return () => { try { ws.close(); } catch {} };
  }, []); // ← Runs once — WS connection persists for app lifetime

  // ── Persist to localStorage ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('aura_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aura_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aura_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('aura_token', token);
    } else {
      localStorage.removeItem('aura_token');
    }
  }, [token]);

  // ─────────────────────────────────────────────────────────────────────────
  // Cart / Wishlist actions
  // ─────────────────────────────────────────────────────────────────────────

  const addToCart = (productId: string, size?: string) => {
    const key = size ? `${productId}_${size}` : productId;
    setCart(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const removeFromCart = (key: string) => {
    setCart(prev => { const c = { ...prev }; delete c[key]; return c; });
  };

  const updateCartQuantity = (key: string, qty: number) => {
    setCart(prev => ({ ...prev, [key]: Math.max(0, qty) }));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('aura_cart');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Auth actions
  // ─────────────────────────────────────────────────────────────────────────

  const login = async (
    userData: Partial<User> & {
      identifier?: string;
      password?: string;
      _preAuthenticated?: boolean;
      _token?: string;
    }
  ) => {
    // Pre-authenticated shortcut: Google/Phone flows already have user + token
    if ((userData as any)._preAuthenticated) {
      const { _preAuthenticated, _token, ...u } = userData as any;
      setUser(u as User);
      setToken(_token ?? null);
      return { success: true };
    }

    try {
      const { identifier, password, ...rest } = userData as any;
      const body =
        identifier !== undefined
          ? { identifier, password }
          : { identifier: rest.email ?? rest.phone, password: rest.password, ...rest };

      const res  = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setToken(data.token);
      }
      return data;
    } catch (err: any) {
      return { success: false, message: err.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setOrderHistory([]);
    setAddresses([]);
    setNotifications([]);
  };

  const loginAsGuest = () => {
    setUser({
      id:         'guest_' + Math.random().toString(36).substr(2, 9),
      name:       'Guest User',
      email:      'guest@adore.com',
      role:       'user',
      created_at: new Date().toISOString(),
    });
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user || !token) return;
    try {
      const res  = await fetch(`/api/users/${user.id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success) setUser(data.user);
    } catch {}
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Order / Address / Notification actions
  // ─────────────────────────────────────────────────────────────────────────

  const getOrderHistory = async () => {
    if (!userId || !token) return [];
    try {
      const res  = await fetch(`/api/orders/user/${userId}`, { headers: authHeaders() });
      const data = res.ok ? await res.json() : [];
      const rows = Array.isArray(data) ? data : [];
      setOrderHistory(rows);
      return rows;
    } catch {
      setOrderHistory([]);
      return [];
    }
  };

  const getAddresses = async () => {
    if (!userId || !token) return [];
    try {
      const res  = await fetch(`/api/addresses/${userId}`, { headers: authHeaders() });
      const data = res.ok ? await res.json() : [];
      const rows = Array.isArray(data) ? data : [];
      setAddresses(rows);
      return rows;
    } catch {
      setAddresses([]);
      return [];
    }
  };

  const addAddress = async (addressData: any) => {
    if (!userId || !token) return;
    try {
      const res  = await fetch('/api/addresses', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body:    JSON.stringify({ ...addressData, userId }),
      });
      const data = await res.json();
      if (data.success) await getAddresses();
      return data;
    } catch {}
  };

  const deleteAddress = async (addressId: string) => {
    if (!token) return;
    try {
      const res  = await fetch(`/api/addresses/${addressId}`, {
        method: 'DELETE', headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) await getAddresses();
      return data;
    } catch {}
  };

  const setDefaultAddress = async (addressId: string) => {
    if (!token) return;
    try {
      const res  = await fetch(`/api/addresses/${addressId}/default`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
      });
      const data = await res.json();
      if (data.success) await getAddresses();
      return data;
    } catch {}
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Admin / refresh actions
  // ─────────────────────────────────────────────────────────────────────────

  const refreshProducts       = () => fetch('/api/products').then(r => r.json()).then(d => Array.isArray(d) && setProducts(d.map(normalizeProduct))).catch(() => {});
  const refreshSettings       = () => fetch('/api/settings').then(r => r.json()).then(d => d && setSettings(d)).catch(() => {});
  const refreshCategories     = () => fetch('/api/categories').then(r => r.json()).then(d => Array.isArray(d) && setCategories(d)).catch(() => {});
  const refreshHomepageContent= () => fetch('/api/homepage-content').then(r => r.json()).then(d => Array.isArray(d) && setHomepageContent(d)).catch(() => {});
  const refreshCoupons        = () => fetch('/api/coupons').then(r => r.json()).then(d => Array.isArray(d) && setCoupons(d)).catch(() => {});
  const refreshNotifications  = () => {
    if (!userId) return;
    fetch(`/api/notifications/${userId}`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : []).then(d => Array.isArray(d) && setNotifications(d)).catch(() => {});
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!token) return;
    try {
      await fetch('/api/notifications/read', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body:    JSON.stringify({ notificationId }),
      });
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n));
    } catch {}
  };

  const deleteCategory = async (id: string) => {
    if (!token) return;
    try {
      const res  = await fetch(`/api/categories/${id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (data.success) await refreshCategories();
      return data;
    } catch {}
  };

  const deleteHomepageContent = async (id: string) => {
    if (!token) return;
    try {
      const res  = await fetch(`/api/homepage-content/${id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json();
      if (data.success) await refreshHomepageContent();
      return data;
    } catch {}
  };

  const deleteOrder = async (orderId: string) => {
    if (!token) return;
    try {
      const res  = await fetch(`/api/orders/${orderId}`, { method: 'DELETE', headers: authHeaders() });
      return await res.json();
    } catch {}
  };

  const getCoupon = async (code: string) => {
    try {
      const res = await fetch(`/api/coupons/${code}`);
      if (!res.ok) return null;
      const data = await res.json();
      return data.coupon || data;
    } catch { return null; }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return {
    // State
    products, categories, homepageContent, settings, user, token,
    cart, wishlist, notifications, addresses, orderHistory, location, coupons,

    // Cart
    addToCart, removeFromCart, updateCartQuantity, toggleWishlist, clearCart,

    // Auth
    login, logout, loginAsGuest, updateUser,

    // User data
    getOrderHistory, getAddresses, addAddress, deleteAddress, setDefaultAddress,
    getCoupon,

    // Notifications
    markNotificationAsRead, refreshNotifications,

    // Admin / refresh
    refreshProducts, refreshSettings, refreshCategories,
    refreshHomepageContent, refreshCoupons,
    deleteCategory, deleteHomepageContent, deleteOrder,

    // Direct setters used by Admin component
    setHomepageContent, setCategories,
  };
};

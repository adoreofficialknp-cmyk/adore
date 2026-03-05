import { useState, useEffect, useCallback } from 'react';
import { Product, Settings, User, Category, HomepageContent } from './types';

export const useStore = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageContent, setHomepageContent] = useState<HomepageContent[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aura_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState<{ [id: string]: number }>(() => {
    const saved = localStorage.getItem('aura_cart');
    return saved ? JSON.parse(saved) : {};
  });
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('aura_wishlist');
    return saved ? JSON.parse(saved) : [];
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [location, setLocation] = useState<{ country: string, city: string } | null>(null);

  const fetchData = useCallback(() => {
    fetch('/api/products').then(res => res.json()).then(setProducts);
    fetch('/api/categories').then(res => res.json()).then(setCategories);
    fetch('/api/homepage-content').then(res => res.json()).then(setHomepageContent);
    fetch('/api/settings').then(res => res.json()).then(setSettings);
    fetch('/api/location').then(res => res.json()).then(setLocation).catch(() => setLocation({ country: 'India', city: 'Mumbai' }));
  }, []);

  useEffect(() => {
    fetchData();

    // WebSocket for real-time updates
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'PRODUCTS_UPDATED':
          fetch('/api/products').then(res => res.json()).then(setProducts);
          break;
        case 'CATEGORIES_UPDATED':
          fetch('/api/categories').then(res => res.json()).then(setCategories);
          break;
        case 'HOMEPAGE_UPDATED':
          fetch('/api/homepage-content').then(res => res.json()).then(setHomepageContent);
          break;
        case 'SETTINGS_UPDATED':
          fetch('/api/settings').then(res => res.json()).then(setSettings);
          break;
        case 'NOTIFICATIONS_UPDATED':
          if (user && (!data.targetUserId || data.targetUserId === user.id)) {
            fetch(`/api/notifications/${user.id}`).then(res => res.json()).then(setNotifications);
          }
          break;
      }
    };

    return () => ws.close();
  }, [fetchData, user?.id]);

  useEffect(() => {
    if (user) {
      fetch(`/api/notifications/${user.id}`).then(res => res.json()).then(setNotifications);
    }
  }, [user]);

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

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      delete newCart[productId];
      return newCart;
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity)
    }));
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const login = async (userData: Partial<User>) => {
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
    }
    return data;
  };

  const logout = () => setUser(null);

  const clearCart = () => {
    setCart({});
    localStorage.removeItem('aura_cart');
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      id: 'guest_' + Math.random().toString(36).substr(2, 9),
      name: 'Guest User',
      email: 'guest@adore.com',
      role: 'user',
      created_at: new Date().toISOString()
    };
    setUser(guestUser);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    const res = await fetch(`/api/users/${user.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
    }
  };

  return {
    products,
    categories,
    homepageContent,
    settings,
    user,
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    login,
    logout,
    clearCart,
    loginAsGuest,
    updateUser,
    notifications,
    markNotificationAsRead: async (notificationId: string) => {
      if (!user) return;
      await fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, notificationId })
      });
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: 1 } : n));
    },
    refreshNotifications: () => {
      if (user) fetch(`/api/notifications/${user.id}`).then(res => res.json()).then(setNotifications);
    },
    refreshProducts: () => fetch('/api/products').then(res => res.json()).then(setProducts),
    refreshSettings: () => fetch('/api/settings').then(res => res.json()).then(setSettings),
    refreshCategories: () => fetch('/api/categories').then(res => res.json()).then(setCategories),
    refreshHomepageContent: () => fetch('/api/homepage-content').then(res => res.json()).then(setHomepageContent),
    deleteCategory: async (id: string) => {
      if (!user || user.role !== 'admin') return;
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      });
      const data = await res.json();
      if (data.success) fetch('/api/categories').then(res => res.json()).then(setCategories);
      return data;
    },
    deleteHomepageContent: async (id: string) => {
      if (!user || user.role !== 'admin') return;
      const res = await fetch(`/api/homepage-content/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      });
      const data = await res.json();
      if (data.success) fetch('/api/homepage-content').then(res => res.json()).then(setHomepageContent);
      return data;
    },
    deleteOrder: async (orderId: string) => {
      if (!user || user.role !== 'admin') return;
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.id }
      });
      return await res.json();
    },
    location,
    setHomepageContent,
    setCategories
  };
};

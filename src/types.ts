export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  image: string;
  images?: string[];
  video?: string;
  stock: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'category' | 'subcategory';
  parent_id: string | null;
  image?: string;
}

export interface HomepageContent {
  id: string;
  type: 'banner' | 'section' | 'collection' | 'promo' | 'loyalty' | 'trust' | 'gifting' | 'color_grid' | 'luxury_grid';
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  button_text?: string;
  button_link?: string;
  layout?: 'left' | 'right' | 'background' | 'top';
  page?: string;
  order_index: number;
  active: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface Order {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  tracking_id?: string;
  tracking_status?: string;
  payment_status: 'pending' | 'paid' | 'failed';
  razorpay_order_id?: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_pincode: string;
  shipping_phone: string;
  payment_method: string;
  created_at: string;
}

export interface Settings {
  theme_color: string;
  accent_color: string;
  hero_title: string;
  hero_subtitle: string;
  brand_story?: string;
  gifting_title?: string;
  gifting_subtitle?: string;
  category_grid_format?: 'circle' | 'rectangle' | 'square';
  social_linkedin?: string;
  social_instagram?: string;
  social_whatsapp?: string;
  social_facebook?: string;
  link_privacy_policy?: string;
  link_terms_conditions?: string;
  color_selection?: { name: string; color: string; image: string }[];
  luxury_prices?: number[];
  [key: string]: any;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

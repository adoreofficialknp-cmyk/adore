export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

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
  color?: string;
  stock: number;
  bond?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: any[];
  total: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_id?: string;
  address: any;
  createdAt: string;
}

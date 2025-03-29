export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  inventory: number;
  sizes: string[];
  inventory_status: 'out_of_stock' | 'low_stock' | 'in_stock';
  category_id: string;
  is_virtual: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image_url: string;
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

export interface Order {
  id: number;
  stripe_session_id: string;
  customer_email: string | null;
  amount_total: number;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}
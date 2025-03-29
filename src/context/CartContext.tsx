import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { CartItem, Product } from '../types/store';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product & { selectedSize?: string }) => void;
  removeFromCart: (item: CartItem) => void;
  updateQuantity: (item: CartItem, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product & { selectedSize?: string }) => {
    setCart(currentCart => {
      const existingItemIndex = currentCart.findIndex(item => 
        item.id === product.id && item.selectedSize === product.selectedSize
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const newCart = [...currentCart];
        newCart[existingItemIndex].quantity += 1;
        
        // Show success toast
        toast.success(`Added another ${product.name} to cart`, {
          icon: '🛒',
          duration: 2000,
          position: 'bottom-right',
          style: {
            background: '#1A103C',
            color: '#fff',
            border: '1px solid #2D1B69'
          }
        });
        
        return newCart;
      }

      // Add new item
      toast.success(`Added ${product.name} to cart`, {
        icon: '🛒',
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#1A103C',
          color: '#fff',
          border: '1px solid #2D1B69'
        }
      });
      
      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (item: CartItem) => {
    setCart(currentCart => {
      const newCart = currentCart.filter(cartItem => 
        !(cartItem.id === item.id && cartItem.selectedSize === item.selectedSize)
      );
      
      // Show removed toast
      toast.success(`Removed ${item.name} from cart`, {
        icon: '🗑️',
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#1A103C',
          color: '#fff',
          border: '1px solid #2D1B69'
        }
      });
      
      return newCart;
    });
  };

  const updateQuantity = (item: CartItem, quantity: number) => {
    setCart(currentCart => {
      if (quantity <= 0) {
        return currentCart.filter(cartItem => 
          !(cartItem.id === item.id && cartItem.selectedSize === item.selectedSize)
        );
      }

      return currentCart.map(cartItem =>
        cartItem.id === item.id && cartItem.selectedSize === item.selectedSize
          ? { ...cartItem, quantity }
          : cartItem
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = cart.reduce(
    (total, item) => total + (item.price * item.quantity), 
    0
  );

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
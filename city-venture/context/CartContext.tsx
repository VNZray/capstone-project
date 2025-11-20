// See FRONTEND_IMPLEMENTATION.md - State Management

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Product } from '@/types/Product';

export interface CartItem {
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  special_requests?: string;
  stock: number;
  is_unavailable: boolean;
  image_url?: string;
}

interface CartContextType {
  items: CartItem[];
  businessId: string | null; // Cart locked to one business per spec
  businessName: string | null;
  addToCart: (product: Product, quantity: number, notes?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);

  /**
   * Add product to cart
   * See spec.md §4 - cart locked to one business
   */
  const addToCart = (product: Product, quantity: number, notes?: string) => {
    // Validate business_id consistency (can't mix products from different shops)
    if (businessId && businessId !== product.business_id) {
      throw new Error(
        `Cannot add items from different businesses. Current cart is for ${businessName}.`
      );
    }

    // Check if product is unavailable or out of stock
    if (product.status === 'out_of_stock' || product.status === 'inactive') {
      throw new Error(`${product.name} is currently unavailable`);
    }

    const currentStock = typeof product.current_stock === 'string' 
      ? parseInt(product.current_stock) 
      : (product.current_stock || 0);

    if (quantity > currentStock) {
      throw new Error(`Only ${currentStock} units of ${product.name} available`);
    }

    // Set business on first item
    if (!businessId) {
      setBusinessId(product.business_id);
      // Try to extract business name if available
      setBusinessName(product.business_id); // Placeholder, ideally pass business name
    }

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) => item.product_id === product.id
      );

      if (existingIndex >= 0) {
        // Update existing item
        const updated = [...prevItems];
        const newQuantity = updated[existingIndex].quantity + quantity;
        
        if (newQuantity > currentStock) {
          throw new Error(`Cannot add more. Only ${currentStock} units available.`);
        }

        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQuantity,
          special_requests: notes || updated[existingIndex].special_requests,
        };
        return updated;
      } else {
        // Add new item
        const isTemporarilyUnavailable = Boolean(
          typeof product.is_unavailable === 'string'
            ? product.is_unavailable === '1'
            : product.is_unavailable
        );

        const newItem: CartItem = {
          product_id: product.id,
          product_name: product.name,
          price: typeof product.price === 'string' 
            ? parseFloat(product.price) 
            : product.price,
          quantity,
          special_requests: notes,
          stock: currentStock,
          is_unavailable: isTemporarilyUnavailable || product.status === 'out_of_stock' || product.status === 'inactive',
          image_url: product.image_url || undefined,
        };
        return [...prevItems, newItem];
      }
    });
  };

  /**
   * Update quantity for a cart item
   */
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.product_id === productId) {
          if (quantity > item.stock) {
            throw new Error(`Only ${item.stock} units available`);
          }
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (productId: string) => {
    setItems((prevItems) => {
      const filtered = prevItems.filter((item) => item.product_id !== productId);
      
      // Clear business if cart becomes empty
      if (filtered.length === 0) {
        setBusinessId(null);
        setBusinessName(null);
      }
      
      return filtered;
    });
  };

  /**
   * Clear entire cart
   * Called after successful order placement
   */
  const clearCart = () => {
    setItems([]);
    setBusinessId(null);
    setBusinessName(null);
  };

  /**
   * Calculate subtotal
   */
  const getSubtotal = (): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  /**
   * Get total number of items
   */
  const getTotalItems = (): number => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        businessId,
        businessName,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
        getTotalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

/**
 * Hook to use cart context
 */
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

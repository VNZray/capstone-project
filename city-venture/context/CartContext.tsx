// See FRONTEND_IMPLEMENTATION.md - State Management

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '@/types/Product';
import { fetchProductById } from '@/services/ProductService';

// Storage key for cart persistence
const CART_STORAGE_KEY = '@cityventure/cart';
// Cart expires after 24 hours to prevent stale pricing
const CART_EXPIRY_HOURS = 24;

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

interface PersistedCartData {
  items: CartItem[];
  businessId: string | null;
  businessName: string | null;
  timestamp: number;
}

interface CartContextType {
  items: CartItem[];
  businessId: string | null; // Cart locked to one business per spec
  businessName: string | null;
  isLoading: boolean; // Loading state for cart restoration
  isValidating: boolean; // Loading state for cart validation against backend
  addToCart: (product: Product, quantity: number, notes?: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
  /** Validate cart items against the database - removes deleted products, updates prices/stock */
  validateCart: () => Promise<{ removedCount: number; updatedCount: number }>;
  /** Restore cart items from a failed order */
  restoreFromOrder: (
    orderItems: RestoreOrderItem[],
    businessId: string,
    businessName?: string
  ) => void;
}

/** Simplified order item for cart restoration */
export interface RestoreOrderItem {
  product_id: string;
  product_name?: string;
  unit_price: number;
  quantity: number;
  special_requests?: string;
  product_image_url?: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  console.log('[CartContext] Initializing');
  const [items, setItems] = useState<CartItem[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Load cart from AsyncStorage on mount
   */
  useEffect(() => {
    const loadPersistedCart = async () => {
      try {
        const storedData = await AsyncStorage.getItem(CART_STORAGE_KEY);

        if (storedData) {
          const parsedData: PersistedCartData = JSON.parse(storedData);

          // Check if cart has expired (24 hours)
          const now = Date.now();
          const cartAge = now - parsedData.timestamp;
          const expiryMs = CART_EXPIRY_HOURS * 60 * 60 * 1000;

          if (cartAge > expiryMs) {
            console.log('[CartContext] Persisted cart expired, clearing');
            await AsyncStorage.removeItem(CART_STORAGE_KEY);
          } else if (parsedData.items && parsedData.items.length > 0) {
            console.log(
              '[CartContext] Restoring cart with',
              parsedData.items.length,
              'items'
            );
            setItems(parsedData.items);
            setBusinessId(parsedData.businessId);
            setBusinessName(parsedData.businessName);
          }
        } else {
          console.log('[CartContext] No persisted cart found');
        }
      } catch (error) {
        console.error('[CartContext] Failed to load persisted cart:', error);
        // Clear potentially corrupted data
        await AsyncStorage.removeItem(CART_STORAGE_KEY).catch(() => {});
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    loadPersistedCart();
  }, []);

  /**
   * Persist cart to AsyncStorage whenever it changes
   * Only runs after initial load is complete
   */
  useEffect(() => {
    if (!isInitialized) return;

    const persistCart = async () => {
      try {
        if (items.length === 0) {
          // Clear storage if cart is empty
          await AsyncStorage.removeItem(CART_STORAGE_KEY);
          console.log('[CartContext] Cart cleared, removed from storage');
        } else {
          const dataToStore: PersistedCartData = {
            items,
            businessId,
            businessName,
            timestamp: Date.now(),
          };
          await AsyncStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(dataToStore)
          );
          console.log(
            '[CartContext] Cart persisted with',
            items.length,
            'items'
          );
        }
      } catch (error) {
        console.error('[CartContext] Failed to persist cart:', error);
      }
    };

    persistCart();
  }, [items, businessId, businessName, isInitialized]);

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

    const currentStock =
      typeof product.current_stock === 'string'
        ? parseInt(product.current_stock)
        : product.current_stock || 0;

    if (quantity > currentStock) {
      throw new Error(
        `Only ${currentStock} units of ${product.name} available`
      );
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
          throw new Error(
            `Cannot add more. Only ${currentStock} units available.`
          );
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
          price:
            typeof product.price === 'string'
              ? parseFloat(product.price)
              : product.price,
          quantity,
          special_requests: notes,
          stock: currentStock,
          is_unavailable:
            isTemporarilyUnavailable ||
            product.status === 'out_of_stock' ||
            product.status === 'inactive',
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
      const filtered = prevItems.filter(
        (item) => item.product_id !== productId
      );

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
  const clearCart = useCallback(async () => {
    setItems([]);
    setBusinessId(null);
    setBusinessName(null);
    // Also clear from storage immediately
    try {
      await AsyncStorage.removeItem(CART_STORAGE_KEY);
      console.log('[CartContext] Cart cleared from storage');
    } catch (error) {
      console.error('[CartContext] Failed to clear cart from storage:', error);
    }
  }, []);

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

  /**
   * Restore cart items from a failed order
   * Used when user doesn't want to retry payment and wants to go back to cart
   */
  const restoreFromOrder = useCallback(
    (
      orderItems: RestoreOrderItem[],
      orderBusinessId: string,
      orderBusinessName?: string
    ) => {
      console.log(
        '[CartContext] Restoring',
        orderItems.length,
        'items from failed order'
      );

      // Convert order items to cart items
      const restoredItems: CartItem[] = orderItems.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name || 'Unknown Product',
        price:
          typeof item.unit_price === 'string'
            ? parseFloat(item.unit_price)
            : item.unit_price,
        quantity: item.quantity,
        special_requests: item.special_requests,
        stock: 999, // Stock will be validated at checkout
        is_unavailable: false, // Will be checked when viewing cart
        image_url: item.product_image_url,
      }));

      setItems(restoredItems);
      setBusinessId(orderBusinessId);
      setBusinessName(orderBusinessName || orderBusinessId);
    },
    []
  );

  /**
   * Validate cart items against the database
   * - Removes items that no longer exist (deleted products)
   * - Updates prices if they changed
   * - Updates stock information
   * - Marks items as unavailable if out of stock
   * Should be called when cart screen is opened or app resumes
   */
  const validateCart = useCallback(async (): Promise<{
    removedCount: number;
    updatedCount: number;
  }> => {
    if (items.length === 0) {
      return { removedCount: 0, updatedCount: 0 };
    }

    console.log('[CartContext] Validating cart with', items.length, 'items');
    setIsValidating(true);

    let removedCount = 0;
    let updatedCount = 0;
    const validatedItems: CartItem[] = [];

    try {
      // Validate each cart item against the backend
      for (const cartItem of items) {
        try {
          const product = await fetchProductById(cartItem.product_id);

          // Product exists - check for updates
          const currentPrice =
            typeof product.price === 'string'
              ? parseFloat(product.price)
              : product.price;
          const currentStock =
            typeof product.current_stock === 'string'
              ? parseInt(product.current_stock)
              : product.current_stock || 0;
          const isUnavailable =
            product.status === 'out_of_stock' ||
            product.status === 'inactive' ||
            Boolean(product.is_unavailable);

          const priceChanged = currentPrice !== cartItem.price;
          const stockChanged = currentStock !== cartItem.stock;
          const availabilityChanged = isUnavailable !== cartItem.is_unavailable;

          if (priceChanged || stockChanged || availabilityChanged) {
            updatedCount++;
            console.log('[CartContext] Updating cart item:', {
              product_id: cartItem.product_id,
              priceChanged: priceChanged
                ? `${cartItem.price} -> ${currentPrice}`
                : false,
              stockChanged: stockChanged
                ? `${cartItem.stock} -> ${currentStock}`
                : false,
              availabilityChanged,
            });
          }

          // Adjust quantity if it exceeds available stock
          let adjustedQuantity = cartItem.quantity;
          if (adjustedQuantity > currentStock && currentStock > 0) {
            adjustedQuantity = currentStock;
            console.log(
              `[CartContext] Adjusted quantity for ${cartItem.product_name}: ${cartItem.quantity} -> ${adjustedQuantity}`
            );
          }

          validatedItems.push({
            ...cartItem,
            product_name: product.name, // Update name in case it changed
            price: currentPrice,
            stock: currentStock,
            is_unavailable: isUnavailable,
            quantity: adjustedQuantity,
            image_url: product.image_url || cartItem.image_url,
          });
        } catch (error: any) {
          // Product not found (404) or other error - remove from cart
          if (error.response?.status === 404) {
            console.log(
              '[CartContext] Product not found, removing from cart:',
              cartItem.product_id
            );
            removedCount++;
          } else {
            // For other errors (network issues), keep the item but log warning
            console.warn(
              '[CartContext] Failed to validate product, keeping in cart:',
              cartItem.product_id,
              error.message
            );
            validatedItems.push(cartItem);
          }
        }
      }

      // Update cart with validated items
      setItems(validatedItems);

      // Clear business if cart becomes empty
      if (validatedItems.length === 0) {
        setBusinessId(null);
        setBusinessName(null);
      }

      console.log('[CartContext] Cart validation complete:', {
        removedCount,
        updatedCount,
        remainingItems: validatedItems.length,
      });

      return { removedCount, updatedCount };
    } catch (error) {
      console.error('[CartContext] Cart validation failed:', error);
      return { removedCount: 0, updatedCount: 0 };
    } finally {
      setIsValidating(false);
    }
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        businessId,
        businessName,
        isLoading,
        isValidating,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getSubtotal,
        getTotalItems,
        validateCart,
        restoreFromOrder,
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

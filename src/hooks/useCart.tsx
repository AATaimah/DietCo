import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Product } from "@/components/products/ProductCard";
import { CartItemType } from "@/components/cart/CartItem";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

interface CartContextValue {
  items: CartItemType[];
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setItems: (items: CartItemType[]) => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { t } = useI18n();
  const [items, setItems] = useState<CartItemType[]>([]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      
      if (existingItem) {
        toast.success(
          t("toasts.updatedQuantity", { name: t(product.nameKey) }),
        );
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      toast.success(t("toasts.addedToCart", { name: t(product.nameKey) }));
      return [
        ...prev,
        {
          id: product.id,
          nameKey: product.nameKey,
          packSizeKey: product.packSizeKey,
          price: product.price,
          currency: product.currency,
          quantity: quantity,
          image: product.image,
        },
      ];
    });
  }, [t]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success(t("toasts.itemRemoved"));
      return;
    }
    
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, [t]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(t("toasts.itemRemoved"));
  }, [t]);

  const clearCart = useCallback(() => {
    setItems([]);
    toast.success(t("toasts.cartCleared"));
  }, [t]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      setItems,
      itemCount,
      subtotal,
    }),
    [items, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

export function useCartTotals() {
  const { itemCount, subtotal } = useCart();
  return { itemCount, subtotal };
}

export type { CartContextValue };

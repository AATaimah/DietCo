import { useState, useCallback } from "react";
import { Product } from "@/components/products/ProductCard";
import { CartItemType } from "@/components/cart/CartItem";
import { toast } from "sonner";

export function useCart() {
  const [items, setItems] = useState<CartItemType[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      
      if (existingItem) {
        toast.success(`Updated ${product.name} quantity`);
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      toast.success(`Added ${product.name} to cart`);
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          packSize: product.packSize,
          price: product.price,
          currency: product.currency,
          quantity: 1,
          image: product.image,
        },
      ];
    });
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item removed from cart");
      return;
    }
    
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed from cart");
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    toast.success("Cart cleared");
  }, []);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
  };
}

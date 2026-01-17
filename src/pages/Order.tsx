import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { CategoryTabs } from "@/components/products/CategoryTabs";
import { ProductCard } from "@/components/products/ProductCard";
import { CartPanel } from "@/components/cart/CartPanel";
import { useCart } from "@/hooks/useCart";
import { categories, products } from "@/data/mockProducts";
import { ShieldCheck, Truck, Clock, CreditCard } from "lucide-react";

const Order = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items, addItem, updateQuantity, removeItem, itemCount } = useCart();

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

  const handleCheckout = () => {
    navigate("/checkout", { state: { items } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItemCount={itemCount}
        onCartClick={() => setIsCartOpen(!isCartOpen)}
      />

      <section className="border-b border-border bg-card">
        <div className="container py-8 md:py-10">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-foreground mb-2">Place an Order</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Browse specialty medications and fertility treatments available
                to verified clinics. Add items to your cart and check out when
                you are ready.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Verified supply chain</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>Same-day metro delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Real-time availability</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Secure invoicing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container py-6 md:py-8">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <CategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addItem}
                  isInCart={items.some((item) => item.id === product.id)}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No products found in this category.
                </p>
              </div>
            )}
          </div>

          <CartPanel
            items={items}
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(!isCartOpen)}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
            onCheckout={handleCheckout}
          />
        </div>
      </main>
    </div>
  );
};

export default Order;

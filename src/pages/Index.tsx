import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { CategoryTabs } from "@/components/products/CategoryTabs";
import { ProductCard } from "@/components/products/ProductCard";
import { CartPanel } from "@/components/cart/CartPanel";
import { useCart } from "@/hooks/useCart";
import { categories, products } from "@/data/mockProducts";
import { Shield, Truck, Clock, CreditCard } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    itemCount,
  } = useCart();

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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/30 border-b border-border">
        <div className="container py-8 md:py-12">
          <div className="max-w-2xl">
            <h1 className="text-foreground mb-3">
              Premium Healthcare Products
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Trusted specialty medications and fertility treatments delivered to your clinic. 
              Fast ordering for healthcare professionals.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-4 md:gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Verified Products</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4 text-primary" />
                <span>Same Day Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-primary" />
                <span>24/7 Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container py-6 md:py-8">
        <div className="flex gap-8">
          {/* Products Section */}
          <div className="flex-1 min-w-0">
            {/* Category Tabs */}
            <div className="mb-6">
              <CategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            {/* Products Grid */}
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

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No products found in this category.
                </p>
              </div>
            )}
          </div>

          {/* Cart Panel (Desktop) */}
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

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img
                src="/favicon.ico"
                alt="DietCo"
                className="h-9 w-9 rounded-xl"
              />
              <span className="font-semibold">DietCo</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2026 DietCo. Licensed healthcare marketplace serving Saudi Arabia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

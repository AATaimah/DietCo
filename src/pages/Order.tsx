import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { CategoryTabs } from "@/components/products/CategoryTabs";
import { ProductCard, Product } from "@/components/products/ProductCard";
import { CartPanel } from "@/components/cart/CartPanel";
import { useCart } from "@/hooks/useCart";
import { categories, products } from "@/data/mockProducts";
import { ShieldCheck, Truck, Clock, CreditCard } from "lucide-react";
import { useI18n } from "@/i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Order = () => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const [activeCategory, setActiveCategory] = useState("all");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { items, addItem, updateQuantity, removeItem, itemCount } = useCart();

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((product) => product.category === activeCategory);

  const handleCheckout = () => {
    navigate("/checkout", { state: { items } });
  };

  const handleOpenProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedQuantity(1);
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
              <h1 className="text-foreground mb-2">{t("order.title")}</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                {t("order.subtitle")}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 md:gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>{t("order.trust.verified")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span>{t("order.trust.sameDay")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{t("order.trust.availability")}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <span>{t("order.trust.invoicing")}</span>
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

            <div className="grid [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAdd={addItem}
                  isInCart={items.some((item) => item.id === product.id)}
                  onOpen={handleOpenProduct}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t("order.empty")}
                </p>
              </div>
            )}
          </div>

          {isCartOpen && itemCount > 0 && (
            <CartPanel
              items={items}
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(!isCartOpen)}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
              onCheckout={handleCheckout}
            />
          )}
        </div>
      </main>

      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => {
          if (!open) setSelectedProduct(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          {selectedProduct && (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="aspect-square bg-muted/50 rounded-xl overflow-hidden">
                {selectedProduct.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={t(selectedProduct.nameKey)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                    {t("home.catalog.noImage")}
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <DialogHeader className="text-left">
                  <DialogTitle>{t(selectedProduct.nameKey)}</DialogTitle>
                  <DialogDescription>
                    {t(selectedProduct.packSizeKey)}
                  </DialogDescription>
                </DialogHeader>

                <p className="text-sm text-muted-foreground">
                  {t(selectedProduct.descriptionKey)}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("productDetails.packSize")}
                    </span>
                    <span>{t(selectedProduct.packSizeKey)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("productDetails.price")}
                    </span>
                    <span>
                      {formatPrice(
                        selectedProduct.price,
                        selectedProduct.currency,
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {t("productDetails.availability")}
                    </span>
                    <span>
                      {selectedProduct.inStock
                        ? selectedProduct.stockCount
                          ? t("products.stockCount", {
                              count: selectedProduct.stockCount,
                            })
                          : t("products.inStock")
                        : t("products.outOfStock")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {t("productDetails.quantity")}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="pill"
                        size="pill"
                        className="h-8 w-8"
                        onClick={() =>
                          setSelectedQuantity((current) => Math.max(1, current - 1))
                        }
                        aria-label={t("productDetails.decreaseQuantity")}
                      >
                        <span>-</span>
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">
                        {selectedQuantity}
                      </span>
                      <Button
                        variant="pill"
                        size="pill"
                        className="h-8 w-8"
                        onClick={() => setSelectedQuantity((current) => current + 1)}
                        aria-label={t("productDetails.increaseQuantity")}
                      >
                        <span>+</span>
                      </Button>
                    </div>
                  </div>
                  <span className="price-large text-foreground">
                    {formatPrice(
                      selectedProduct.price,
                      selectedProduct.currency,
                    )}
                  </span>
                </div>

                <Button
                  variant="clinical"
                  size="lg"
                  onClick={() => addItem(selectedProduct, selectedQuantity)}
                  disabled={!selectedProduct.inStock}
                >
                  {t("productDetails.addToCart")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Order;

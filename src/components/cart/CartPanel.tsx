import { ShoppingBag, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem, CartItemType } from "./CartItem";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

interface CartPanelProps {
  items: CartItemType[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}

export function CartPanel({
  items,
  isOpen,
  onClose,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: CartPanelProps) {
  const { t, locale } = useI18n();
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = 25;
  const vat = subtotal * 0.15;
  const total = subtotal + deliveryFee + vat;
  const currency = items[0]?.currency || "SAR";

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Desktop Sticky Panel */}
      <aside className="hidden lg:block w-[360px] flex-shrink-0">
        <div className="sticky top-20 cart-panel rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">{t("cart.title")}</h2>
              {itemCount > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">{t("cart.emptyTitle")}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("cart.emptySubtitle")}
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-[400px] overflow-y-auto scrollbar-hide -mx-2 px-2">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={onUpdateQuantity}
                    onRemove={onRemove}
                  />
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("cart.subtotal")}
                  </span>
                  <span>{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("cart.deliveryFee")}
                  </span>
                  <span>{formatPrice(deliveryFee, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("cart.vat")}
                  </span>
                  <span>{formatPrice(vat, currency)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold pt-2 border-t border-border">
                  <span>{t("cart.total")}</span>
                  <span className="text-primary">
                    {formatPrice(total, currency)}
                  </span>
                </div>

                <Button
                  variant="clinical"
                  size="lg"
                  className="w-full"
                  onClick={onCheckout}
                >
                  {t("cart.proceedToCheckout")}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Drawer */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out safe-bottom",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Backdrop */}
        <div
          className={cn(
            "fixed inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={onClose}
        />

        {/* Drawer Content */}
        <div className="relative bg-card rounded-t-2xl border-t border-border shadow-elevated max-h-[80vh] flex flex-col">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              <h2 className="font-semibold text-lg">{t("cart.title")}</h2>
              {itemCount > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </div>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-4 py-2">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">{t("cart.emptyTitle")}</p>
              </div>
            ) : (
              items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={onUpdateQuantity}
                  onRemove={onRemove}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-border bg-card space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("cart.subtotal")}
                </span>
                <span>{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("cart.deliveryFee")}
                </span>
                <span>{formatPrice(deliveryFee, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("cart.vat")}
                </span>
                <span>{formatPrice(vat, currency)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold pt-2 border-t border-border">
                <span>{t("cart.total")}</span>
                <span className="text-primary">
                  {formatPrice(total, currency)}
                </span>
              </div>
              <Button
                variant="clinical"
                size="lg"
                className="w-full touch-target"
                onClick={onCheckout}
              >
                {t("cart.proceedToCheckout")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      {!isOpen && items.length > 0 && (
        <button
          onClick={() => onClose()}
          className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-primary animate-scale-in touch-target"
        >
          <ShoppingBag className="h-5 w-5" />
          <span className="font-semibold">{itemCount}</span>
          <span className="font-semibold">•</span>
          <span className="font-semibold">{formatPrice(subtotal, currency)}</span>
        </button>
      )}
    </>
  );
}

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

export interface CartItemType {
  id: string;
  nameKey: string;
  packSizeKey: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string;
}

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const { t, locale } = useI18n();
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="flex gap-3 py-3 border-b border-border last:border-b-0 animate-fade-in">
      {/* Product Image */}
      <div className="w-16 h-16 rounded-lg bg-muted/50 flex-shrink-0 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={t(item.nameKey)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground line-clamp-1">
          {t(item.nameKey)}
        </h4>
        <p className="text-xs text-muted-foreground mb-2">
          {t(item.packSizeKey)}
        </p>

        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="pill"
              size="pill"
              onClick={() =>
                onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
              }
              className="h-7 w-7"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-semibold text-sm tabular-nums">
              {item.quantity}
            </span>
            <Button
              variant="pill"
              size="pill"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="h-7 w-7"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          <span className="price text-sm">
            {formatPrice(item.price * item.quantity, item.currency)}
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onRemove(item.id)}
        className="text-muted-foreground hover:text-destructive flex-shrink-0"
        aria-label={t("cart.remove")}
        title={t("cart.remove")}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

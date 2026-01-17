import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useI18n } from "@/i18n";

export interface Product {
  id: string;
  nameKey: string;
  packSizeKey: string;
  descriptionKey: string;
  price: number;
  currency: string;
  inStock: boolean;
  stockCount?: number;
  image?: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product, quantity: number) => void;
  isInCart?: boolean;
  onOpen?: (product: Product) => void;
}

export function ProductCard({ product, onAdd, isInCart = false, onOpen }: ProductCardProps) {
  const { t, locale } = useI18n();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handleAdd = (event?: React.MouseEvent<HTMLButtonElement>) => {
    event?.stopPropagation();
    setIsAdding(true);
    onAdd(product, quantity);
    setTimeout(() => setIsAdding(false), 600);
  };

  const handleOpen = () => {
    onOpen?.(product);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onOpen) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpen(product);
    }
  };

  const handleQuantityChange = (
    delta: number,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    setQuantity((current) => Math.max(1, current + delta));
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div
      className={cn("product-card group flex flex-col", onOpen && "cursor-pointer")}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen ? handleOpen : undefined}
      onKeyDown={onOpen ? handleKeyDown : undefined}
    >
      {/* Product Image */}
      <div className="aspect-square bg-muted/50 relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={t(product.nameKey)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-muted-foreground/30"
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
        
        {/* Stock Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "badge-status",
              product.inStock ? "badge-paid" : "badge-draft"
            )}
          >
            {product.inStock
              ? product.stockCount
                ? t("products.stockCount", { count: product.stockCount })
                : t("products.inStock")
              : t("products.outOfStock")}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-foreground line-clamp-2 min-h-[2.5rem] mb-1">
          {t(product.nameKey)}
        </h3>
        <p className="text-sm text-muted-foreground min-h-[1.25rem] mb-3">
          {t(product.packSizeKey)}
        </p>

        <div className="flex items-center justify-between gap-3">
          <span className="price-large text-foreground">
            {formatPrice(product.price, product.currency)}
          </span>

          <div
            className="flex items-center gap-1"
            onClick={(event) => event.stopPropagation()}
          >
            <Button
              variant="pill"
              size="pill"
              className="h-7 w-7"
              onClick={(event) => handleQuantityChange(-1, event)}
              aria-label={t("productDetails.decreaseQuantity")}
            >
              <span>-</span>
            </Button>
            <span className="w-6 text-center text-sm font-semibold tabular-nums">
              {quantity}
            </span>
            <Button
              variant="pill"
              size="pill"
              className="h-7 w-7"
              onClick={(event) => handleQuantityChange(1, event)}
              aria-label={t("productDetails.increaseQuantity")}
            >
              <span>+</span>
            </Button>
          </div>
        </div>

        <Button
          variant="add-to-cart"
          size="sm"
          onClick={handleAdd}
          disabled={!product.inStock}
          className={cn(
            "mt-auto w-full text-xs whitespace-nowrap transition-all",
            isAdding && "bg-success",
            isInCart && !isAdding && "bg-primary/80"
          )}
          aria-label={t("productDetails.addToCart")}
        >
          {isAdding ? (
            <Check className="h-4 w-4 animate-scale-in" />
          ) : (
            t("productDetails.addToCart")
          )}
        </Button>
      </div>
    </div>
  );
}

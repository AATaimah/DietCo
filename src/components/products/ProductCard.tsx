import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface Product {
  id: string;
  name: string;
  packSize: string;
  price: number;
  currency: string;
  inStock: boolean;
  stockCount?: number;
  image?: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  isInCart?: boolean;
}

export function ProductCard({ product, onAdd, isInCart = false }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    onAdd(product);
    setTimeout(() => setIsAdding(false), 600);
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="product-card group">
      {/* Product Image */}
      <div className="aspect-square bg-muted/50 relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
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
                ? `${product.stockCount} in stock`
                : "In Stock"
              : "Out of Stock"}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-3">{product.packSize}</p>

        <div className="flex items-center justify-between gap-3">
          <span className="price-large text-foreground">
            {formatPrice(product.price, product.currency)}
          </span>
          
          <Button
            variant="add-to-cart"
            size="icon"
            onClick={handleAdd}
            disabled={!product.inStock}
            className={cn(
              "transition-all",
              isAdding && "bg-success",
              isInCart && !isAdding && "bg-primary/80"
            )}
          >
            {isAdding ? (
              <Check className="h-5 w-5 animate-scale-in" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

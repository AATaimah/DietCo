import { cn } from "@/lib/utils";
import {
  FileText,
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

export type OrderStatus =
  | "DRAFT"
  | "PAID"
  | "FULFILLING"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "PENDING"
  | "CANCELLED";

interface StatusBadgeProps {
  status: OrderStatus;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

const statusConfig: Record<
  OrderStatus,
  {
    label: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  DRAFT: {
    label: "Draft",
    className: "badge-draft",
    icon: FileText,
  },
  PAID: {
    label: "Paid",
    className: "badge-paid",
    icon: CreditCard,
  },
  FULFILLING: {
    label: "Fulfilling",
    className: "badge-fulfilling",
    icon: Package,
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    className: "badge-out-for-delivery",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    className: "badge-delivered",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "Pending",
    className: "bg-warning/10 text-warning",
    icon: Clock,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-destructive/10 text-destructive",
    icon: XCircle,
  },
};

const sizeClasses = {
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
  lg: "text-sm px-3 py-1.5",
};

export function StatusBadge({
  status,
  showIcon = true,
  size = "md",
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "badge-status inline-flex items-center gap-1.5",
        config.className,
        sizeClasses[size]
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span>{config.label}</span>
    </span>
  );
}

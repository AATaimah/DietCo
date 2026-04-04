import { CreditCard, Smartphone, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export type PaymentMethod = "applepay" | "cards" | "stcpay";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const paymentMethods = [
  {
    id: "applepay" as PaymentMethod,
    labelKey: "payment.methodLabels.applepay",
    descriptionKey: "payment.methods.applepay",
    badge: (
      <div className="flex h-11 min-w-[68px] items-center justify-center rounded-xl bg-black px-3 text-sm font-semibold text-white">
        Apple Pay
      </div>
    ),
    icon: Smartphone,
  },
  {
    id: "cards" as PaymentMethod,
    labelKey: "payment.methodLabels.cards",
    descriptionKey: "payment.methods.cards",
    badge: (
      <div className="flex items-center gap-1.5">
        <span className="rounded-full bg-[#00A3AD] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
          mada
        </span>
        <span className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1A1F71]">
          Visa
        </span>
        <span className="rounded-full border border-border bg-white px-2.5 py-1 text-[11px] font-semibold text-[#EB001B]">
          MC
        </span>
      </div>
    ),
    icon: CreditCard,
  },
  {
    id: "stcpay" as PaymentMethod,
    labelKey: "payment.methodLabels.stcpay",
    descriptionKey: "payment.methods.stcpay",
    badge: (
      <div className="flex h-11 min-w-[68px] items-center justify-center rounded-xl bg-[#4f008c] px-3 text-sm font-semibold text-white">
        stc pay
      </div>
    ),
    icon: Wallet,
  },
];

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 font-semibold text-foreground">
        <CreditCard className="h-5 w-5 text-primary" />
        {t("payment.title")}
      </h3>

      <div className="space-y-3">
        {paymentMethods.map((method) => {
          const Icon = method.icon;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={cn(
                "flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                selectedMethod === method.id
                  ? "border-primary bg-primary/5 shadow-[0_18px_45px_-36px_rgba(74,58,255,0.32)]"
                  : "border-border bg-card hover:border-primary/25 hover:bg-muted/30",
              )}
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-foreground">{t(method.labelKey)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t(method.descriptionKey)}</p>
                <div className="mt-3">{method.badge}</div>
              </div>

              <div
                className={cn(
                  "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
                  selectedMethod === method.id
                    ? "border-primary bg-primary"
                    : "border-muted-foreground/30",
                )}
              >
                {selectedMethod === method.id ? (
                  <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

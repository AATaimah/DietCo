import { CreditCard, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export type PaymentMethod = "mada" | "visa" | "mastercard" | "applepay";

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
}

const paymentMethods = [
  {
    id: "mada" as PaymentMethod,
    name: "Mada",
    descriptionKey: "payment.methods.mada",
    logo: (
      <div className="w-12 h-8 bg-gradient-to-r from-[#004D40] to-[#00796B] rounded flex items-center justify-center">
        <span className="text-white font-bold text-xs">mada</span>
      </div>
    ),
  },
  {
    id: "visa" as PaymentMethod,
    name: "Visa",
    descriptionKey: "payment.methods.visa",
    logo: (
      <div className="w-12 h-8 bg-gradient-to-r from-[#1A1F71] to-[#2D4AA8] rounded flex items-center justify-center">
        <span className="text-white font-bold text-xs italic">VISA</span>
      </div>
    ),
  },
  {
    id: "mastercard" as PaymentMethod,
    name: "Mastercard",
    descriptionKey: "payment.methods.mastercard",
    logo: (
      <div className="w-12 h-8 bg-foreground/5 rounded flex items-center justify-center">
        <div className="flex -space-x-2">
          <div className="w-4 h-4 rounded-full bg-[#EB001B]" />
          <div className="w-4 h-4 rounded-full bg-[#F79E1B]" />
        </div>
      </div>
    ),
  },
  {
    id: "applepay" as PaymentMethod,
    name: "Apple Pay",
    descriptionKey: "payment.methods.applepay",
    logo: (
      <div className="w-12 h-8 bg-foreground rounded flex items-center justify-center">
        <Smartphone className="w-4 h-4 text-background" />
      </div>
    ),
  },
];

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
}: PaymentMethodSelectorProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        {t("payment.title")}
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={cn(
              "flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
              selectedMethod === method.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/30 hover:bg-muted/50"
            )}
          >
            {method.logo}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground">{method.name}</p>
              <p className="text-xs text-muted-foreground">{t(method.descriptionKey)}</p>
            </div>
            <div
              className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                selectedMethod === method.id
                  ? "border-primary bg-primary"
                  : "border-muted-foreground/30"
              )}
            >
              {selectedMethod === method.id && (
                <div className="w-2 h-2 rounded-full bg-primary-foreground" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

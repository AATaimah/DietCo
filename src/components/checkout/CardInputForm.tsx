import { Lock, QrCode } from "lucide-react";
import { PaymentMethod } from "./PaymentMethodSelector";
import { useI18n } from "@/i18n";

interface CardInputFormProps {
  paymentMethod: PaymentMethod | null;
  isDesktopApplePayFlow?: boolean;
}

export function CardInputForm({
  paymentMethod,
  isDesktopApplePayFlow = false,
}: CardInputFormProps) {
  const { t } = useI18n();

  if (!paymentMethod) return null;

  const methodTitle = t(`payment.methodLabels.${paymentMethod}`);
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/8 text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">
            {t("payment.securePanel.title", { method: methodTitle })}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t(`payment.securePanel.descriptions.${paymentMethod}`)}
          </p>
        </div>
      </div>

      {paymentMethod === "applepay" && isDesktopApplePayFlow ? (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/15 bg-primary/5 p-4">
          <QrCode className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-medium text-foreground">{t("payment.applePay.desktopTitle")}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t("payment.applePay.desktopDescription")}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Truck, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { PaymentMethodSelector, PaymentMethod } from "@/components/checkout/PaymentMethodSelector";
import { CardInputForm } from "@/components/checkout/CardInputForm";
import { AddressInput } from "@/components/checkout/AddressInput";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CartItemType } from "@/components/cart/CartItem";
import { toast } from "sonner";
import { useI18n } from "@/i18n";

// Get API key from environment or use placeholder
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

interface DeliveryDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  additionalNotes: string;
  lat?: number;
  lng?: number;
}

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  
  // Get cart items from navigation state or use sample data
  const [items, setItems] = useState<CartItemType[]>(() => {
    const state = location.state as { items?: CartItemType[] };
    if (state?.items && state.items.length > 0) {
      return state.items;
    }
    // Sample items for demo if no cart items passed
    return [
      {
        id: "1",
        nameKey: "products.items.1.name",
        packSizeKey: "products.items.1.packSize",
        price: 450,
        currency: "SAR",
        quantity: 2,
      },
      {
        id: "2",
        nameKey: "products.items.2.name",
        packSizeKey: "products.items.2.packSize",
        price: 1250,
        currency: "SAR",
        quantity: 1,
      },
    ];
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"details" | "payment" | "confirmation">("details");
  const paymentMethodLabel = selectedPaymentMethod
    ? t(`payment.methodLabels.${selectedPaymentMethod}`)
    : "";

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success(t("toasts.itemRemoved"));
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(t("toasts.itemRemoved"));
  };

  const validateDeliveryDetails = () => {
    if (!deliveryDetails?.fullName?.trim()) {
      toast.error(t("checkout.validation.fullName"));
      return false;
    }
    if (!deliveryDetails?.phone?.trim()) {
      toast.error(t("checkout.validation.phone"));
      return false;
    }
    if (!deliveryDetails?.address?.trim()) {
      toast.error(t("checkout.validation.address"));
      return false;
    }
    if (!deliveryDetails?.city?.trim()) {
      toast.error(t("checkout.validation.city"));
      return false;
    }
    return true;
  };

  const validatePaymentDetails = () => {
    if (!selectedPaymentMethod) {
      toast.error(t("checkout.validation.paymentMethod"));
      return false;
    }
    if (selectedPaymentMethod !== "applepay") {
      if (!cardDetails?.cardNumber || cardDetails.cardNumber.replace(/\s/g, "").length < 16) {
        toast.error(t("checkout.validation.cardNumber"));
        return false;
      }
      if (!cardDetails?.expiryDate || cardDetails.expiryDate.length < 5) {
        toast.error(t("checkout.validation.expiryDate"));
        return false;
      }
      if (!cardDetails?.cvv || cardDetails.cvv.length < 3) {
        toast.error(t("checkout.validation.cvv"));
        return false;
      }
      if (!cardDetails?.cardholderName?.trim()) {
        toast.error(t("checkout.validation.cardholderName"));
        return false;
      }
    }
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateDeliveryDetails()) return;
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    if (!validatePaymentDetails()) return;

    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setStep("confirmation");
    toast.success(t("checkout.confirmation.toast"));
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t("checkout.empty.title")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("checkout.empty.subtitle")}
          </p>
          <Button onClick={() => navigate("/order")} variant="clinical">
            {t("checkout.empty.cta")}
          </Button>
        </div>
      </div>
    );
  }

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 max-w-lg mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t("checkout.confirmation.title")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("checkout.confirmation.subtitle")}
          </p>
          
          <div className="bg-card rounded-xl border border-border p-6 text-left mb-6">
            <h3 className="font-semibold mb-4">{t("checkout.confirmation.detailsTitle")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("checkout.confirmation.orderNumber")}</span>
                <span className="font-medium">#MED-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("checkout.confirmation.deliveryAddress")}</span>
                <span className="font-medium text-right max-w-[200px]">
                  {deliveryDetails?.address}, {deliveryDetails?.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("checkout.confirmation.paymentMethod")}</span>
                <span className="font-medium">{paymentMethodLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/")} variant="clinical" size="lg">
              {t("checkout.confirmation.continueShopping")}
            </Button>
            <Button onClick={() => navigate("/orders")} variant="outline" size="lg">
              {t("checkout.confirmation.viewOrders")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={items.reduce((sum, item) => sum + item.quantity, 0)} />

      {/* Progress Bar */}
      <div className="border-b border-border bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => step === "payment" ? setStep("details") : navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "details" || step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  1
                </div>
                <div className={`flex-1 h-1 rounded ${step === "payment" ? "bg-primary" : "bg-muted"}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === "payment" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  2
                </div>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-muted-foreground">{t("checkout.progress.delivery")}</span>
                <span className="text-xs text-muted-foreground">{t("checkout.progress.payment")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-8">
            {step === "details" && (
              <>
                <AddressInput
                  apiKey={GOOGLE_MAPS_API_KEY}
                  onChange={setDeliveryDetails}
                />

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-4 p-4 bg-accent/30 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{t("checkout.trust.secure")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>{t("checkout.trust.sameDay")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{t("checkout.trust.cutoff")}</span>
                  </div>
                </div>

                <Button
                  variant="clinical"
                  size="xl"
                  className="w-full"
                  onClick={handleContinueToPayment}
                >
                  {t("checkout.actions.continueToPayment")}
                </Button>
              </>
            )}

            {step === "payment" && (
              <>
                {/* Delivery Summary */}
                <div className="bg-accent/30 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {t("checkout.deliverySummary.label")}
                      </p>
                      <p className="font-medium">{deliveryDetails?.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {deliveryDetails?.address}, {deliveryDetails?.district}, {deliveryDetails?.city}
                      </p>
                      <p className="text-sm text-muted-foreground">{deliveryDetails?.phone}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep("details")}>
                      {t("common.edit")}
                    </Button>
                  </div>
                </div>

                {/* Payment Methods */}
                <PaymentMethodSelector
                  selectedMethod={selectedPaymentMethod}
                  onSelect={setSelectedPaymentMethod}
                />

                {/* Card Input */}
                {selectedPaymentMethod && (
                  <CardInputForm
                    paymentMethod={selectedPaymentMethod}
                    onChange={setCardDetails}
                  />
                )}

                <Button
                  variant="clinical"
                  size="xl"
                  className="w-full"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !selectedPaymentMethod}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      {t("common.processing")}
                    </span>
                  ) : (
                    t("common.placeOrder")
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              items={items}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;

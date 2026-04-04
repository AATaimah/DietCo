import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Truck, Clock, CheckCircle, BadgeInfo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { PaymentMethodSelector, PaymentMethod } from "@/components/checkout/PaymentMethodSelector";
import { CardInputForm } from "@/components/checkout/CardInputForm";
import { AddressInput, DeliveryDetails } from "@/components/checkout/AddressInput";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { CartItemType } from "@/components/cart/CartItem";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { createOrder, getProfile } from "@/lib/supabase";

// Get API key from environment or use placeholder
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();
  const { items, updateQuantity, removeItem, setItems, itemCount } = useCart();
  const { user, session, isAuthenticated } = useAuth();
  const didHydrateFromNavigationState = useRef(false);
  
  useEffect(() => {
    if (didHydrateFromNavigationState.current) return;
    didHydrateFromNavigationState.current = true;

    const state = location.state as { items?: CartItemType[] } | undefined;
    if (state?.items?.length && items.length === 0) {
      setItems(state.items);
    }
  }, [location.state, items.length, setItems]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails | null>(null);
  const [prefillDeliveryDetails, setPrefillDeliveryDetails] = useState<Partial<DeliveryDetails> | undefined>(
    undefined,
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<"details" | "payment" | "confirmation">("details");
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const isDesktopApplePayFlow = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(min-width: 1024px)").matches;
  }, []);
  const paymentMethodLabel = selectedPaymentMethod
    ? t(`payment.methodLabels.${selectedPaymentMethod}`)
    : "";

  const handleUpdateQuantity = (id: string, quantity: number) => {
    updateQuantity(id, quantity);
  };

  const handleRemove = (id: string) => {
    removeItem(id);
  };

  useEffect(() => {
    let isCancelled = false;

    const loadPrefillDetails = async () => {
      if (!isAuthenticated || !user) {
        if (!isCancelled) {
          setPrefillDeliveryDetails(undefined);
        }
        return;
      }

      const baseDetails: Partial<DeliveryDetails> = {
        accountType: user.accountType,
        fullName: user.fullName || "",
        clinicName: user.accountType === "clinic" ? user.clinicName || "" : "",
        email: user.email || "",
        phone: user.phone || "",
      };

      let nextDetails = { ...baseDetails };

      if (session?.accessToken) {
        try {
          const profile = await getProfile(session.accessToken, user.id);
          if (profile) {
            nextDetails = {
              ...nextDetails,
              fullName: profile.full_name || nextDetails.fullName,
              clinicName: profile.clinic_name || nextDetails.clinicName,
              phone: profile.phone || nextDetails.phone,
              address: profile.address_line1 || "",
              city: profile.address_city || "",
              district: profile.address_district || "",
              postalCode: profile.address_postal_code || "",
            };
          }
        } catch (error) {
          console.error("Failed to prefill checkout details from profile.", error);
        }
      }

      if (!isCancelled) {
        setPrefillDeliveryDetails(nextDetails);
      }
    };

    loadPrefillDetails();

    return () => {
      isCancelled = true;
    };
  }, [
    isAuthenticated,
    user?.id,
    user?.accountType,
    user?.fullName,
    user?.clinicName,
    user?.email,
    user?.phone,
    session?.accessToken,
    user,
  ]);

  const validateDeliveryDetails = () => {
    if (deliveryDetails?.accountType === "clinic" && !deliveryDetails?.clinicName?.trim()) {
      toast.error(t("checkout.validation.clinicName"));
      return false;
    }
    if (!deliveryDetails?.fullName?.trim()) {
      toast.error(t("checkout.validation.fullName"));
      return false;
    }
    if (!deliveryDetails?.email?.trim() || !deliveryDetails.email.includes("@")) {
      toast.error(t("checkout.validation.email"));
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
    return true;
  };

  const handleContinueToPayment = () => {
    if (!validateDeliveryDetails()) return;
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePlaceOrder = async () => {
    if (!validatePaymentDetails() || !deliveryDetails) return;

    setIsProcessing(true);

    try {
      const order = await createOrder(session?.accessToken, {
        userId: isAuthenticated && user ? user.id : null,
        accountType: deliveryDetails.accountType,
        buyerName: deliveryDetails.fullName.trim(),
        clinicName:
          deliveryDetails.accountType === "clinic"
            ? deliveryDetails.clinicName.trim() || null
            : null,
        email: deliveryDetails.email.trim(),
        phone: deliveryDetails.phone.trim(),
        address: deliveryDetails.address.trim(),
        city: deliveryDetails.city.trim(),
        district: deliveryDetails.district.trim() || null,
        postalCode: deliveryDetails.postalCode.trim() || null,
        additionalNotes: deliveryDetails.additionalNotes.trim() || null,
        items,
        status: "pending",
      });

      if (!order) {
        throw new Error(t("checkout.messages.orderSaveFailed"));
      }

      setPlacedOrderId(order.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("checkout.messages.orderSaveFailed");
      toast.error(message);
      setIsProcessing(false);
      return;
    }

    setIsProcessing(false);
    setStep("confirmation");
    setItems([]);
    toast.success(t("checkout.confirmation.toast"));
  };

  if (step === "confirmation") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 max-w-lg mx-auto text-center animate-fade-in">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center animate-scale-in">
            <CheckCircle className="h-10 w-10 text-success animate-pulse-soft" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{t("checkout.confirmation.title")}</h1>
          <p className="text-muted-foreground mb-6">
            {t("checkout.confirmation.subtitle")}
          </p>
          
          <div
            className="bg-card rounded-xl border border-border p-6 text-left mb-6 animate-fade-in"
            style={{ animationDelay: "120ms", animationFillMode: "both" }}
          >
            <h3 className="font-semibold mb-4">{t("checkout.confirmation.detailsTitle")}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("checkout.confirmation.orderNumber")}</span>
                <span className="font-medium">
                  {placedOrderId ? `#${placedOrderId.slice(0, 8)}` : `#MED-${Date.now().toString().slice(-6)}`}
                </span>
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

          <div
            className="flex flex-col gap-3 animate-fade-in"
            style={{ animationDelay: "220ms", animationFillMode: "both" }}
          >
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

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={itemCount} />

      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-background/75 backdrop-blur-sm animate-fade-in">
          <div className="h-full w-full flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-elevated animate-scale-in">
              <div className="relative mx-auto mb-5 h-20 w-20">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-soft" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full border-[3px] border-primary border-t-transparent animate-spin" />
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-2">
                {t("common.processing")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("checkout.processing.subtitle")}
              </p>
            </div>
          </div>
        </div>
      )}

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
                  initialValues={prefillDeliveryDetails}
                />

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-4 rounded-xl bg-accent/30 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{t("checkout.trust.secure")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>{t("checkout.trust.sameDay")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BadgeInfo className="h-4 w-4 text-primary" />
                    <span>{t("checkout.trust.vatIncluded")}</span>
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
                      {deliveryDetails?.accountType === "clinic" && (
                        <p className="font-medium">{deliveryDetails.clinicName}</p>
                      )}
                      <p className="font-medium">{deliveryDetails?.fullName}</p>
                      <p className="text-sm text-muted-foreground">{deliveryDetails?.email}</p>
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

                {selectedPaymentMethod && (
                  <CardInputForm
                    paymentMethod={selectedPaymentMethod}
                    isDesktopApplePayFlow={isDesktopApplePayFlow}
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
                    t("checkout.actions.continueToSecurePayment")
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

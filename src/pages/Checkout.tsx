import { useState, useEffect } from "react";
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
        name: "Gonal-F 75 IU Injection",
        packSize: "1 Pre-filled Pen",
        price: 450,
        currency: "SAR",
        quantity: 2,
      },
      {
        id: "2",
        name: "Menopur 75 IU",
        packSize: "Pack of 5 Vials",
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

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast.success("Item removed");
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success("Item removed");
  };

  const validateDeliveryDetails = () => {
    if (!deliveryDetails?.fullName?.trim()) {
      toast.error("Please enter your full name");
      return false;
    }
    if (!deliveryDetails?.phone?.trim()) {
      toast.error("Please enter your phone number");
      return false;
    }
    if (!deliveryDetails?.address?.trim()) {
      toast.error("Please enter your address");
      return false;
    }
    if (!deliveryDetails?.city?.trim()) {
      toast.error("Please enter your city");
      return false;
    }
    return true;
  };

  const validatePaymentDetails = () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method");
      return false;
    }
    if (selectedPaymentMethod !== "applepay") {
      if (!cardDetails?.cardNumber || cardDetails.cardNumber.replace(/\s/g, "").length < 16) {
        toast.error("Please enter a valid card number");
        return false;
      }
      if (!cardDetails?.expiryDate || cardDetails.expiryDate.length < 5) {
        toast.error("Please enter a valid expiry date");
        return false;
      }
      if (!cardDetails?.cvv || cardDetails.cvv.length < 3) {
        toast.error("Please enter a valid CVV");
        return false;
      }
      if (!cardDetails?.cardholderName?.trim()) {
        toast.error("Please enter the cardholder name");
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
    toast.success("Order placed successfully!");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Add some products to your cart to proceed with checkout.
          </p>
          <Button onClick={() => navigate("/")} variant="clinical">
            Browse Products
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
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order. We'll send you a confirmation email with tracking details.
          </p>
          
          <div className="bg-card rounded-xl border border-border p-6 text-left mb-6">
            <h3 className="font-semibold mb-4">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Number</span>
                <span className="font-medium">#MED-{Date.now().toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Delivery Address</span>
                <span className="font-medium text-right max-w-[200px]">
                  {deliveryDetails?.address}, {deliveryDetails?.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium capitalize">{selectedPaymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/")} variant="clinical" size="lg">
              Continue Shopping
            </Button>
            <Button onClick={() => navigate("/orders")} variant="outline" size="lg">
              View Orders
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
                <span className="text-xs text-muted-foreground">Delivery Details</span>
                <span className="text-xs text-muted-foreground">Payment</span>
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
                    <span>Secure Checkout</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-primary" />
                    <span>Same Day Delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Order Before 2 PM</span>
                  </div>
                </div>

                <Button
                  variant="clinical"
                  size="xl"
                  className="w-full"
                  onClick={handleContinueToPayment}
                >
                  Continue to Payment
                </Button>
              </>
            )}

            {step === "payment" && (
              <>
                {/* Delivery Summary */}
                <div className="bg-accent/30 rounded-xl p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Delivering to</p>
                      <p className="font-medium">{deliveryDetails?.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {deliveryDetails?.address}, {deliveryDetails?.district}, {deliveryDetails?.city}
                      </p>
                      <p className="text-sm text-muted-foreground">{deliveryDetails?.phone}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep("details")}>
                      Edit
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
                      Processing...
                    </span>
                  ) : (
                    "Place Order"
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

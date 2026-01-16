import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PaymentMethod } from "./PaymentMethodSelector";
import { cn } from "@/lib/utils";

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

interface CardInputFormProps {
  paymentMethod: PaymentMethod | null;
  onChange: (details: CardDetails) => void;
}

export function CardInputForm({ paymentMethod, onChange }: CardInputFormProps) {
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(" ").substring(0, 19) : "";
  };

  const formatExpiryDate = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length >= 2) {
      return numbers.substring(0, 2) + "/" + numbers.substring(2, 4);
    }
    return numbers;
  };

  const handleChange = (field: keyof CardDetails, value: string) => {
    let formattedValue = value;
    
    if (field === "cardNumber") {
      formattedValue = formatCardNumber(value);
    } else if (field === "expiryDate") {
      formattedValue = formatExpiryDate(value);
    } else if (field === "cvv") {
      formattedValue = value.replace(/\D/g, "").substring(0, 4);
    }

    const newDetails = { ...cardDetails, [field]: formattedValue };
    setCardDetails(newDetails);
    onChange(newDetails);
  };

  // Apple Pay doesn't need card input
  if (paymentMethod === "applepay") {
    return (
      <div className="bg-muted/50 rounded-xl p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foreground flex items-center justify-center">
          <svg className="w-8 h-8 text-background" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.0425 10.8467C17.0263 9.01867 18.5037 8.12667 18.5779 8.08067C17.6943 6.81467 16.3121 6.64867 15.8347 6.63267C14.6865 6.51267 13.5755 7.31867 12.9919 7.31867C12.3963 7.31867 11.4879 6.64667 10.5295 6.66667C9.27554 6.68667 8.10954 7.40467 7.47154 8.52067C6.16154 10.7887 7.13154 14.1627 8.38954 15.9987C9.01754 16.9007 9.75954 17.9067 10.7179 17.8707C11.6519 17.8307 12.0079 17.2667 13.1399 17.2667C14.2599 17.2667 14.5919 17.8707 15.5739 17.8467C16.5879 17.8307 17.2259 16.9447 17.8299 16.0347C18.5537 14.9947 18.8517 13.9747 18.8637 13.9227C18.8397 13.9147 17.0605 13.2287 17.0425 10.8467Z"/>
            <path d="M15.3502 5.11867C15.8622 4.49067 16.2182 3.62667 16.1182 2.75067C15.3742 2.78267 14.4542 3.26267 13.9182 3.87667C13.4422 4.42067 13.0142 5.31067 13.1262 6.15467C13.9622 6.22067 14.8262 5.73467 15.3502 5.11867Z"/>
          </svg>
        </div>
        <p className="font-medium text-foreground mb-1">Apple Pay</p>
        <p className="text-sm text-muted-foreground">
          You'll be prompted to confirm payment with Face ID or Touch ID
        </p>
      </div>
    );
  }

  const isMada = paymentMethod === "mada";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Your payment information is encrypted and secure</span>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="cardholderName">Cardholder Name</Label>
          <Input
            id="cardholderName"
            placeholder="Name on card"
            value={cardDetails.cardholderName}
            onChange={(e) => handleChange("cardholderName", e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative mt-1.5">
            <Input
              id="cardNumber"
              placeholder={isMada ? "xxxx xxxx xxxx xxxx" : "1234 5678 9012 3456"}
              value={cardDetails.cardNumber}
              onChange={(e) => handleChange("cardNumber", e.target.value)}
              className="pr-16"
              maxLength={19}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isMada ? (
                <div className="w-10 h-6 bg-gradient-to-r from-[#004D40] to-[#00796B] rounded flex items-center justify-center">
                  <span className="text-white font-bold text-[8px]">mada</span>
                </div>
              ) : (
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              placeholder="MM/YY"
              value={cardDetails.expiryDate}
              onChange={(e) => handleChange("expiryDate", e.target.value)}
              className="mt-1.5"
              maxLength={5}
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              placeholder="123"
              value={cardDetails.cvv}
              onChange={(e) => handleChange("cvv", e.target.value)}
              className="mt-1.5"
              maxLength={4}
              type="password"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

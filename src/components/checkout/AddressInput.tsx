import { useEffect, useRef, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

type BuyerType = "individual" | "clinic";

interface LocationData {
  address: string;
  city: string;
  district: string;
  postalCode: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface DeliveryDetails {
  accountType: BuyerType;
  fullName: string;
  clinicName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  additionalNotes: string;
  lat?: number;
  lng?: number;
}

const PREFILL_TEXT_FIELDS = [
  "fullName",
  "clinicName",
  "email",
  "phone",
  "address",
  "city",
  "district",
  "postalCode",
  "additionalNotes",
] as const;

interface AddressInputProps {
  apiKey: string;
  onChange: (details: DeliveryDetails) => void;
  initialValues?: Partial<DeliveryDetails>;
}

export function AddressInput({ apiKey, onChange, initialValues }: AddressInputProps) {
  const { t } = useI18n();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);

  const [details, setDetails] = useState<DeliveryDetails>({
    accountType: "individual",
    fullName: "",
    clinicName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
    additionalNotes: "",
  });

  const handleLocationSelect = (location: LocationData) => {
    const newDetails = {
      ...details,
      address: location.address || location.formattedAddress,
      city: location.city,
      district: location.district,
      postalCode: location.postalCode,
      lat: location.lat,
      lng: location.lng,
    };
    setDetails(newDetails);
    onChange(newDetails);
  };

  const { isLoaded, error, initMap } = useGoogleMaps({
    apiKey,
    onLocationSelect: handleLocationSelect,
  });

  useEffect(() => {
    if (isLoaded && mapContainerRef.current && searchInputRef.current && !isMapInitialized) {
      initMap(mapContainerRef.current, searchInputRef.current);
      setIsMapInitialized(true);
    }
  }, [isLoaded, initMap, isMapInitialized]);

  useEffect(() => {
    if (!initialValues) return;

    setDetails((previous) => {
      const next = { ...previous };

      if (initialValues.accountType) {
        next.accountType = initialValues.accountType;
      }

      for (const field of PREFILL_TEXT_FIELDS) {
        const incoming = initialValues[field];
        if (typeof incoming !== "string") continue;

        const hasIncomingValue = incoming.trim() !== "";
        if (!hasIncomingValue) continue;

        const current = previous[field];
        const isCurrentEmpty = typeof current === "string" ? current.trim() === "" : true;
        if (isCurrentEmpty) {
          next[field] = incoming;
        }
      }

      if (
        typeof initialValues.lat === "number" &&
        Number.isFinite(initialValues.lat) &&
        typeof initialValues.lng === "number" &&
        Number.isFinite(initialValues.lng) &&
        typeof previous.lat !== "number" &&
        typeof previous.lng !== "number"
      ) {
        next.lat = initialValues.lat;
        next.lng = initialValues.lng;
      }

      onChange(next);
      return next;
    });
  }, [initialValues, onChange]);

  const handleChange = (field: keyof DeliveryDetails, value: string) => {
    const newDetails = { ...details, [field]: value };
    setDetails(newDetails);
    onChange(newDetails);
  };

  const handleAccountTypeChange = (accountType: BuyerType) => {
    const newDetails = {
      ...details,
      accountType,
      clinicName: accountType === "clinic" ? details.clinicName : "",
    };
    setDetails(newDetails);
    onChange(newDetails);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        {t("address.title")}
      </h3>

      <div className="space-y-2">
        <Label>{t("address.orderingAs")}</Label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={cn(
              "rounded-md border px-3 py-2 text-sm transition-colors",
              details.accountType === "individual"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:bg-accent",
            )}
            onClick={() => handleAccountTypeChange("individual")}
          >
            {t("address.accountTypes.individual")}
          </button>
          <button
            type="button"
            className={cn(
              "rounded-md border px-3 py-2 text-sm transition-colors",
              details.accountType === "clinic"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-foreground hover:bg-accent",
            )}
            onClick={() => handleAccountTypeChange("clinic")}
          >
            {t("address.accountTypes.clinic")}
          </button>
        </div>
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.accountType === "clinic" && (
          <div>
            <Label htmlFor="clinicName">{t("address.fields.clinicName")}</Label>
            <Input
              id="clinicName"
              placeholder={t("address.placeholders.clinicName")}
              value={details.clinicName}
              onChange={(event) => handleChange("clinicName", event.target.value)}
              className="mt-1.5"
            />
          </div>
        )}
        <div>
          <Label htmlFor="fullName">
            {details.accountType === "clinic"
              ? t("address.fields.contactName")
              : t("address.fields.fullName")}
          </Label>
          <Input
            id="fullName"
            placeholder={
              details.accountType === "clinic"
                ? t("address.placeholders.contactName")
                : t("address.placeholders.fullName")
            }
            value={details.fullName}
            onChange={(event) => handleChange("fullName", event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="email">{t("address.fields.email")}</Label>
          <Input
            id="email"
            type="email"
            placeholder={t("address.placeholders.email")}
            value={details.email}
            onChange={(event) => handleChange("email", event.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="phone">{t("address.fields.phone")}</Label>
          <Input
            id="phone"
            placeholder={t("address.placeholders.phone")}
            value={details.phone}
            onChange={(event) => handleChange("phone", event.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Map Section */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder={t("address.searchPlaceholder")}
            className="pl-10"
            disabled={!isLoaded}
          />
        </div>

        <div
          ref={mapContainerRef}
          className="w-full h-[250px] rounded-xl bg-muted overflow-hidden border border-border"
        >
          {!isLoaded && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">{t("address.loadingMap")}</p>
              </div>
            </div>
          )}
          {error && (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">{t("address.mapHint")}</p>
      </div>

      {/* Address Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="address">{t("address.fields.address")}</Label>
          <Input
            id="address"
            placeholder={t("address.placeholders.address")}
            value={details.address}
            onChange={(event) => handleChange("address", event.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">{t("address.fields.city")}</Label>
            <Input
              id="city"
              placeholder={t("address.placeholders.city")}
              value={details.city}
              onChange={(event) => handleChange("city", event.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="district">{t("address.fields.district")}</Label>
            <Input
              id="district"
              placeholder={t("address.placeholders.district")}
              value={details.district}
              onChange={(event) => handleChange("district", event.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="postalCode">{t("address.fields.postalCode")}</Label>
            <Input
              id="postalCode"
              placeholder={t("address.placeholders.postalCode")}
              value={details.postalCode}
              onChange={(event) => handleChange("postalCode", event.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="additionalNotes">{t("address.fields.notes")}</Label>
          <Input
            id="additionalNotes"
            placeholder={t("address.placeholders.notes")}
            value={details.additionalNotes}
            onChange={(event) => handleChange("additionalNotes", event.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}

export type { BuyerType };

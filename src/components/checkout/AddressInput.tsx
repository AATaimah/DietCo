import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

interface LocationData {
  address: string;
  city: string;
  district: string;
  postalCode: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

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

interface AddressInputProps {
  apiKey: string;
  onChange: (details: DeliveryDetails) => void;
}

export function AddressInput({ apiKey, onChange }: AddressInputProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  
  const [details, setDetails] = useState<DeliveryDetails>({
    fullName: "",
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

  const handleChange = (field: keyof DeliveryDetails, value: string) => {
    const newDetails = { ...details, [field]: value };
    setDetails(newDetails);
    onChange(newDetails);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        Delivery Address
      </h3>

      {/* Map Section */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search for your address in Saudi Arabia..."
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
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Click on the map or drag the marker to set your exact delivery location
        </p>
      </div>

      {/* Contact Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Enter your full name"
            value={details.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            placeholder="+966 5x xxx xxxx"
            value={details.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>

      {/* Address Details */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="address">Street Address *</Label>
          <Input
            id="address"
            placeholder="Building number, street name"
            value={details.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="e.g., Riyadh"
              value={details.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="district">District</Label>
            <Input
              id="district"
              placeholder="e.g., Al Olaya"
              value={details.district}
              onChange={(e) => handleChange("district", e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              placeholder="e.g., 12345"
              value={details.postalCode}
              onChange={(e) => handleChange("postalCode", e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="additionalNotes">Delivery Notes (Optional)</Label>
          <Input
            id="additionalNotes"
            placeholder="Gate code, landmark, special instructions..."
            value={details.additionalNotes}
            onChange={(e) => handleChange("additionalNotes", e.target.value)}
            className="mt-1.5"
          />
        </div>
      </div>
    </div>
  );
}

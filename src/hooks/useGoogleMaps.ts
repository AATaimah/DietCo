import { useState, useEffect, useRef, useCallback } from "react";
import { useI18n } from "@/i18n";

interface LocationData {
  address: string;
  city: string;
  district: string;
  postalCode: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

interface UseGoogleMapsProps {
  apiKey: string;
  onLocationSelect?: (location: LocationData) => void;
}

export function useGoogleMaps({ apiKey, onLocationSelect }: UseGoogleMapsProps) {
  const { t } = useI18n();
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const onLocationSelectRef = useRef(onLocationSelect);

  // Keep ref updated
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    if (!apiKey) {
      setError(t("address.errors.apiKeyRequired"));
      return;
    }

    const googleMapsWindow = window as Window & {
      google?: any;
      gm_authFailure?: () => void;
      __dietcoGoogleMapsReady__?: () => void;
    };
    const existingScript = document.getElementById("dietco-google-maps-script") as HTMLScriptElement | null;
    let timeoutId: number | undefined;

    const markLoadFailed = () => {
      setError(t("address.errors.loadFailed"));
      setIsLoaded(false);
    };

    const markLoaded = () => {
      if (googleMapsWindow.google?.maps?.places) {
        setError(null);
        setIsLoaded(true);
        return;
      }

      markLoadFailed();
    };

    // Check if already loaded
    if (googleMapsWindow.google?.maps?.places) {
      setError(null);
      setIsLoaded(true);
      return;
    }

    googleMapsWindow.__dietcoGoogleMapsReady__ = markLoaded;
    googleMapsWindow.gm_authFailure = markLoadFailed;

    if (existingScript) {
      existingScript.addEventListener("load", markLoaded);
      existingScript.addEventListener("error", markLoadFailed);
    } else {
      const script = document.createElement("script");
      script.id = "dietco-google-maps-script";
      script.src =
        `https://maps.googleapis.com/maps/api/js?key=${apiKey}` +
        `&libraries=places,geometry&loading=async&callback=__dietcoGoogleMapsReady__`;
      script.async = true;
      script.defer = true;

      script.onerror = markLoadFailed;
      document.head.appendChild(script);
    }

    timeoutId = window.setTimeout(() => {
      if (!googleMapsWindow.google?.maps?.places) {
        markLoadFailed();
      }
    }, 10000);

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }

      if (existingScript) {
        existingScript.removeEventListener("load", markLoaded);
        existingScript.removeEventListener("error", markLoadFailed);
      }

      if (googleMapsWindow.__dietcoGoogleMapsReady__ === markLoaded) {
        delete googleMapsWindow.__dietcoGoogleMapsReady__;
      }

      if (googleMapsWindow.gm_authFailure === markLoadFailed) {
        delete googleMapsWindow.gm_authFailure;
      }
    };
  }, [apiKey, t]);

  const extractLocationData = useCallback((place: any): LocationData => {
    const components = place.address_components || [];
    
    let address = "";
    let city = "";
    let district = "";
    let postalCode = "";

    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes("street_number") || types.includes("route")) {
        address += (address ? " " : "") + component.long_name;
      }
      if (types.includes("locality") || types.includes("administrative_area_level_2")) {
        city = component.long_name;
      }
      if (types.includes("sublocality") || types.includes("neighborhood")) {
        district = component.long_name;
      }
      if (types.includes("postal_code")) {
        postalCode = component.long_name;
      }
    });

    const location = place.geometry?.location;
    const lat = location ? (typeof location.lat === "function" ? location.lat() : location.lat || 0) : 0;
    const lng = location ? (typeof location.lng === "function" ? location.lng() : location.lng || 0) : 0;

    return {
      address: address || place.formatted_address || "",
      city,
      district,
      postalCode,
      lat,
      lng,
      formattedAddress: place.formatted_address || "",
    };
  }, []);

  const reverseGeocode = useCallback((latLng: any) => {
    const google = (window as any).google;
    if (!google) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: latLng }, (results: any[], status: string) => {
      if (status === "OK" && results?.[0]) {
        const locationData = extractLocationData(results[0]);
        locationData.lat = typeof latLng.lat === "function" ? latLng.lat() : latLng.lat;
        locationData.lng = typeof latLng.lng === "function" ? latLng.lng() : latLng.lng;
        onLocationSelectRef.current?.(locationData);
      }
    });
  }, [extractLocationData]);

  const initMap = useCallback(
    (mapElement: HTMLElement, inputElement: HTMLInputElement) => {
      const google = (window as any).google;
      if (!isLoaded || !google?.maps) return;

      // Default to Riyadh, Saudi Arabia
      const defaultCenter = { lat: 24.7136, lng: 46.6753 };

      // Initialize map
      mapRef.current = new google.maps.Map(mapElement, {
        center: defaultCenter,
        zoom: 12,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      // Initialize marker
      markerRef.current = new google.maps.Marker({
        map: mapRef.current,
        draggable: true,
        animation: google.maps.Animation.DROP,
      });

      // Initialize autocomplete
      autocompleteRef.current = new google.maps.places.Autocomplete(inputElement, {
        componentRestrictions: { country: "sa" },
        fields: ["address_components", "geometry", "formatted_address"],
        types: ["address"],
      });

      // Handle place selection
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        
        if (place?.geometry?.location) {
          const location = place.geometry.location;
          mapRef.current?.setCenter(location);
          mapRef.current?.setZoom(16);
          markerRef.current?.setPosition(location);

          const locationData = extractLocationData(place);
          onLocationSelectRef.current?.(locationData);
        }
      });

      // Handle marker drag
      markerRef.current.addListener("dragend", () => {
        const position = markerRef.current?.getPosition();
        if (position) {
          reverseGeocode(position);
        }
      });

      // Handle map click
      mapRef.current.addListener("click", (e: any) => {
        if (e.latLng) {
          markerRef.current?.setPosition(e.latLng);
          reverseGeocode(e.latLng);
        }
      });

      // Try to get user's current location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            mapRef.current?.setCenter(pos);
            markerRef.current?.setPosition(pos);
            reverseGeocode(new google.maps.LatLng(pos.lat, pos.lng));
          },
          () => {
            // User denied location, keep default
          }
        );
      }
    },
    [isLoaded, extractLocationData, reverseGeocode]
  );

  return {
    isLoaded,
    error,
    initMap,
  };
}

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import {
  getOrders,
  getProfile,
  OrderRecord,
  updateProfile,
  upsertProfile,
} from "@/lib/supabase";
import { toast } from "sonner";

interface ProfileFormState {
  fullName: string;
  clinicName: string;
  phone: string;
  addressLine1: string;
  addressCity: string;
  addressDistrict: string;
  addressPostalCode: string;
  paymentCardholderName: string;
  paymentBrand: string;
  paymentLast4: string;
  paymentExpMonth: string;
  paymentExpYear: string;
}

const emptyFormState: ProfileFormState = {
  fullName: "",
  clinicName: "",
  phone: "",
  addressLine1: "",
  addressCity: "",
  addressDistrict: "",
  addressPostalCode: "",
  paymentCardholderName: "",
  paymentBrand: "",
  paymentLast4: "",
  paymentExpMonth: "",
  paymentExpYear: "",
};

const toNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const Profile = () => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const { user, session, isAuthenticated, isLoading, logout } = useAuth();

  const [form, setForm] = useState<ProfileFormState>(emptyFormState);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth?next=/profile", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    setForm((previous) => ({
      ...previous,
      fullName: previous.fullName || user.fullName || "",
      clinicName: previous.clinicName || user.clinicName || "",
      phone: previous.phone || user.phone || "",
    }));
  }, [user]);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!session?.accessToken || !user?.id) return;
      try {
        setIsLoadingData(true);
        const [profileData, orderData] = await Promise.all([
          getProfile(session.accessToken, user.id),
          getOrders(session.accessToken, user.id),
        ]);

        setOrders(orderData);

        if (!profileData) return;
        setForm({
          fullName: profileData.full_name || user.fullName || "",
          clinicName: profileData.clinic_name || user.clinicName || "",
          phone: profileData.phone || user.phone || "",
          addressLine1: profileData.address_line1 || "",
          addressCity: profileData.address_city || "",
          addressDistrict: profileData.address_district || "",
          addressPostalCode: profileData.address_postal_code || "",
          paymentCardholderName: profileData.payment_cardholder_name || "",
          paymentBrand: profileData.payment_brand || "",
          paymentLast4: profileData.payment_last4 || "",
          paymentExpMonth: profileData.payment_exp_month || "",
          paymentExpYear: profileData.payment_exp_year || "",
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : t("profile.messages.loadError");
        toast.error(message);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadProfileData();
  }, [session?.accessToken, user?.id, user?.fullName, user?.clinicName, user?.phone, t]);

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));

  const getOrderItemCount = (items: unknown) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce((total, item) => {
      if (!item || typeof item !== "object") return total + 1;
      const quantity = (item as { quantity?: unknown }).quantity;
      if (typeof quantity === "number" && Number.isFinite(quantity)) {
        return total + quantity;
      }
      return total + 1;
    }, 0);
  };

  const saveDisabled = useMemo(() => isSaving || !isAuthenticated || !session?.accessToken || !user?.id, [
    isSaving,
    isAuthenticated,
    session?.accessToken,
    user?.id,
  ]);

  const handleSave = async () => {
    if (!session?.accessToken || !user?.id) return;

    if (!form.fullName.trim()) {
      toast.error(t("auth.validation.fullName"));
      return;
    }
    if (user.accountType === "clinic" && !form.clinicName.trim()) {
      toast.error(t("auth.validation.clinicName"));
      return;
    }
    if (!form.phone.trim()) {
      toast.error(t("checkout.validation.phone"));
      return;
    }
    if (form.paymentLast4 && !/^\d{4}$/.test(form.paymentLast4)) {
      toast.error(t("profile.messages.cardLast4Invalid"));
      return;
    }
    if (form.paymentExpMonth) {
      const month = Number(form.paymentExpMonth);
      if (!Number.isInteger(month) || month < 1 || month > 12) {
        toast.error(t("profile.messages.cardMonthInvalid"));
        return;
      }
    }
    if (form.paymentExpYear && !/^\d{2,4}$/.test(form.paymentExpYear)) {
      toast.error(t("profile.messages.cardYearInvalid"));
      return;
    }

    try {
      setIsSaving(true);

      let updated = await updateProfile(session.accessToken, user.id, {
        fullName: form.fullName.trim(),
        clinicName: user.accountType === "clinic" ? toNullable(form.clinicName) : null,
        phone: form.phone.trim(),
        addressLine1: toNullable(form.addressLine1),
        addressCity: toNullable(form.addressCity),
        addressDistrict: toNullable(form.addressDistrict),
        addressPostalCode: toNullable(form.addressPostalCode),
        paymentCardholderName: toNullable(form.paymentCardholderName),
        paymentBrand: toNullable(form.paymentBrand),
        paymentLast4: toNullable(form.paymentLast4),
        paymentExpMonth: toNullable(form.paymentExpMonth),
        paymentExpYear: toNullable(form.paymentExpYear),
      });

      if (!updated) {
        await upsertProfile(session.accessToken, {
          userId: user.id,
          accountType: user.accountType,
          fullName: form.fullName.trim(),
          clinicName: user.accountType === "clinic" ? toNullable(form.clinicName) : null,
          phone: form.phone.trim(),
          addressLine1: toNullable(form.addressLine1),
          addressCity: toNullable(form.addressCity),
          addressDistrict: toNullable(form.addressDistrict),
          addressPostalCode: toNullable(form.addressPostalCode),
          paymentCardholderName: toNullable(form.paymentCardholderName),
          paymentBrand: toNullable(form.paymentBrand),
          paymentLast4: toNullable(form.paymentLast4),
          paymentExpMonth: toNullable(form.paymentExpMonth),
          paymentExpYear: toNullable(form.paymentExpYear),
        });

        updated = await updateProfile(session.accessToken, user.id, {
          fullName: form.fullName.trim(),
          clinicName: user.accountType === "clinic" ? toNullable(form.clinicName) : null,
          phone: form.phone.trim(),
          addressLine1: toNullable(form.addressLine1),
          addressCity: toNullable(form.addressCity),
          addressDistrict: toNullable(form.addressDistrict),
          addressPostalCode: toNullable(form.addressPostalCode),
          paymentCardholderName: toNullable(form.paymentCardholderName),
          paymentBrand: toNullable(form.paymentBrand),
          paymentLast4: toNullable(form.paymentLast4),
          paymentExpMonth: toNullable(form.paymentExpMonth),
          paymentExpYear: toNullable(form.paymentExpYear),
        });
      }

      if (updated) {
        setForm({
          fullName: updated.full_name || "",
          clinicName: updated.clinic_name || "",
          phone: updated.phone || "",
          addressLine1: updated.address_line1 || "",
          addressCity: updated.address_city || "",
          addressDistrict: updated.address_district || "",
          addressPostalCode: updated.address_postal_code || "",
          paymentCardholderName: updated.payment_cardholder_name || "",
          paymentBrand: updated.payment_brand || "",
          paymentLast4: updated.payment_last4 || "",
          paymentExpMonth: updated.payment_exp_month || "",
          paymentExpYear: updated.payment_exp_year || "",
        });
      }

      toast.success(t("profile.messages.saved"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t("profile.messages.saveError");
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || (!isAuthenticated && !user)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <p className="text-muted-foreground">{t("profile.messages.loading")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 md:py-10">
        <div className="mb-6">
          <h1 className="text-foreground mb-2">{t("profile.title")}</h1>
          <p className="text-muted-foreground">{t("profile.subtitle")}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="card-clinical space-y-4">
              <h2 className="font-semibold text-lg">{t("profile.sections.account")}</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="profile-email">{t("auth.fields.email")}</Label>
                  <Input id="profile-email" value={user?.email || ""} disabled className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="profile-account-type">{t("auth.fields.accountType")}</Label>
                  <Input
                    id="profile-account-type"
                    value={user?.accountType === "clinic" ? t("auth.accountTypes.clinic") : t("auth.accountTypes.individual")}
                    disabled
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-fullname">
                    {user?.accountType === "clinic" ? t("auth.fields.contactName") : t("auth.fields.fullName")}
                  </Label>
                  <Input
                    id="profile-fullname"
                    value={form.fullName}
                    onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                {user?.accountType === "clinic" && (
                  <div>
                    <Label htmlFor="profile-clinic-name">{t("auth.fields.clinicName")}</Label>
                    <Input
                      id="profile-clinic-name"
                      value={form.clinicName}
                      onChange={(event) => setForm((prev) => ({ ...prev, clinicName: event.target.value }))}
                      className="mt-1.5"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="profile-phone">{t("auth.fields.phone")}</Label>
                  <Input
                    id="profile-phone"
                    value={form.phone}
                    onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </section>

            <section className="card-clinical space-y-4">
              <h2 className="font-semibold text-lg">{t("profile.sections.address")}</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="profile-address-line1">{t("address.fields.address")}</Label>
                  <Input
                    id="profile-address-line1"
                    value={form.addressLine1}
                    onChange={(event) => setForm((prev) => ({ ...prev, addressLine1: event.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-address-city">{t("address.fields.city")}</Label>
                  <Input
                    id="profile-address-city"
                    value={form.addressCity}
                    onChange={(event) => setForm((prev) => ({ ...prev, addressCity: event.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-address-district">{t("address.fields.district")}</Label>
                  <Input
                    id="profile-address-district"
                    value={form.addressDistrict}
                    onChange={(event) => setForm((prev) => ({ ...prev, addressDistrict: event.target.value }))}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-address-postal">{t("address.fields.postalCode")}</Label>
                  <Input
                    id="profile-address-postal"
                    value={form.addressPostalCode}
                    onChange={(event) => setForm((prev) => ({ ...prev, addressPostalCode: event.target.value }))}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </section>

            <section className="card-clinical space-y-4">
              <h2 className="font-semibold text-lg">{t("profile.sections.payment")}</h2>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="profile-payment-cardholder">{t("payment.fields.cardholderName")}</Label>
                  <Input
                    id="profile-payment-cardholder"
                    value={form.paymentCardholderName}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, paymentCardholderName: event.target.value }))
                    }
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-payment-brand">{t("profile.payment.cardBrand")}</Label>
                  <Input
                    id="profile-payment-brand"
                    value={form.paymentBrand}
                    onChange={(event) => setForm((prev) => ({ ...prev, paymentBrand: event.target.value }))}
                    className="mt-1.5"
                    placeholder={t("profile.payment.brandPlaceholder")}
                  />
                </div>
                <div>
                  <Label htmlFor="profile-payment-last4">{t("profile.payment.cardLast4")}</Label>
                  <Input
                    id="profile-payment-last4"
                    value={form.paymentLast4}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        paymentLast4: event.target.value.replace(/\D/g, "").slice(0, 4),
                      }))
                    }
                    className="mt-1.5"
                    placeholder="1234"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="profile-payment-month">{t("profile.payment.expMonth")}</Label>
                    <Input
                      id="profile-payment-month"
                      value={form.paymentExpMonth}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          paymentExpMonth: event.target.value.replace(/\D/g, "").slice(0, 2),
                        }))
                      }
                      className="mt-1.5"
                      placeholder="MM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="profile-payment-year">{t("profile.payment.expYear")}</Label>
                    <Input
                      id="profile-payment-year"
                      value={form.paymentExpYear}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          paymentExpYear: event.target.value.replace(/\D/g, "").slice(0, 4),
                        }))
                      }
                      className="mt-1.5"
                      placeholder="YYYY"
                    />
                  </div>
                </div>
              </div>
            </section>

            <div className="flex justify-end">
              <Button variant="clinical" size="lg" onClick={handleSave} disabled={saveDisabled}>
                {isSaving ? t("common.processing") : t("profile.actions.save")}
              </Button>
            </div>
          </div>

          <aside className="space-y-6">
            <section className="card-clinical space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">{t("profile.sections.orders")}</h2>
                {isLoadingData && <span className="text-xs text-muted-foreground">{t("profile.messages.loading")}</span>}
              </div>

              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("profile.orders.empty")}</p>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="rounded-lg border border-border p-3">
                      <div className="mb-1 flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold">#{order.id.slice(0, 8)}</span>
                        <span className="rounded bg-muted px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(order.created_at)}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("profile.orders.itemsCount", { count: getOrderItemCount(order.items) })}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.city}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
            >
              {t("profile.actions.logout")}
            </Button>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Profile;

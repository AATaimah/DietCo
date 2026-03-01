import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { getOrders, OrderRecord } from "@/lib/supabase";
import { toast } from "sonner";

const Orders = () => {
  const navigate = useNavigate();
  const { t, locale } = useI18n();
  const { isLoading, isAuthenticated, user, session } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/auth?next=/orders", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!isAuthenticated || !user?.id || !session?.accessToken) return;

      try {
        setLoadingOrders(true);
        const orderData = await getOrders(session.accessToken, user.id);
        setOrders(orderData);
      } catch (error) {
        const message = error instanceof Error ? error.message : t("orders.messages.loadError");
        toast.error(message);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [isAuthenticated, session?.accessToken, t, user?.id]);

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

  if (isLoading || (!isAuthenticated && !user)) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <p className="text-muted-foreground">{t("orders.messages.loading")}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8 md:py-10">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-foreground mb-2">{t("orders.title")}</h1>
            <p className="text-muted-foreground">{t("orders.subtitle")}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/order")}>
            {t("checkout.empty.cta")}
          </Button>
        </div>

        {loadingOrders ? (
          <div className="card-clinical text-center text-muted-foreground">
            {t("orders.messages.loading")}
          </div>
        ) : orders.length === 0 ? (
          <div className="card-clinical text-center">
            <h2 className="font-semibold mb-2">{t("orders.empty.title")}</h2>
            <p className="text-muted-foreground mb-4">{t("orders.empty.subtitle")}</p>
            <Button variant="clinical" onClick={() => navigate("/order")}>
              {t("orders.empty.cta")}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="card-clinical">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-semibold">#{order.id.slice(0, 8)}</span>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>{formatDate(order.created_at)}</p>
                  <p>{t("orders.itemsCount", { count: getOrderItemCount(order.items) })}</p>
                  <p>{order.city}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;

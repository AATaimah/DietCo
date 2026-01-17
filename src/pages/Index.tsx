import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { categories, products } from "@/data/mockProducts";
import { useI18n } from "@/i18n";
import {
  BadgeCheck,
  Building2,
  Clock,
  ClipboardCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

const Index = () => {
  const { t, locale } = useI18n();
  const featuredCategories = categories.filter((category) => category.id !== "all");
  const featuredProducts = products.slice(0, 6);
  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/30 border-b border-border">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-4">
              {t("home.hero.eyebrow")}
            </p>
            <h1 className="text-foreground mb-4">
              {t("home.hero.title")}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="clinical">
                <Link to="/order">{t("home.hero.primaryCta")}</Link>
              </Button>
              <Button asChild size="lg" variant="clinical-outline">
                <Link to="/contact">{t("home.hero.secondaryCta")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="container py-8">
          <div className="grid gap-4 md:grid-cols-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>{t("home.trust.verifiedSupply")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <span>{t("home.trust.sameDay")}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <span>{t("home.trust.visibility")}</span>
            </div>
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <span>{t("home.trust.licensed")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] items-start">
          <div>
            <h2 className="text-foreground mb-3">{t("home.audience.title")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("home.audience.subtitle")}
            </p>
          </div>
          <div className="grid gap-4">
            <div className="card-clinical">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">{t("home.audience.individuals.title")}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("home.audience.individuals.body")}
              </p>
            </div>
            <div className="card-clinical">
              <div className="flex items-center gap-3 mb-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">{t("home.audience.clinics.title")}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("home.audience.clinics.body")}
              </p>
            </div>
            <div className="card-clinical">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">{t("home.audience.pharmacies.title")}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                {t("home.audience.pharmacies.body")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 border-y border-border">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl mb-8">
            <h2 className="text-foreground mb-3">{t("home.process.title")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("home.process.subtitle")}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: t("home.process.steps.request.title"),
                description: t("home.process.steps.request.body"),
              },
              {
                title: t("home.process.steps.verify.title"),
                description: t("home.process.steps.verify.body"),
              },
              {
                title: t("home.process.steps.deliver.title"),
                description: t("home.process.steps.deliver.body"),
              },
            ].map((step, index) => (
              <div key={step.title} className="card-clinical">
                <p className="text-sm text-primary font-semibold mb-2">
                  {t("home.process.stepLabel", { number: index + 1 })}
                </p>
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-foreground mb-2">{t("home.catalog.title")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("home.catalog.subtitle")}
            </p>
          </div>
          <Button asChild size="lg" variant="clinical">
            <Link to="/order">{t("home.catalog.cta")}</Link>
          </Button>
        </div>
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))] gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="aspect-square bg-muted/50 relative overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={t(product.nameKey)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                    {t("home.catalog.noImage")}
                  </div>
                )}
              </div>
              <div className="p-4 space-y-2">
                <h3 className="font-semibold text-foreground line-clamp-2">
                  {t(product.nameKey)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(product.packSizeKey)}
                </p>
                <span className="price text-foreground">
                  {formatPrice(product.price, product.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-foreground mb-2">{t("home.featured.title")}</h2>
            <p className="text-muted-foreground text-lg">
              {t("home.featured.subtitle")}
            </p>
          </div>
          <Button asChild size="lg" variant="clinical">
            <Link to="/order">{t("home.featured.cta")}</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {featuredCategories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm text-foreground bg-card"
            >
              {t(category.labelKey)}
            </span>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-3">
            <img src="/favicon.ico" alt="DietCo" className="h-8 w-8 rounded-lg" />
            <span className="font-semibold text-foreground">DietCo</span>
          </div>
          <span>{t("home.footer.copyright")}</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;

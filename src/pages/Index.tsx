import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { categories } from "@/data/mockProducts";
import {
  BadgeCheck,
  Building2,
  Clock,
  ClipboardCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";

const Index = () => {
  const featuredCategories = categories.filter((category) => category.id !== "all");

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/30 border-b border-border">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold text-primary tracking-[0.2em] uppercase mb-4">
              Clinical supply partner
            </p>
            <h1 className="text-foreground mb-4">
              Specialty medications and fertility treatments, delivered with
              clinical precision.
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              DietCo helps clinics place verified orders in minutes, with
              consistent availability, cold-chain handling, and transparent
              fulfillment across Saudi Arabia.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" variant="clinical">
                <Link to="/order">Place Order</Link>
              </Button>
              <Button asChild size="lg" variant="clinical-outline">
                <Link to="/contact">Contact Sales</Link>
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
              <span>Verified supply chain</span>
            </div>
            <div className="flex items-center gap-3">
              <Truck className="h-5 w-5 text-primary" />
              <span>Same-day metro delivery</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <span>24/7 order visibility</span>
            </div>
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-primary" />
              <span>Licensed distribution</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] items-start">
          <div>
            <h2 className="text-foreground mb-3">Built for clinical teams</h2>
            <p className="text-muted-foreground text-lg">
              We work with fertility centers, specialty pharmacies, and hospital
              procurement teams that need reliable access to critical therapies.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="card-clinical">
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">Fertility Clinics</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                IVF, hormone, and injectable therapies with predictable lead
                times.
              </p>
            </div>
            <div className="card-clinical">
              <div className="flex items-center gap-3 mb-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">Specialty Pharmacies</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Bulk fulfillment, batch traceability, and invoice-ready
                workflows.
              </p>
            </div>
            <div className="card-clinical">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="text-base font-semibold">Hospital Teams</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Secure ordering with escalation paths for urgent sourcing.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 border-y border-border">
        <div className="container py-12 md:py-16">
          <div className="max-w-3xl mb-8">
            <h2 className="text-foreground mb-3">How ordering works</h2>
            <p className="text-muted-foreground text-lg">
              A clear, compliant workflow designed for procurement and clinical
              staff.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Request",
                description:
                  "Build a cart with available therapies and submit your order request.",
              },
              {
                title: "Verify",
                description:
                  "We confirm inventory, licensing, and cold-chain requirements.",
              },
              {
                title: "Deliver",
                description:
                  "Scheduled delivery with tracking and documentation included.",
              },
            ].map((step, index) => (
              <div key={step.title} className="card-clinical">
                <p className="text-sm text-primary font-semibold mb-2">
                  Step {index + 1}
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
            <h2 className="text-foreground mb-2">Featured categories</h2>
            <p className="text-muted-foreground text-lg">
              Start with the most requested therapies for fertility and
              specialty care.
            </p>
          </div>
          <Button asChild size="lg" variant="clinical">
            <Link to="/order">Place Order</Link>
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
          {featuredCategories.map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm text-foreground bg-card"
            >
              {category.name}
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
          <span>© 2026 DietCo. Licensed healthcare marketplace serving Saudi Arabia.</span>
        </div>
      </footer>
    </div>
  );
};

export default Index;

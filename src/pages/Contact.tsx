import type { FormEvent } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";

const Contact = () => {
  const contactEmail = "orders@dietco.sa";
  const whatsappNumber = "9661100000000";

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const organization = String(data.get("organization") || "").trim();
    const message = String(data.get("message") || "").trim();
    const subject = encodeURIComponent(
      `DietCo request${name ? ` - ${name}` : ""}`,
    );
    const body = encodeURIComponent(
      [
        `Name: ${name || "-"}`,
        `Email: ${email || "-"}`,
        `Phone: ${phone || "-"}`,
        `Organization: ${organization || "-"}`,
        "",
        "Request details:",
        message || "-",
      ].join("\n"),
    );

    window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.05fr_1.2fr] items-start">
          <div className="space-y-6">
            <div>
              <h1 className="text-foreground mb-3">Contact us</h1>
              <p className="text-muted-foreground text-lg max-w-md">
                For complex orders, onboarding, or delivery coordination, reach
                our team directly.
              </p>
            </div>

            <div className="grid gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>{contactEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span>+966 11 000 0000</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Riyadh, Saudi Arabia</span>
              </div>
            </div>

            <Button asChild variant="clinical-outline">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                Message on WhatsApp
              </a>
            </Button>
          </div>

          <form className="card-clinical space-y-4" onSubmit={handleContactSubmit}>
            <div>
              <h2 className="text-lg font-semibold mb-1">Request a quote</h2>
              <p className="text-sm text-muted-foreground">
                Tell us what you need and we will respond within one business
                day.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Full name</Label>
                <Input id="contact-name" name="name" placeholder="Full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-organization">Clinic / Company</Label>
                <Input
                  id="contact-organization"
                  name="organization"
                  placeholder="Organization"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder="name@clinic.sa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  placeholder="+966 5X XXX XXXX"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">Request details</Label>
              <Textarea
                id="contact-message"
                name="message"
                placeholder="Product names, quantities, and delivery timing."
              />
            </div>
            <Button type="submit" variant="clinical" size="lg" className="w-full">
              Send request
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Contact;

import type { FormEvent } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { useI18n } from "@/i18n";

const Contact = () => {
  const { t } = useI18n();
  const contactEmail = "orders@dietco.sa";
  const contactPhone = "+966 11 000 0000";
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
      `${t("contact.email.subject")}${name ? ` - ${name}` : ""}`,
    );
    const body = encodeURIComponent(
      [
        `${t("contact.email.name")}: ${name || "-"}`,
        `${t("contact.email.email")}: ${email || "-"}`,
        `${t("contact.email.phone")}: ${phone || "-"}`,
        `${t("contact.email.organization")}: ${organization || "-"}`,
        "",
        `${t("contact.email.details")}:`,
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
              <h1 className="text-foreground mb-3">{t("contact.title")}</h1>
              <p className="text-muted-foreground text-lg max-w-md">
                {t("contact.subtitle")}
              </p>
            </div>

            <div className="grid gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <span>{contactEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary" />
                <span>{contactPhone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{t("contact.info.location")}</span>
              </div>
            </div>

            <Button asChild variant="clinical-outline">
              <a
                href={`https://wa.me/${whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
              >
                {t("contact.whatsapp")}
              </a>
            </Button>
          </div>

          <form className="card-clinical space-y-4" onSubmit={handleContactSubmit}>
            <div>
              <h2 className="text-lg font-semibold mb-1">{t("contact.form.title")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("contact.form.subtitle")}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">{t("contact.form.fields.name")}</Label>
                <Input id="contact-name" name="name" placeholder={t("contact.form.placeholders.name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-organization">{t("contact.form.fields.organization")}</Label>
                <Input
                  id="contact-organization"
                  name="organization"
                  placeholder={t("contact.form.placeholders.organization")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">{t("contact.form.fields.email")}</Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  placeholder={t("contact.form.placeholders.email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">{t("contact.form.fields.phone")}</Label>
                <Input
                  id="contact-phone"
                  name="phone"
                  type="tel"
                  placeholder={t("contact.form.placeholders.phone")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-message">{t("contact.form.fields.message")}</Label>
              <Textarea
                id="contact-message"
                name="message"
                placeholder={t("contact.form.placeholders.message")}
              />
            </div>
            <Button type="submit" variant="clinical" size="lg" className="w-full">
              {t("contact.form.submit")}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Contact;

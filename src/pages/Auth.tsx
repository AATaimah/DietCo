import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n";

const Auth = () => {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-10 md:py-14">
        <div className="mx-auto max-w-lg card-clinical">
          <div className="mb-6">
            <h1 className="text-foreground mb-2">{t("auth.title")}</h1>
            <p className="text-muted-foreground">
              {t("auth.subtitle")}
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.tabs.login")}</TabsTrigger>
              <TabsTrigger value="register">{t("auth.tabs.register")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">{t("auth.fields.email")}</Label>
                <Input id="login-email" type="email" placeholder={t("auth.placeholders.email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">{t("auth.fields.password")}</Label>
                <Input id="login-password" type="password" placeholder={t("auth.placeholders.password")} />
              </div>
              <Button className="w-full" variant="clinical" size="lg">
                {t("auth.actions.signIn")}
              </Button>
            </TabsContent>

            <TabsContent value="register" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">{t("auth.fields.clinicName")}</Label>
                <Input id="clinic-name" type="text" placeholder={t("auth.placeholders.clinicName")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">{t("auth.fields.email")}</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder={t("auth.placeholders.email")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-phone">{t("auth.fields.phone")}</Label>
                <Input id="register-phone" type="tel" placeholder={t("auth.placeholders.phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">{t("auth.fields.createPassword")}</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder={t("auth.placeholders.password")}
                />
              </div>
              <Button className="w-full" variant="clinical" size="lg">
                {t("auth.actions.createAccount")}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Auth;

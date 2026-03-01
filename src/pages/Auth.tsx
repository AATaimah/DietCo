import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n";
import { useAuth } from "@/hooks/useAuth";
import type { AccountType } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type AuthTab = "login" | "register";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();
  const {
    login,
    register,
    logout,
    isAuthenticated,
    isLoading,
    supabaseConfigured,
  } = useAuth();

  const nextPath = searchParams.get("next");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [registerAccountType, setRegisterAccountType] = useState<AccountType>("individual");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerClinicName, setRegisterClinicName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const emailRedirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined;

  useEffect(() => {
    const queryTab = searchParams.get("tab");
    const resolvedTab: AuthTab = queryTab === "register" ? "register" : "login";
    setActiveTab(resolvedTab);

    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setLoginEmail(emailFromQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && nextPath) {
      navigate(nextPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, nextPath]);

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error(t("auth.messages.enterEmailPassword"));
      return;
    }

    try {
      setIsSubmitting(true);
      await login(loginEmail.trim(), loginPassword);
      toast.success(t("auth.messages.loginSuccess"));
      navigate(nextPath || "/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : t("auth.messages.loginError");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!registerName.trim()) {
      toast.error(
        registerAccountType === "clinic"
          ? t("auth.validation.contactName")
          : t("auth.validation.fullName"),
      );
      return;
    }

    if (registerAccountType === "clinic" && !registerClinicName.trim()) {
      toast.error(t("auth.validation.clinicName"));
      return;
    }

    if (!registerEmail.trim() || !registerPhone.trim() || !registerPassword.trim()) {
      toast.error(t("auth.messages.requiredFields"));
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await register({
        accountType: registerAccountType,
        fullName: registerName.trim(),
        clinicName: registerAccountType === "clinic" ? registerClinicName.trim() : undefined,
        phone: registerPhone.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        emailRedirectTo,
      });

      if (result.requiresEmailVerification) {
        toast.success(t("auth.messages.verifyEmail"));
      } else {
        toast.success(t("auth.messages.registerSuccess"));
      }

      logout();
      const loginEmailParam = encodeURIComponent(registerEmail.trim());
      navigate(`/auth?tab=login&email=${loginEmailParam}`, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : t("auth.messages.registerError");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountTypeOptions: { value: AccountType; label: string }[] = [
    { value: "individual", label: t("auth.accountTypes.individual") },
    { value: "clinic", label: t("auth.accountTypes.clinic") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-10 md:py-14">
        <div className="mx-auto max-w-lg card-clinical">
          <div className="mb-6">
            <h1 className="text-foreground mb-2">{t("auth.title")}</h1>
            <p className="text-muted-foreground">{t("auth.subtitle")}</p>
          </div>

          {!supabaseConfigured && (
            <div className="mb-5 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {t("auth.messages.supabaseNotConfigured")}
            </div>
          )}

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value === "register" ? "register" : "login")}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t("auth.tabs.login")}</TabsTrigger>
              <TabsTrigger value="register">{t("auth.tabs.register")}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6">
              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="login-email">{t("auth.fields.email")}</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t("auth.placeholders.email")}
                    value={loginEmail}
                    onChange={(event) => setLoginEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">{t("auth.fields.password")}</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder={t("auth.placeholders.password")}
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    required
                  />
                </div>
                <Button
                  className="w-full"
                  variant="clinical"
                  size="lg"
                  type="submit"
                  disabled={isSubmitting || !supabaseConfigured}
                >
                  {t("auth.actions.signIn")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-6">
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                <div className="space-y-2">
                  <Label>{t("auth.fields.accountType")}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {accountTypeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          "rounded-md border px-3 py-2 text-sm transition-colors",
                          registerAccountType === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-foreground hover:bg-accent",
                        )}
                        onClick={() => setRegisterAccountType(option.value)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {registerAccountType === "clinic" && (
                  <div className="space-y-2">
                    <Label htmlFor="clinic-name">{t("auth.fields.clinicName")}</Label>
                    <Input
                      id="clinic-name"
                      type="text"
                      placeholder={t("auth.placeholders.clinicName")}
                      value={registerClinicName}
                      onChange={(event) => setRegisterClinicName(event.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="register-name">
                    {registerAccountType === "clinic"
                      ? t("auth.fields.contactName")
                      : t("auth.fields.fullName")}
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder={
                      registerAccountType === "clinic"
                        ? t("auth.placeholders.contactName")
                        : t("auth.placeholders.fullName")
                    }
                    value={registerName}
                    onChange={(event) => setRegisterName(event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">
                    {registerAccountType === "clinic"
                      ? t("auth.fields.workEmail")
                      : t("auth.fields.email")}
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder={
                      registerAccountType === "clinic"
                        ? t("auth.placeholders.workEmail")
                        : t("auth.placeholders.email")
                    }
                    value={registerEmail}
                    onChange={(event) => setRegisterEmail(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-phone">{t("auth.fields.phone")}</Label>
                  <Input
                    id="register-phone"
                    type="tel"
                    placeholder={t("auth.placeholders.phone")}
                    value={registerPhone}
                    onChange={(event) => setRegisterPhone(event.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">{t("auth.fields.createPassword")}</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder={t("auth.placeholders.password")}
                    value={registerPassword}
                    onChange={(event) => setRegisterPassword(event.target.value)}
                    required
                  />
                </div>
                <Button
                  className="w-full"
                  variant="clinical"
                  size="lg"
                  type="submit"
                  disabled={isSubmitting || !supabaseConfigured}
                >
                  {t("auth.actions.createAccount")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Auth;

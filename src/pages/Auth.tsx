import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Auth = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-10 md:py-14">
        <div className="mx-auto max-w-lg card-clinical">
          <div className="mb-6">
            <h1 className="text-foreground mb-2">Account access</h1>
            <p className="text-muted-foreground">
              Login or register your clinic to place and manage orders.
            </p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Work email</Label>
                <Input id="login-email" type="email" placeholder="name@clinic.sa" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" placeholder="••••••••" />
              </div>
              <Button className="w-full" variant="clinical" size="lg">
                Sign in
              </Button>
            </TabsContent>

            <TabsContent value="register" className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Clinic name</Label>
                <Input id="clinic-name" type="text" placeholder="Clinic name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Work email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="name@clinic.sa"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-phone">Phone number</Label>
                <Input id="register-phone" type="tel" placeholder="+966 5X XXX XXXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Create password</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                />
              </div>
              <Button className="w-full" variant="clinical" size="lg">
                Create account
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Auth;

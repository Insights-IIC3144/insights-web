"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("marina@calvinklein.com");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call for now (Auth0 integration coming soon)
      await new Promise(resolve => setTimeout(resolve, 1000));
      document.cookie = "simulated_auth=true; path=/";
      toast.success("Sesión iniciada (simulada)");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setLoading(true);
    try {
      // Simulate Google auth API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      document.cookie = "simulated_auth=true; path=/";
      toast.success("Sesión iniciada con Google (simulada)");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error con Google");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Inicia sesión en Insights"
      subtitle="Accede al panel analítico de tu marca."
      footer={
        <>¿No tienes cuenta? <Link href="/signup" className="text-primary hover:underline font-medium">Crear cuenta</Link></>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <GoogleButton onClick={onGoogle} disabled={loading} />

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-background px-2 text-muted-foreground">o con correo</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Correo corporativo</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@marca.com" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link href="/forgot-password" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <Button type="submit" className="w-full h-10" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Iniciar sesión
        </Button>

        <div className="text-[11px] text-muted-foreground text-center pt-1">
          Demo: <code className="font-mono">marina@calvinklein.com</code> · <code className="font-mono">demo1234</code>
        </div>
      </form>
    </AuthShell>
  );
}

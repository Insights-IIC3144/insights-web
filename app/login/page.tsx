"use client";

import { useState, useEffect } from "react";
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

  // Resetea el estado de "cargando" si el usuario vuelve atrás en el navegador (bfcache)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLoading(false);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    
    // También por si acaso, un reseteo simple al montar el componente
    setLoading(false);
    
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const onEmail = () => {
    setLoading(true);
    // Redirige a Auth0 para usar correo
    window.location.assign("/api/auth/login");
  };

  const onGoogle = () => {
    setLoading(true);
    // Redirige a Auth0 forzando la conexión con Google
    window.location.assign("/api/auth/login?connection=google-oauth2");
  };

  return (
    <AuthShell
      title="Inicia sesión en Insights"
      subtitle="Accede al panel analítico de tu marca."
    >
      <div className="space-y-4 mt-6">
        <GoogleButton onClick={onGoogle} disabled={loading} />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-background px-2 text-muted-foreground">o</span>
          </div>
        </div>

        <Button onClick={onEmail} variant="outline" className="w-full h-10 border-border bg-card hover:bg-muted" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Continuar con correo corporativo
        </Button>
      </div>
    </AuthShell>
  );
}

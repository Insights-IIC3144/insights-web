"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Login() {
  const [loading, setLoading] = useState<"google" | "email" | null>(null);
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Resetea el estado de "cargando" si el usuario vuelve atrás en el navegador (bfcache)
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setLoading(null);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    
    // Si viene redirigido con un error de autorización desde el backend
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'unauthorized') {
      setShowErrorPopup(true);
      // Limpiamos la URL para no seguir mostrando el error si recarga
      window.history.replaceState({}, '', '/login');
    }
    
    // También por si acaso, un reseteo simple al montar el componente
    setLoading(null);
    
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const onEmail = () => {
    setLoading("email");
    // Redirige a Auth0 para usar correo
    window.location.assign("/api/auth/login");
  };

  const onGoogle = () => {
    setLoading("google");
    // Redirige a Auth0 forzando la conexión con Google
    window.location.assign("/api/auth/login?connection=google-oauth2");
  };

  return (
    <>
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border p-6 rounded-lg shadow-lg max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold tracking-tight">Acceso denegado</h3>
            <p className="text-sm text-muted-foreground">Tu correo electrónico no cuenta con una invitación válida para acceder a la plataforma.</p>
            <Button onClick={() => setShowErrorPopup(false)} className="w-full">Entendido</Button>
          </div>
        </div>
      )}
      <AuthShell
        title="Inicia sesión en Insights"
        subtitle="Accede al panel analítico de tu marca."
      >
      <div className="space-y-4 mt-6">
        <GoogleButton onClick={onGoogle} disabled={loading !== null} loading={loading === "google"} />

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
            <span className="bg-background px-2 text-muted-foreground">o</span>
          </div>
        </div>

        <Button onClick={onEmail} variant="outline" className="w-full h-10 border-border bg-card hover:bg-muted" disabled={loading !== null}>
          {loading === "email" ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
          Continuar con correo corporativo
        </Button>
      </div>
    </AuthShell>
    </>
  );
}

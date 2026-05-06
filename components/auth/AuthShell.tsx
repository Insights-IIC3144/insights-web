import { ReactNode } from "react";
import { Sparkles } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
      <aside className="hidden lg:flex flex-col justify-between p-10 bg-[#111A2C] text-[#C0C9D9] border-r border-[#20283A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none"
             style={{ backgroundImage: "radial-gradient(circle at 20% 20%, hsl(var(--sidebar-primary)) 0, transparent 40%), radial-gradient(circle at 80% 70%, hsl(var(--primary)) 0, transparent 45%)" }} />
        <div className="relative flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-md bg-gradient-brand flex items-center justify-center shadow-elevated">
            <span className="text-primary-foreground font-bold text-sm">I</span>
          </div>
          <div className="leading-tight">
            <div className="font-semibold text-white tracking-tight">Insights</div>
            <div className="text-[11px] uppercase tracking-wider text-[#C0C9D9]/60">por AndesML</div>
          </div>
        </div>

        <div className="relative space-y-6 max-w-md">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded bg-[#6E75A8]/20 text-[#8B95D6]">
            <Sparkles className="h-3 w-3" /> Analytics B2B para marcas en retail digital
          </div>
          <h2 className="text-3xl font-semibold text-white leading-tight tracking-tight">
            Decisiones con datos confiables sobre TheLook eCommerce.
          </h2>
          <p className="text-sm text-[#C0C9D9] leading-relaxed">
            Visualiza ventas, audiencias, calidad de catálogo y posicionamiento competitivo de tu marca,
            con asistencia de IA solo donde aporta valor.
          </p>
        </div>

        <div className="relative text-[11px] text-[#C0C9D9]/50">
          BigQuery · TheLook eCommerce · Demo
        </div>
      </aside>

      {/* Right form */}
      <main className="flex flex-col items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="h-8 w-8 rounded-md bg-gradient-brand flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">I</span>
            </div>
            <div className="font-semibold tracking-tight">Insights</div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
          <div className="mt-7">{children}</div>
          {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

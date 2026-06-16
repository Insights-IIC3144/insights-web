"use client";

import { NavLink } from "@/components/NavLink";
import { LayoutDashboard, BarChart3, TrendingUp, Sparkles, ShoppingBag, Users } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard Ejecutivo", icon: LayoutDashboard, end: true, ai: false },
  { href: "/sales", label: "Dashboard de Ventas", icon: TrendingUp, end: false, ai: false },
  { href: "/audiences", label: "Dashboard de Audiencias", icon: Users, end: false, ai: true },
  { href: "/catalog", label: "Análisis de Catálogo", icon: ShoppingBag, end: false, ai: true },
  { href: "/competitive-positioning", label: "Posicionamiento Competitivo", icon: BarChart3, end: false, ai: false },
];

export function Sidebar() {
  return (
    <aside className="flex w-14 lg:w-64 shrink-0 flex-col bg-[#111A2C] text-[#C0C9D9] border-r border-[#20283A] transition-[width] duration-200">
      <div className="border-b border-sidebar-border">
        <div className="px-3 lg:px-5 h-14 flex items-center justify-center lg:justify-start gap-2.5">
          <div className="h-8 w-8 rounded-md bg-gradient-brand flex items-center justify-center shadow-elevated shrink-0">
            <span className="text-primary-foreground font-bold text-sm">I</span>
          </div>
          <div className="leading-tight hidden lg:block">
            <div className="font-semibold text-white tracking-tight">Insights</div>
            <div className="text-[11px] uppercase tracking-wider text-[#C0C9D9]/60">por AndesML</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-[#C0C9D9]/50 font-medium hidden lg:block">
          Analítica
        </div>
        {items.map((it) => (
          <NavLink
            key={it.href}
            href={it.href}
            end={it.end}
            className="flex items-center justify-center lg:justify-start gap-2.5 px-2.5 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium ring-1 ring-sidebar-primary/30"
          >
            <it.icon className="h-4 w-4 shrink-0" />
            <span className="truncate hidden lg:inline">{it.label}</span>
            {it.ai && (
              <span className="ml-auto hidden lg:inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-sidebar-primary/15 text-sidebar-primary">
                <Sparkles className="h-2.5 w-2.5" /> IA
              </span>
            )}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}

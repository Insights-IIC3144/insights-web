"use client";

import { Calendar, ChevronDown, Download, LogOut, Search, Settings as SettingsIcon, Store, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BRANDS, RETAILER } from "@/lib/mock";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

const ranges = ["Últimos 7 días", "Últimos 30 días", "Últimos 90 días", "Año actual", "Personalizado"];

export function Topbar() {
  const router = useRouter();
  
  // Mocked user object since Auth0 is not installed yet
  const user = { name: "Marina", role: "Admin", initials: "M" }; 
  const [brand, setBrand] = useState(BRANDS[0]);
  const [range, setRange] = useState("Últimos 90 días");

  const onBrandChange = async (b: string) => {
    setBrand(b);
  };

  const handleLogout = () => {
    document.cookie = "simulated_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    toast.success("Sesión cerrada (simulada)");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-5 lg:px-8 h-14">
        {/* Retailer + brand */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium">
            <Store className="h-4 w-4" />
            Retailer
          </div>
          <div className="inline-flex items-center rounded-md border border-[#E2E8F0] bg-[#F8F9FA] px-2.5 py-0.5 text-[13px] font-medium text-[#333A73]">{RETAILER}</div>
          <span className="text-muted-foreground/30 px-1">/</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1.5 font-semibold text-foreground hover:bg-muted text-[14px] h-7 px-2">
                {brand}
                <ChevronDown className="h-4 w-4 text-muted-foreground opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuLabel className="text-xs">Marca actual (products.brand)</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {BRANDS.map((b) => (
                <DropdownMenuItem key={b} onClick={() => onBrandChange(b)}>
                  {b}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#B1DEB9] bg-[#E3F4E8] px-2.5 py-0.5 text-[12px] font-medium text-[#116E45] ml-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[#116E45] animate-pulse" />
          MV actualizadas hace 12 min
        </span>

        <div className="flex-1" />

        {/* Search */}
        <div className="hidden lg:flex items-center gap-2 h-9 px-3 rounded-md border bg-card text-muted-foreground text-sm w-72">
          <Search className="h-4 w-4" />
          <span className="text-xs">Buscar producto, categoría, segmento…</span>
          <kbd className="ml-auto text-[10px] font-mono bg-muted rounded px-1.5 py-0.5 border">⌘K</kbd>
        </div>

        {/* Date range */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{range}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {ranges.map((r) => (
              <DropdownMenuItem key={r} onClick={() => setRange(r)}>
                {r}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button size="sm" className="gap-2">
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Exportar</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1">
              <Avatar className="h-8 w-8 ring-2 ring-primary/15">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="font-medium">{user.name}</div>
              <div className="text-xs text-muted-foreground font-normal">
                {user.role} · {brand}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/perfil" className="cursor-pointer">
                <UserIcon className="h-4 w-4" /> Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracion" className="cursor-pointer">
                <SettingsIcon className="h-4 w-4" /> Configuración
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

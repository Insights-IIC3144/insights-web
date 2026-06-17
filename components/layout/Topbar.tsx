"use client";

import {
  Calendar, ChevronDown, LogOut, Moon, Store, Sun, User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserContext } from "@/context/UserContext";
import Link from "next/link";
import { type UserProfile } from "@/types/shared";

const RANGE_OPTIONS = [
  { label: "Últimos 7 días", days: 7 },
  { label: "Últimos 30 días", days: 30 },
  { label: "Últimos 90 días", days: 90 },
  { label: "Últimos 180 días", days: 180 },
  { label: "Último año", days: 365 },
];

const ROLE_MAP: Record<UserProfile['role'], string> = {
  "brand": "Marca",
  "retailer_admin": "Retailer"
}

export function Topbar() {
  const {
    profile,
    isLoading: profileLoading,
    setDays,
    selectedBrand,
    setSelectedBrand,
    availableBrands,
    setPinnedInsight
  } = useUserContext();
  const [range, setRange] = useState(RANGE_OPTIONS[2]); // default: últimos 90 días
  const { user } = useUser();
  const { resolvedTheme, setTheme } = useTheme();

  const handleRangeChange = (option: typeof RANGE_OPTIONS[0]) => {
    setRange(option);
    setDays(option.days);
  };

  const handleLogout = () => {
    toast.success("Cerrando sesión...");
    window.location.assign("/api/auth/logout");
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-5 lg:px-8 h-14">

        {/* Retailer + Brand */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium">
            <Store className="h-4 w-4" />
            Retailer
          </div>

          {/* Retailer — dato real del backend */}
          {profileLoading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <div className="inline-flex items-center rounded-md border border-[#E2E8F0] bg-[#F8F9FA] px-2.5 py-0.5 text-[13px] font-medium text-[#333A73]">
              {profile?.retailerName ?? '—'}
            </div>
          )}

          <span className="text-muted-foreground/30 px-1">/</span>

          {/* Brand — Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 font-semibold text-foreground hover:bg-muted text-[14px] h-7 px-2"
                disabled={profileLoading || (profile?.role !== 'retailer_admin')} // Bloqueamos si no es admin
              >
                {profileLoading ? "Cargando..." : (selectedBrand || "Todas las marcas")}
                {profile?.role === 'retailer_admin' && (
                  <ChevronDown className="h-4 w-4 text-muted-foreground opacity-70" />
                )}
              </Button>
            </DropdownMenuTrigger>

            {/* Solo mostramos el contenido del menú si es Admin */}
            {profile?.role === 'retailer_admin' && (
              <DropdownMenuContent align="start" className="w-60 max-h-72 overflow-y-auto">
                <DropdownMenuLabel className="text-xs">Filtro de marca</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Opción para limpiar el filtro */}
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedBrand("");
                    if (setPinnedInsight) setPinnedInsight(null);
                  }}
                  className={selectedBrand === "" ? "bg-muted font-medium" : ""}
                >
                  Todas las marcas
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {availableBrands.length === 0 ? (
                  <DropdownMenuItem disabled className="text-muted-foreground">
                    Cargando marcas...
                  </DropdownMenuItem>
                ) : (
                  availableBrands.map((b) => (
                    <DropdownMenuItem
                      key={b}
                      onClick={() => {
                        setSelectedBrand(b);
                        if (setPinnedInsight) setPinnedInsight(null);
                      }}
                      className={b === selectedBrand ? "bg-muted font-medium" : ""}
                    >
                      {b}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>

        <div className="flex-1" />



        {/* Date range */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{range.label}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {RANGE_OPTIONS.map((r) => (
              <DropdownMenuItem key={r.label} onClick={() => handleRangeChange(r)}>
                {r.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>



        {/* Avatar */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-border/50">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.picture || "/avatars/01.png"} alt={user.name || "User"} />
                  <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!profileLoading && profile && (
                <>
                  <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
                    <div className="flex flex-col gap-0.5">
                      <span>🏪 {profile.retailerName}</span>
                      <span className="capitalize opacity-70">{ROLE_MAP[profile.role]}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                className="cursor-pointer"
              >
                {resolvedTheme === "dark"
                  ? <Sun className="h-4 w-4 mr-2" />
                  : <Moon className="h-4 w-4 mr-2" />}
                {resolvedTheme === "dark" ? "Modo claro" : "Modo oscuro"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/perfil" className="cursor-pointer">
                  <UserIcon className="h-4 w-4 mr-2" /> Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10"
              >
                <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        )}

      </div>
    </header>
  );
}
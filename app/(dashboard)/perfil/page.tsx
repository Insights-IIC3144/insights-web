"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { ShieldCheck, Store, Tag, User as UserIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/ui-extra/PageHeader";
import { Panel } from "@/components/ui-extra/Panel";
import { useUserContext } from "@/context/UserContext";
import { type UserProfile } from "@/types/shared";

const ROLE_LABEL: Record<UserProfile["role"], string> = {
  brand: "Marca",
  retailer_admin: "Retailer Admin",
};

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-xs gap-2">
      <span className="flex items-center gap-1.5 text-muted-foreground shrink-0">
        {icon}
        {label}
      </span>
      <span className="font-medium text-right truncate">{value}</span>
    </div>
  );
}

export default function PerfilPage() {
  const { profile, isLoading: profileLoading } = useUserContext();
  const { user, isLoading: userLoading } = useUser();

  const loading = profileLoading || userLoading;

  const displayName = user?.name ?? profile?.name ?? "";
  const displayEmail = user?.email ?? profile?.email ?? "";

  const initials =
    displayName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Perfil"
        subtitle="Información personal y acceso dentro del retailer."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tarjeta lateral */}
        <Panel className="lg:col-span-1 overflow-hidden">
          {/* Franja degradada */}
          <div
            className="-mx-0 -mt-0 h-20 w-full rounded-t-lg"
            style={{ background: "var(--gradient-brand)" }}
          />

          <div className="flex flex-col items-center text-center px-5 pb-5">
            {/* Avatar superpuesto a la franja */}
            {loading ? (
              <Skeleton className="h-20 w-20 rounded-full -mt-10 ring-4 ring-background" />
            ) : (
              <Avatar className="h-20 w-20 -mt-10 ring-4 ring-background shadow-md">
                <AvatarImage src={user?.picture ?? ""} alt={displayName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}

            {loading ? (
              <div className="mt-3 space-y-2 w-full">
                <Skeleton className="h-5 w-40 mx-auto" />
                <Skeleton className="h-4 w-52 mx-auto" />
                <Skeleton className="h-6 w-24 mx-auto mt-1" />
              </div>
            ) : (
              <>
                <div className="mt-3 font-semibold text-lg leading-tight">{displayName}</div>
                <div className="text-sm text-muted-foreground">{displayEmail}</div>
                {profile && (
                  <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                    <ShieldCheck className="h-3 w-3" />
                    {ROLE_LABEL[profile.role]}
                  </div>
                )}
              </>
            )}

            <div className="mt-4 w-full pt-4 border-t border-border text-left space-y-2.5">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))
              ) : (
                <>
                  {profile?.brand && (
                    <Row
                      icon={<Tag className="h-3 w-3" />}
                      label="Marca"
                      value={profile.brand}
                    />
                  )}
                  <Row
                    icon={<Store className="h-3 w-3" />}
                    label="Retailer"
                    value={profile?.retailerName ?? "—"}
                  />
                  <Row
                    icon={
                      <span
                        className={`h-2 w-2 rounded-full ${
                          profile?.isActive ? "bg-success animate-pulse" : "bg-destructive"
                        }`}
                      />
                    }
                    label="Estado"
                    value={
                      <span
                        className={
                          profile?.isActive ? "text-success font-semibold" : "text-destructive font-semibold"
                        }
                      >
                        {profile?.isActive ? "Activo" : "Inactivo"}
                      </span>
                    }
                  />
                </>
              )}
            </div>
          </div>
        </Panel>

        {/* Panel de datos */}
        <Panel className="lg:col-span-2 border-t-2 border-t-primary">
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Datos del perfil</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre completo</Label>
              {loading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Input id="name" value={displayName} disabled className="disabled:opacity-100 text-foreground" />
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              {loading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Input id="email" value={displayEmail} disabled className="disabled:opacity-100 text-foreground" />
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Rol</Label>
              {loading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Input
                  id="role"
                  value={profile ? ROLE_LABEL[profile.role] : "—"}
                  disabled
                  className="disabled:opacity-100 text-foreground"
                />
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="retailer">Retailer</Label>
              {loading ? (
                <Skeleton className="h-10 w-full rounded-md" />
              ) : (
                <Input id="retailer" value={profile?.retailerName ?? "—"} disabled className="disabled:opacity-100 text-foreground" />
              )}
            </div>

            {profile?.brand && (
              <div className="space-y-1.5">
                <Label htmlFor="brand">Marca asignada</Label>
                <Input id="brand" value={profile.brand} disabled className="disabled:opacity-100 text-foreground" />
              </div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

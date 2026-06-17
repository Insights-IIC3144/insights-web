"use client";

import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUserContext } from "@/context/UserContext";

export function BrandSearch() {
  const {
    profile,
    isLoading: profileLoading,
    selectedBrand,
    setSelectedBrand,
    availableBrands,
    setPinnedInsight,
  } = useUserContext();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredBrands = availableBrands.filter((b) =>
    b.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (brand: string) => {
    setSelectedBrand(brand);
    if (setPinnedInsight) setPinnedInsight(null);
    setOpen(false);
    setSearch("");
  };

  const isRetailerAdmin = profile?.role === "retailer_admin";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 font-semibold text-foreground hover:bg-muted text-[14px] h-7 px-2"
            disabled={profileLoading || !isRetailerAdmin}
          >
            {profileLoading ? "Cargando..." : (selectedBrand || "Todas las marcas")}
            {isRetailerAdmin && (
              <ChevronDown className="h-4 w-4 text-muted-foreground opacity-70" />
            )}
          </Button>
        }
      />

      {isRetailerAdmin && (
        <PopoverContent align="start" sideOffset={4} className="w-64 p-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-sm"
              autoFocus
            />
          </div>

          <div className="mt-1 max-h-56 overflow-y-auto space-y-0.5">
            <button
              onClick={() => handleSelect("")}
              className={`w-full text-left px-2 py-1.5 rounded-sm text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                selectedBrand === "" ? "bg-muted font-medium" : ""
              }`}
            >
              Todas las marcas
            </button>

            {filteredBrands.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                {availableBrands.length === 0
                  ? "Cargando marcas..."
                  : "Sin resultados"}
              </p>
            ) : (
              filteredBrands.map((b) => (
                <button
                  key={b}
                  onClick={() => handleSelect(b)}
                  className={`w-full text-left px-2 py-1.5 rounded-sm text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                    b === selectedBrand ? "bg-muted font-medium" : ""
                  }`}
                >
                  {b}
                </button>
              ))
            )}
          </div>
        </PopoverContent>
      )}
    </Popover>
  );
}

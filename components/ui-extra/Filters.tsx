import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, COUNTRIES, DEPARTMENTS, TRAFFIC_SOURCES } from "@/lib/mock";

interface Props {
    showTraffic?: boolean;
    showGender?: boolean;
}

export function Filters({ showTraffic, showGender }: Props) {
    return (
        <div className="panel p-3 mb-5 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground px-2">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros
            </div>
            <FilterSelect placeholder="Categoría" options={CATEGORIES} />
            <FilterSelect placeholder="Department" options={DEPARTMENTS} />
            <FilterSelect placeholder="País" options={COUNTRIES} />
            {showGender && <FilterSelect placeholder="Gender" options={["Mujer", "Hombre"]} />}
            {showGender && (
                <FilterSelect
                    placeholder="Edad"
                    options={["18-24", "25-34", "35-44", "45-54", "55-64", "65+"]}
                />
            )}
            {showTraffic && <FilterSelect placeholder="Traffic source" options={TRAFFIC_SOURCES} />}
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                Limpiar
            </Button>
        </div>
    );
}

function FilterSelect({ placeholder, options }: { placeholder: string; options: string[] }) {
    return (
        <Select>
            <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((o) => (
                    <SelectItem key={o} value={o} className="text-xs">
                        {o}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, COUNTRIES, DEPARTMENTS, TRAFFIC_SOURCES } from "@/lib/mock";
import { FilterParams, FiltersData } from "@/types/shared";
import { filterService } from "@/services/filterService";

interface Props {
    showTraffic?: boolean;
    showGender?: boolean;
    outerValue?: Record<string, string>;
    onChange?: (filters: Record<string, string>) => void;
}

export function Filters({ showTraffic, showGender, outerValue, onChange }: Props) {
    const [filters, setFilters] = useState<FiltersData | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

    const activeFilters = outerValue ?? selectedFilters;

    const handleFilterChange = (key: string, value: string) => {
        const val = value === "all" ? "" : value;
        const newFilters = { ...activeFilters, [key]: val };
        if (val === "") delete newFilters[key]; // Clean up empty filters
        setSelectedFilters(newFilters);
        if (onChange) onChange(newFilters);
    };

    const handleClear = () => {
        setSelectedFilters({});
        if (onChange) onChange({});
    };

    useEffect(() => {
        filterService.getFilters()
            .then(data => setFilters(data))
            .catch(err => console.error("Error fetching filters:", err));
    }, []);

    const categories = filters?.categories?.length ? filters.categories : CATEGORIES;
    const departments = filters?.departments?.length ? filters.departments : DEPARTMENTS;
    const countries = filters?.countries?.length ? filters.countries : COUNTRIES;
    const trafficSources = filters?.trafficSources?.length ? filters.trafficSources : TRAFFIC_SOURCES;
    const genders = filters?.genders?.length ? filters.genders : ["Mujer", "Hombre"];

    return (
        <div className="panel p-3 mb-5 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground px-2">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Filtros
            </div>
            <FilterSelect
                placeholder="Categoría"
                options={categories.map(o => ({ label: o, value: o }))}
                value={activeFilters.category}
                onChange={(v) => handleFilterChange("category", v)} />
            <FilterSelect
                placeholder="Departamento"
                options={departments.map(o => ({ label: o, value: o }))}
                value={activeFilters.department}
                onChange={(v) => handleFilterChange("department", v)} />
            <FilterSelect
                placeholder="País"
                options={countries.map(o => ({ label: o, value: o }))}
                value={activeFilters.country}
                onChange={(v) => handleFilterChange("country", v)} />
            {showGender &&
                <FilterSelect
                    placeholder="Género"
                    options={genders.map(o => ({ label: o, value: o }))}
                    value={activeFilters.gender}
                    onChange={(v) => handleFilterChange("gender", v)} />}
            {showTraffic &&
                <FilterSelect
                    placeholder="Fuente de tráfico"
                    options={trafficSources.map(o => ({ label: o, value: o }))}
                    value={activeFilters.trafficSource}
                    onChange={(v) => handleFilterChange("trafficSource", v)} />}
            <div className="flex-1" />
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={handleClear}>
                Limpiar
            </Button>
        </div>
    );
}

function FilterSelect({ placeholder, options, value, onChange }: {
    placeholder: string;
    options: { label: string; value: string }[];
    value?: string;
    onChange?: (v: string) => void;
}) {
    return (
        <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className="h-8 w-auto min-w-[130px] text-xs">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all" className="text-xs font-medium text-muted-foreground">Todos</SelectItem>
                {options.map((o) => (
                    <SelectItem key={o.value} value={o.value} className="text-xs">
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

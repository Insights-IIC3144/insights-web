import { useState, useEffect, useMemo } from "react";
import { Panel } from "@/components/ui-extra/Panel";
import { CatalogProductDto } from "@/types/catalog";
import { ArrowDownIcon, ArrowUpIcon, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/UserContext";
import { fmtMoney } from "@/lib/format";
import { catalogService } from "@/services/catalogService";
import { filterService } from "@/services/filterService";

interface CatalogTableProps {
  localFilters: Record<string, string>;
}

type SortField = 'productName' | 'category' | 'retailPrice' | 'unitsSold' | 'revenueNet' | 'returnRate' | null;
type SortDirection = 'asc' | 'desc';

export function CatalogTable({ localFilters }: CatalogTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const { selectedBrand, availableBrands, days } = useUserContext();

  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  const [sortField, setSortField] = useState<SortField>('revenueNet');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const [products, setProducts] = useState<CatalogProductDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch valid categories for the current selected brand
  useEffect(() => {
    let cancelled = false;
    const effectiveBrand = selectedBrand || (filterBrand === "all" ? "" : filterBrand);
    
    filterService.getFilters(effectiveBrand || undefined)
      .then(res => {
        if (!cancelled) setAvailableCategories(res.categories || []);
      })
      .catch(console.error);

    return () => { cancelled = true; };
  }, [selectedBrand, filterBrand]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filterCategory, filterBrand, sortField, sortDirection]);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      if (!days) return;

      setLoading(true);

      const effectiveBrand = selectedBrand || filterBrand;
      const effectiveCategory = filterCategory !== "all" ? filterCategory : localFilters.category;

      const params = {
        days,
        brand: effectiveBrand === "" ? "all" : effectiveBrand,
        category: effectiveCategory,
        department: localFilters.department,
      };

      try {
        const res = await catalogService.getProducts(
          params,
          currentPage - 1, // API is 0-indexed
          ITEMS_PER_PAGE,
          sortField || undefined,
          sortDirection,
          debouncedSearch || undefined
        );
        if (!cancelled) {
          setProducts(res.data || []);
          setTotalElements(res.totalElements || 0);
          setTotalPages(res.totalPages || 0);
        }
      } catch (error) {
        console.error("Error fetching paginated products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, [days, selectedBrand, localFilters, filterBrand, filterCategory, currentPage, sortField, sortDirection, debouncedSearch]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatPercent = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(val);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <span className="w-4 inline-block" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="h-3.5 w-3.5 inline ml-1 text-foreground" />
      : <ChevronDown className="h-3.5 w-3.5 inline ml-1 text-foreground" />;
  };

  if (loading && products.length === 0) {
    return (
      <Panel className="p-6">
        <div className="h-6 w-48 bg-muted rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 w-full bg-muted/50 rounded animate-pulse" />
          ))}
        </div>
      </Panel>
    );
  }

  return (
    <Panel className="flex flex-col">
      <div className="p-4 sm:px-6 sm:py-5 border-b border-border">
        <h3 className="text-base font-semibold text-foreground">Rendimiento por Producto</h3>
        <p className="text-sm text-muted-foreground mt-1">Desglose de ingresos, ventas y devoluciones de tu catálogo.</p>

        <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-between">
          <div className="relative w-full sm:w-[450px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar producto..."
              className="pl-9 h-9 w-full bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 overflow-x-auto">
            <Filter className="h-4 w-4 text-muted-foreground hidden sm:block ml-2" />

            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-[180px] sm:w-[220px]"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Categoría (Todas)</option>
              {availableCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {(!selectedBrand || selectedBrand.trim() === "") && (
              <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-[180px] sm:w-[220px]"
                value={filterBrand}
                onChange={(e) => {
                  setFilterBrand(e.target.value);
                  setFilterCategory("all"); // Reset category when brand changes
                }}
              >
                <option value="all">Marca (Todas)</option>
                {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium select-none">
                Producto
              </th>
              <th className="px-6 py-3 font-medium select-none">
                Categoría
              </th>
              <th className="px-6 py-3 font-medium text-right select-none">
                Precio
              </th>
              <th
                className="px-6 py-3 font-medium text-center cursor-pointer hover:text-foreground hover:bg-muted/50 transition-colors select-none"
                onClick={() => handleSort('unitsSold')}
              >
                Unidades Vendidas {renderSortIcon('unitsSold')}
              </th>
              <th
                className="px-6 py-3 font-medium text-right cursor-pointer hover:text-foreground hover:bg-muted/50 transition-colors select-none"
                onClick={() => handleSort('revenueNet')}
              >
                Ingreso Neto {renderSortIcon('revenueNet')}
              </th>
              <th
                className="px-6 py-3 font-medium text-right cursor-pointer hover:text-foreground hover:bg-muted/50 transition-colors select-none"
                onClick={() => handleSort('returnRate')}
              >
                Devoluciones {renderSortIcon('returnRate')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {products.map((product) => (
              <tr key={product.productId} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground max-w-[200px] truncate" title={product.productName}>
                  {product.productName}
                </td>
                <td className="px-6 py-4 text-foreground">{product.category}</td>
                <td className="px-6 py-4 text-right text-foreground">{fmtMoney(product.retailPrice, { decimals: 2 })}</td>
                <td className="px-6 py-4 text-center text-foreground">{product.unitsSold.toLocaleString()}</td>
                <td className="px-6 py-4 text-right text-foreground font-medium">{fmtMoney(product.revenueNet)}</td>
                <td className="px-6 py-4 text-right">
                  <div className={`inline-flex items-center gap-1 ${product.returnRate > 0.15 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {product.returnRate > 0.15 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                    {formatPercent(product.returnRate)}
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No se encontraron productos que coincidan con la búsqueda o filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalElements > 0 && (
        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="font-medium text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, totalElements)}</span> de <span className="font-medium text-foreground">{totalElements}</span> resultados
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-muted-foreground px-2">
              Página {currentPage} de {Math.max(1, totalPages)}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === Math.max(1, totalPages) || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}

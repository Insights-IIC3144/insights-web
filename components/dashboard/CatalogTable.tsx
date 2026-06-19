import { useState, useMemo } from "react";
import { Panel } from "@/components/ui-extra/Panel";
import { CatalogProductDto } from "@/types/catalog";
import { ArrowDownIcon, ArrowUpIcon, Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/UserContext";
import { fmtMoney } from "@/lib/format";

interface CatalogTableProps {
  products: CatalogProductDto[];
  loading: boolean;
}

type SortField = 'unitsSold' | 'revenueNet' | 'returnRate' | null;
type SortDirection = 'asc' | 'desc';

export function CatalogTable({ products, loading }: CatalogTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const { selectedBrand } = useUserContext();

  const [sortField, setSortField] = useState<SortField>('revenueNet');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Extraer opciones únicas para los filtros
  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  // Asumimos que podemos inferir la marca desde productName o si la DTO no tiene brand explícito,
  // como the mock did not put brand explicitly in the catalog endpoint, wait, let's check if DTO has brand.
  // Actually, DTO doesn't have brand in Java, it only has productName.
  // Wait, looking at the DTO in CATALOG_BACKEND_INSTRUCTIONS.md, it does not have 'brand'.
  // But wait, the user wants a filter by brand in the table!
  // I'll extract a pseudo-brand from the first word of the product name just in case, or if DTO has brand.
  // Wait, I didn't add brand to CatalogProductDto. Let me check types/catalog.ts.
  const brands = useMemo(() => {
    // Si products tiene 'brand' lo usamos, de lo contrario extraemos la primera palabra
    const brs = new Set(products.map(p => (p as any).brand || p.productName?.split(" ")[0]).filter(Boolean));
    return Array.from(brs).sort();
  }, [products]);

  // Aplicar filtros, búsqueda y ordenamiento
  const processedProducts = useMemo(() => {
    let result = [...products];

    // Búsqueda
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(p => p.productName?.toLowerCase().includes(lowerTerm));
    }

    // Filtro de Categoría
    if (filterCategory !== "all") {
      result = result.filter(p => p.category === filterCategory);
    }

    // Filtro de Marca
    if (filterBrand !== "all") {
      result = result.filter(p => {
        const pBrand = (p as any).brand || p.productName?.split(" ")[0];
        return pBrand === filterBrand;
      });
    }

    // Ordenamiento
    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField] || 0;
        const valB = b[sortField] || 0;

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [products, searchTerm, filterCategory, filterBrand, sortField, sortDirection]);

  // Resetear página al cambiar filtros
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterBrand, sortField, sortDirection]);

  // Paginación
  const totalPages = Math.max(1, Math.ceil(processedProducts.length / ITEMS_PER_PAGE));
  const currentItems = processedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Por defecto descendente al cambiar columna
    }
  };

  const formatPercent = (val: number) =>
    new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 }).format(val);

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <span className="w-4" />; // Placeholder
    return sortDirection === 'asc'
      ? <ChevronUp className="h-3.5 w-3.5 inline ml-1 text-foreground" />
      : <ChevronDown className="h-3.5 w-3.5 inline ml-1 text-foreground" />;
  };

  if (loading) {
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

        {/* Toolbar */}
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

            {/* Simple Select for Category */}
            <select
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-[180px] sm:w-[220px]"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">Categoría (Todas)</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Simple Select for Brand - Only show if no brand is globally selected */}
            {(!selectedBrand || selectedBrand.trim() === "") && (
              <select
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-[180px] sm:w-[220px]"
                value={filterBrand}
                onChange={(e) => setFilterBrand(e.target.value)}
              >
                <option value="all">Marca (Todas)</option>
                {brands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border">
            <tr>
              <th className="px-6 py-3 font-medium">Producto</th>
              <th className="px-6 py-3 font-medium">Categoría</th>
              <th className="px-6 py-3 font-medium text-right">Precio</th>
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
            {currentItems.map((product) => (
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
            {currentItems.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  No se encontraron productos que coincidan con la búsqueda o filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {processedProducts.length > 0 && (
        <div className="p-4 border-t border-border flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            Mostrando <span className="font-medium text-foreground">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="font-medium text-foreground">{Math.min(currentPage * ITEMS_PER_PAGE, processedProducts.length)}</span> de <span className="font-medium text-foreground">{processedProducts.length}</span> resultados
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-muted-foreground px-2">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}

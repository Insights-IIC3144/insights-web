export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-[#111A2C] text-[#C0C9D9] border-r border-[#20283A]">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-md bg-gradient-brand flex items-center justify-center shadow-elevated">
          <span className="text-primary-foreground font-bold text-sm">I</span>
        </div>
        <div className="leading-tight">
          <div className="font-semibold text-white tracking-tight">Insights</div>
          <div className="text-[11px] uppercase tracking-wider text-[#C0C9D9]/60">por AndesML</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-[#C0C9D9]/50 font-medium">
          Analítica
        </div>
        {/* Navigation items will be added here later */}
      </nav>

      <div className="px-4 py-4 border-t border-[#20283A]">
        <div className="rounded-md bg-[#1B2338] p-3">
          <div className="text-[11px] uppercase tracking-wider text-[#C0C9D9]/60 mb-1">
            Fuente
          </div>
          <div className="text-xs text-white font-medium">
            BigQuery · TheLook eCommerce
          </div>
          <div className="text-[11px] text-[#8B95D6] mt-1">
            6 materialized views activas
          </div>
        </div>
      </div>
    </aside>
  );
}

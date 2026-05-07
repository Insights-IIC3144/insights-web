const GRANULARITY_OPTIONS = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
];

export function GranularitySelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (g: string) => void;
}) {
  return (
    <div className="flex gap-1">
      {GRANULARITY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-xs rounded-full border transition-colors ${
            value === opt.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
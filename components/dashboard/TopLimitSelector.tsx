const LIMIT_OPTIONS = [
  { value: 3, label: "Top 3" },
  { value: 5, label: "Top 5" },
  { value: 10, label: "Top 10" },
];

export function TopLimitSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {LIMIT_OPTIONS.map((opt) => (
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

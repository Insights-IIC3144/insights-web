import { Wrench } from "lucide-react";

export default function HomePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <Wrench className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">En construcción</h1>
      <p className="text-muted-foreground max-w-md mx-auto">
        Esta sección será programada próximamente. Faltan cosas por completar antes de habilitar este dashboard.
      </p>
    </div>
  );
}

import { redirect } from 'next/navigation';

export default function RootDashboard() {
  // Redirigir siempre a la ruta específica de ventas para mantener consistencia
  redirect('/sales');
}

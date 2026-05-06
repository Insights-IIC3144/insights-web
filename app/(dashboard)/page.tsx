import { redirect } from 'next/navigation';

export default function RootDashboard() {
  // Redirigir siempre a la ruta principal del dashboard
  redirect('/dashboard');
}

import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <AppLayout>{children}</AppLayout>
    </DashboardProvider>
  );
}

import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardProvider } from "@/context/DashboardContext";
import { UserProvider } from "@/context/UserContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
        <DashboardProvider>
          <AppLayout>{children}</AppLayout>
        </DashboardProvider>
      </UserProvider>
  )
}
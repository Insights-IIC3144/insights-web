import { AppLayout } from "@/components/layout/AppLayout";
import { UserProvider } from "@/context/UserContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <UserProvider>
      <AppLayout>{children}</AppLayout>
    </UserProvider>
  )
}
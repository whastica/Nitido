import { SignedOutGate } from "@/components/auth/SignedOutGate";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SignedOutGate>
      <div className="flex h-screen bg-background overflow-hidden">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="page-enter">{children}</div>
          </main>
        </div>
      </div>
    </SignedOutGate>
  );
}

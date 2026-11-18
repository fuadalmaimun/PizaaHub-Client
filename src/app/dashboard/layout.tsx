import type { ReactNode } from "react";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex w-full flex-1 flex-col lg:flex-row">
      <DashboardSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardAccess } from "@/components/dashboard/dashboard-access";
import { DashboardDataProvider } from "@/components/dashboard/dashboard-data-provider";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage CRAK referrals, rewards and wallet activity.",
};

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return <DashboardDataProvider><DashboardShell><DashboardAccess>{children}</DashboardAccess></DashboardShell></DashboardDataProvider>;
}

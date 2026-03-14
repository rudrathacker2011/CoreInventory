"use client";

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/receipts": "Receipts",
  "/delivery-orders": "Delivery Orders",
  "/internal-transfers": "Internal Transfers",
  "/stock-adjustments": "Stock Adjustments",
  "/stock": "Stock Overview",
  "/move-history": "Move History",
  "/settings/warehouses": "Warehouses",
  "/settings/locations": "Locations",
  "/profile": "My Profile",
};

function getPageTitle(pathname: string): string {
  // Exact match
  if (pageTitles[pathname]) return pageTitles[pathname];
  // Check for parent paths
  for (const [path, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(path)) return title;
  }
  return "CoreInventory";
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const title = getPageTitle(pathname);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-lg font-semibold">{title}</h1>
          </header>
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

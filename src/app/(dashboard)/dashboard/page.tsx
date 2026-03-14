import {
  Package,
  AlertTriangle,
  PackageOpen,
  Truck,
  ArrowLeftRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardKPIs } from "@/actions/stock";

export default async function DashboardPage() {
  const kpis = await getDashboardKPIs();

  const kpiCards = [
    {
      title: "Total Products",
      value: kpis.totalProductsInStock,
      subtitle: `${kpis.totalStockQuantity} units in stock`,
      icon: Package,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Low / Out of Stock",
      value: kpis.lowStockCount,
      subtitle: "Items need attention",
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "Pending Receipts",
      value: kpis.pendingReceipts,
      subtitle: "Incoming goods",
      icon: PackageOpen,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Pending Deliveries",
      value: kpis.pendingDeliveries,
      subtitle: "Outgoing goods",
      icon: Truck,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Scheduled Transfers",
      value: kpis.scheduledTransfers,
      subtitle: "Internal movements",
      icon: ArrowLeftRight,
      color: "text-cyan-600 dark:text-cyan-400",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${kpi.bgColor}`}>
                <kpi.icon className={`size-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpi.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

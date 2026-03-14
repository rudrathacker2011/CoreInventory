import {
  DollarSign,
  Package,
  AlertTriangle,
  PackageOpen,
  Truck,
  ArrowLeftRight,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboardKPIs } from "@/actions/stock";
import { db } from "@/lib/db";
import { StockBarChart, MoveTypePieChart } from "@/components/dashboard-charts";

async function getRecentMoves() {
  return db.stockMove.findMany({
    take: 6,
    orderBy: { createdAt: "desc" },
    include: {
      product: true,
      fromLocation: { include: { warehouse: true } },
      toLocation: { include: { warehouse: true } },
    },
  });
}

async function getTopProducts() {
  return db.product.findMany({
    take: 5,
    include: {
      stockQuants: true,
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function getProductStockData() {
  const products = await db.product.findMany({
    take: 8,
    include: { stockQuants: true },
    orderBy: { createdAt: "desc" },
  });
  return products.map((p) => ({
    name: p.name.length > 12 ? p.name.slice(0, 12) + "…" : p.name,
    stock: p.stockQuants.reduce((s, q) => s + q.quantity, 0),
    sku: p.sku,
  }));
}

async function getMoveTypeBreakdown() {
  const [receipts, deliveries, transfers, adjustments] = await Promise.all([
    db.stockMove.count({ where: { moveType: "RECEIPT" } }),
    db.stockMove.count({ where: { moveType: "DELIVERY" } }),
    db.stockMove.count({ where: { moveType: "TRANSFER" } }),
    db.stockMove.count({ where: { moveType: "ADJUSTMENT" } }),
  ]);
  return [
    { name: "Receipts", value: receipts, fill: "#34d399" },
    { name: "Deliveries", value: deliveries, fill: "#a78bfa" },
    { name: "Transfers", value: transfers, fill: "#60a5fa" },
    { name: "Adjustments", value: adjustments, fill: "#fbbf24" },
  ];
}

export default async function DashboardPage() {
  const [kpis, recentMoves, topProducts, stockData, moveBreakdown] =
    await Promise.all([
      getDashboardKPIs(),
      getRecentMoves(),
      getTopProducts(),
      getProductStockData(),
      getMoveTypeBreakdown(),
    ]);

  const moveTypeColors: Record<string, string> = {
    RECEIPT: "text-emerald-400",
    DELIVERY: "text-violet-400",
    TRANSFER: "text-blue-400",
    ADJUSTMENT: "text-amber-400",
  };

  return (
    <div className="space-y-4">
      {/* ── KPI Cards — 4 columns like shadcn dashboard ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
            <Package className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.totalProductsInStock}
            </div>
            <p className="text-xs text-muted-foreground">
              {kpis.totalStockQuantity} units in stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low / Out of Stock
            </CardTitle>
            <AlertTriangle className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Items need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Receipts
            </CardTitle>
            <PackageOpen className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pendingReceipts}</div>
            <p className="text-xs text-muted-foreground">Incoming goods</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Deliveries
            </CardTitle>
            <Truck className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.pendingDeliveries}</div>
            <p className="text-xs text-muted-foreground">
              Outgoing orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Stock Levels</CardTitle>
            <CardDescription>
              Current inventory quantity per product
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2 pr-4">
            <StockBarChart data={stockData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Movement Breakdown</CardTitle>
            <CardDescription>
              Distribution of stock movement types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MoveTypePieChart data={moveBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* ── Activity + Overview Row ── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest stock movements across all locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentMoves.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No recent activity
                </p>
              ) : (
                recentMoves.map((move: any) => (
                  <div key={move.id} className="flex items-center">
                    <div className="flex size-9 items-center justify-center rounded-full bg-muted shrink-0">
                      <Activity
                        className={`size-4 ${moveTypeColors[move.moveType] || "text-muted-foreground"}`}
                      />
                    </div>
                    <div className="ml-4 space-y-1 min-w-0 flex-1">
                      <p className="text-sm font-medium leading-none truncate">
                        {move.product?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {move.reference} · {move.moveType?.toLowerCase()} ·{" "}
                        {move.quantity} qty
                      </p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground shrink-0">
                      {new Date(move.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Inventory Overview</CardTitle>
            <CardDescription>
              Products and current stock levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No products yet
                </p>
              ) : (
                topProducts.map((product: any) => {
                  const onHand = product.stockQuants.reduce(
                    (s: number, q: any) => s + q.quantity,
                    0
                  );
                  return (
                    <div key={product.id} className="flex items-center">
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted shrink-0">
                        <Package className="size-4 text-muted-foreground" />
                      </div>
                      <div className="ml-4 space-y-1 min-w-0 flex-1">
                        <p className="text-sm font-medium leading-none truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {product.category?.name || "Uncategorized"} ·{" "}
                          {product.sku}
                        </p>
                      </div>
                      <Badge
                        className="ml-auto shrink-0"
                        variant={onHand <= 0 ? "destructive" : "secondary"}
                      >
                        {onHand} {product.unitOfMeasure}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

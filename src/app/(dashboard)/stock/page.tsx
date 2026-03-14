"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { getStockOverview } from "@/actions/stock";

type StockProduct = {
  id: string;
  name: string;
  sku: string;
  costPerUnit: number;
  unitOfMeasure: string;
  onHand: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  category: { name: string } | null;
  reorderRule: { minQty: number; maxQty: number } | null;
  stockQuants: {
    quantity: number;
    location: { name: string; warehouse: { name: string } };
  }[];
};

export default function StockPage() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getStockOverview();
      setProducts(data as StockProduct[]);
    });
  }, []);

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Overview of all product stock levels across all locations.
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Cost / Unit</TableHead>
              <TableHead className="text-right">On Hand Qty</TableHead>
              <TableHead>Stock by Location</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow
                  key={p.id}
                  className={
                    p.isOutOfStock
                      ? "bg-red-50 dark:bg-red-950/20"
                      : p.isLowStock
                      ? "bg-amber-50 dark:bg-amber-950/20"
                      : ""
                  }
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {p.name}
                      {(p.isLowStock || p.isOutOfStock) && (
                        <AlertTriangle className="size-4 text-amber-500" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.sku}</Badge>
                  </TableCell>
                  <TableCell>{p.category?.name || "—"}</TableCell>
                  <TableCell className="text-right">
                    ${p.costPerUnit.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        p.isOutOfStock
                          ? "destructive"
                          : p.isLowStock
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {p.onHand} {p.unitOfMeasure}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {p.stockQuants
                        .filter((q) => q.quantity > 0)
                        .map((q, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {q.location.warehouse.name}/{q.location.name}: {q.quantity}
                          </Badge>
                        ))}
                      {p.stockQuants.filter((q) => q.quantity > 0).length === 0 && (
                        <span className="text-xs text-muted-foreground">No stock</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.isOutOfStock ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : p.isLowStock ? (
                      <Badge variant="outline" className="border-amber-500 text-amber-600">
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="secondary">In Stock</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

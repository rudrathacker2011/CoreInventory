"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { getAdjustments, createAdjustment } from "@/actions/adjustments";
import { getProducts } from "@/actions/products";
import { getLocations } from "@/actions/settings";
import { formatDateTime } from "@/lib/helpers";
import { toast } from "sonner";

export default function StockAdjustmentsPage() {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    productId: "",
    locationId: "",
    countedQty: 0,
  });

  const loadData = () => {
    startTransition(async () => {
      const [adj, prods, locs] = await Promise.all([
        getAdjustments(),
        getProducts(),
        getLocations(),
      ]);
      setAdjustments(adj);
      setProducts(prods);
      setLocations(locs);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (!form.productId || !form.locationId) {
        toast.error("Select a product and location");
        return;
      }
      await createAdjustment(form);
      toast.success("Stock adjustment applied");
      setDialogOpen(false);
      setForm({ productId: "", locationId: "", countedQty: 0 });
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Reconcile physical counts with system inventory.
        </p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              New Adjustment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg w-full">
            <DialogHeader>
              <DialogTitle>New Stock Adjustment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Product</Label>
                <Select
                  value={form.productId}
                  onValueChange={(v) => setForm({ ...form, productId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p: any) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Select
                  value={form.locationId}
                  onValueChange={(v) => setForm({ ...form, locationId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((l: any) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.warehouse?.name} / {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Physically Counted Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.countedQty}
                  onChange={(e) =>
                    setForm({ ...form, countedQty: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Apply Adjustment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">System Qty</TableHead>
              <TableHead className="text-right">Counted Qty</TableHead>
              <TableHead className="text-right">Difference</TableHead>
              <TableHead>Responsible</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && adjustments.length === 0 ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : adjustments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No adjustments yet.
                </TableCell>
              </TableRow>
            ) : (
              adjustments.map((adj: any) => (
                <TableRow key={adj.id}>
                  <TableCell className="font-mono font-medium">{adj.reference}</TableCell>
                  <TableCell>{adj.product?.name}</TableCell>
                  <TableCell>
                    {adj.location?.warehouse?.name} / {adj.location?.name}
                  </TableCell>
                  <TableCell className="text-right">{adj.systemQty}</TableCell>
                  <TableCell className="text-right">{adj.countedQty}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={adj.difference >= 0 ? "secondary" : "destructive"}>
                      {adj.difference > 0 ? "+" : ""}
                      {adj.difference}
                    </Badge>
                  </TableCell>
                  <TableCell>{adj.responsible?.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(adj.createdAt)}
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

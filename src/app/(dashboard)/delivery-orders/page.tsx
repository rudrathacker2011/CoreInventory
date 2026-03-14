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
import { Plus, Trash2, CheckCircle } from "lucide-react";
import {
  getDeliveryOrders,
  createDeliveryOrder,
  validateDeliveryOrder,
  updateDeliveryOrderStatus,
  deleteDeliveryOrder,
} from "@/actions/delivery-orders";
import { getProducts } from "@/actions/products";
import { getStatusBadgeVariant, getStatusLabel, formatDate, isLate } from "@/lib/helpers";
import { toast } from "sonner";

export default function DeliveryOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [form, setForm] = useState({
    deliveryAddress: "",
    scheduleDate: new Date().toISOString().split("T")[0],
    lines: [{ productId: "", quantity: 1 }] as { productId: string; quantity: number }[],
  });

  const loadData = () => {
    startTransition(async () => {
      const [o, p] = await Promise.all([getDeliveryOrders(), getProducts()]);
      setOrders(o);
      setProducts(p);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLine = () =>
    setForm({ ...form, lines: [...form.lines, { productId: "", quantity: 1 }] });

  const removeLine = (i: number) =>
    setForm({ ...form, lines: form.lines.filter((_, idx) => idx !== i) });

  const updateLine = (i: number, field: string, value: any) => {
    const newLines = [...form.lines];
    (newLines[i] as any)[field] = value;
    setForm({ ...form, lines: newLines });
  };

  const handleSubmit = async () => {
    try {
      const validLines = form.lines.filter((l) => l.productId && l.quantity > 0);
      if (validLines.length === 0) {
        toast.error("Add at least one product");
        return;
      }
      await createDeliveryOrder({ ...form, lines: validLines });
      toast.success("Delivery order created");
      setDialogOpen(false);
      setForm({
        deliveryAddress: "",
        scheduleDate: new Date().toISOString().split("T")[0],
        lines: [{ productId: "", quantity: 1 }],
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (
    id: string,
    status: "DRAFT" | "WAITING" | "READY" | "CANCELLED"
  ) => {
    try {
      await updateDeliveryOrderStatus(id, status);
      toast.success(`Status updated to ${status.toLowerCase()}`);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      await validateDeliveryOrder(id);
      toast.success("Delivery validated! Stock decreased.");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this delivery order?")) return;
    try {
      await deleteDeliveryOrder(id);
      toast.success("Deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered =
    statusFilter === "ALL"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="WAITING">Waiting</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              New Delivery Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-full">
            <DialogHeader>
              <DialogTitle>New Delivery Order (Outgoing Goods)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Delivery Address</Label>
                  <Input
                    value={form.deliveryAddress}
                    onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                    placeholder="Delivery address"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Schedule Date</Label>
                  <Input
                    type="date"
                    value={form.scheduleDate}
                    onChange={(e) => setForm({ ...form, scheduleDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Products</Label>
                  <Button variant="outline" size="sm" onClick={addLine}>
                    <Plus className="size-3 mr-1" /> Add Line
                  </Button>
                </div>
                {form.lines.map((line, i) => (
                  <div key={i} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Select
                        value={line.productId}
                        onValueChange={(v) => updateLine(i, "productId", v)}
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
                    <div className="w-28">
                      <Input
                        type="number"
                        min="1"
                        value={line.quantity}
                        onChange={(e) => updateLine(i, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                      />
                    </div>
                    {form.lines.length > 1 && (
                      <Button variant="ghost" size="icon" onClick={() => removeLine(i)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Create Order</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Schedule Date</TableHead>
              <TableHead>Responsible</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && orders.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No delivery orders found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono font-medium">{o.reference}</TableCell>
                  <TableCell>{o.deliveryAddress || "—"}</TableCell>
                  <TableCell>
                    {formatDate(o.scheduleDate)}
                    {isLate(o.scheduleDate) && o.status !== "DONE" && (
                      <Badge variant="destructive" className="ml-2 text-xs">Late</Badge>
                    )}
                  </TableCell>
                  <TableCell>{o.responsible?.name}</TableCell>
                  <TableCell>{o.lines.length} items</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(o.status)}>
                      {getStatusLabel(o.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {o.status === "DRAFT" && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(o.id, "READY")}>
                        Mark Ready
                      </Button>
                    )}
                    {o.status === "WAITING" && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(o.id, "READY")}>
                        Mark Ready
                      </Button>
                    )}
                    {o.status === "READY" && (
                      <Button size="sm" onClick={() => handleValidate(o.id)}>
                        <CheckCircle className="size-3 mr-1" />
                        Validate
                      </Button>
                    )}
                    {o.status !== "DONE" && o.status !== "CANCELLED" && (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(o.id, "CANCELLED")}>
                        Cancel
                      </Button>
                    )}
                    {o.status === "DRAFT" && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(o.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
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

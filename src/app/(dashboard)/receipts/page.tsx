"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  getReceipts,
  createReceipt,
  validateReceipt,
  updateReceiptStatus,
  deleteReceipt,
} from "@/actions/receipts";
import { getProducts } from "@/actions/products";
import { getStatusBadgeVariant, getStatusLabel, formatDate, isLate } from "@/lib/helpers";
import { toast } from "sonner";

type ReceiptLine = { productId: string; quantity: number };

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    supplier: "",
    scheduleDate: new Date().toISOString().split("T")[0],
    lines: [{ productId: "", quantity: 1 }] as ReceiptLine[],
  });
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const loadData = () => {
    startTransition(async () => {
      const [r, p] = await Promise.all([getReceipts(), getProducts()]);
      setReceipts(r);
      setProducts(p);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const addLine = () => {
    setForm({ ...form, lines: [...form.lines, { productId: "", quantity: 1 }] });
  };

  const removeLine = (index: number) => {
    setForm({ ...form, lines: form.lines.filter((_, i) => i !== index) });
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...form.lines];
    (newLines[index] as any)[field] = value;
    setForm({ ...form, lines: newLines });
  };

  const handleSubmit = async () => {
    try {
      const validLines = form.lines.filter((l) => l.productId && l.quantity > 0);
      if (validLines.length === 0) {
        toast.error("Add at least one product line");
        return;
      }
      await createReceipt({ ...form, lines: validLines });
      toast.success("Receipt created");
      setDialogOpen(false);
      setForm({
        supplier: "",
        scheduleDate: new Date().toISOString().split("T")[0],
        lines: [{ productId: "", quantity: 1 }],
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create receipt");
    }
  };

  const handleStatusChange = async (id: string, status: "READY" | "CANCELLED") => {
    try {
      await updateReceiptStatus(id, status);
      toast.success(`Receipt marked as ${status.toLowerCase()}`);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      await validateReceipt(id);
      toast.success("Receipt validated! Stock updated.");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this receipt?")) return;
    try {
      await deleteReceipt(id);
      toast.success("Receipt deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered =
    statusFilter === "ALL"
      ? receipts
      : receipts.filter((r) => r.status === statusFilter);

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
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              New Receipt
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Receipt (Incoming Goods)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supplier / Contact</Label>
                  <Input
                    value={form.supplier}
                    onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                    placeholder="Supplier name"
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
                  <Button type="button" variant="outline" size="sm" onClick={addLine}>
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
                    <div className="w-24">
                      <Input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(i, "quantity", parseInt(e.target.value) || 1)
                        }
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
              <Button onClick={handleSubmit}>Create Receipt</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Schedule Date</TableHead>
              <TableHead>Responsible</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No receipts found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r: any) => (
                <TableRow key={r.id} className={isLate(r.scheduleDate) && r.status !== "DONE" ? "bg-red-50 dark:bg-red-950/20" : ""}>
                  <TableCell className="font-mono font-medium">{r.reference}</TableCell>
                  <TableCell>{r.supplier || "—"}</TableCell>
                  <TableCell>
                    {formatDate(r.scheduleDate)}
                    {isLate(r.scheduleDate) && r.status !== "DONE" && (
                      <Badge variant="destructive" className="ml-2 text-xs">Late</Badge>
                    )}
                  </TableCell>
                  <TableCell>{r.responsible?.name}</TableCell>
                  <TableCell>{r.lines.length} items</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(r.status)}>
                      {getStatusLabel(r.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {r.status === "DRAFT" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(r.id, "READY")}
                      >
                        Mark Ready
                      </Button>
                    )}
                    {r.status === "READY" && (
                      <Button
                        size="sm"
                        onClick={() => handleValidate(r.id)}
                      >
                        <CheckCircle className="size-3 mr-1" />
                        Validate
                      </Button>
                    )}
                    {r.status !== "DONE" && r.status !== "CANCELLED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStatusChange(r.id, "CANCELLED")}
                      >
                        Cancel
                      </Button>
                    )}
                    {r.status === "DRAFT" && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(r.id)}>
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

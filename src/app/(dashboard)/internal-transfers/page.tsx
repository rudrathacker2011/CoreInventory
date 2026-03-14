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
  getTransfers,
  createTransfer,
  validateTransfer,
  updateTransferStatus,
  deleteTransfer,
} from "@/actions/transfers";
import { getProducts } from "@/actions/products";
import { getLocations } from "@/actions/settings";
import { getStatusBadgeVariant, getStatusLabel, formatDate } from "@/lib/helpers";
import { toast } from "sonner";

export default function InternalTransfersPage() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [form, setForm] = useState({
    fromLocationId: "",
    toLocationId: "",
    scheduleDate: new Date().toISOString().split("T")[0],
    lines: [{ productId: "", quantity: 1 }] as { productId: string; quantity: number }[],
  });

  const loadData = () => {
    startTransition(async () => {
      const [t, p, l] = await Promise.all([
        getTransfers(),
        getProducts(),
        getLocations(),
      ]);
      setTransfers(t);
      setProducts(p);
      setLocations(l);
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
      if (form.fromLocationId === form.toLocationId) {
        toast.error("Source and destination must be different");
        return;
      }
      const validLines = form.lines.filter((l) => l.productId && l.quantity > 0);
      if (validLines.length === 0) {
        toast.error("Add at least one product");
        return;
      }
      await createTransfer({ ...form, lines: validLines });
      toast.success("Transfer created");
      setDialogOpen(false);
      setForm({
        fromLocationId: "",
        toLocationId: "",
        scheduleDate: new Date().toISOString().split("T")[0],
        lines: [{ productId: "", quantity: 1 }],
      });
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStatusChange = async (id: string, status: "READY" | "CANCELLED") => {
    try {
      await updateTransferStatus(id, status);
      toast.success(`Status updated`);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      await validateTransfer(id);
      toast.success("Transfer validated! Stock moved.");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transfer?")) return;
    try {
      await deleteTransfer(id);
      toast.success("Deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filtered =
    statusFilter === "ALL"
      ? transfers
      : transfers.filter((t) => t.status === statusFilter);

  const getLocationLabel = (loc: any) =>
    `${loc.warehouse?.name} / ${loc.name}`;

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
              New Transfer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Internal Transfer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>From Location</Label>
                  <Select
                    value={form.fromLocationId}
                    onValueChange={(v) => setForm({ ...form, fromLocationId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Source" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l: any) => (
                        <SelectItem key={l.id} value={l.id}>
                          {getLocationLabel(l)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>To Location</Label>
                  <Select
                    value={form.toLocationId}
                    onValueChange={(v) => setForm({ ...form, toLocationId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((l: any) => (
                        <SelectItem key={l.id} value={l.id}>
                          {getLocationLabel(l)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    <div className="w-24">
                      <Input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value) || 1)}
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Create Transfer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>From</TableHead>
              <TableHead>To</TableHead>
              <TableHead>Schedule Date</TableHead>
              <TableHead>Responsible</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No transfers found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t: any) => (
                <TableRow key={t.id}>
                  <TableCell className="font-mono font-medium">{t.reference}</TableCell>
                  <TableCell>{getLocationLabel(t.fromLocation)}</TableCell>
                  <TableCell>{getLocationLabel(t.toLocation)}</TableCell>
                  <TableCell>{formatDate(t.scheduleDate)}</TableCell>
                  <TableCell>{t.responsible?.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(t.status)}>
                      {getStatusLabel(t.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {t.status === "DRAFT" && (
                      <Button variant="outline" size="sm" onClick={() => handleStatusChange(t.id, "READY")}>
                        Mark Ready
                      </Button>
                    )}
                    {t.status === "READY" && (
                      <Button size="sm" onClick={() => handleValidate(t.id)}>
                        <CheckCircle className="size-3 mr-1" />
                        Validate
                      </Button>
                    )}
                    {t.status !== "DONE" && t.status !== "CANCELLED" && (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(t.id, "CANCELLED")}>
                        Cancel
                      </Button>
                    )}
                    {t.status === "DRAFT" && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
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

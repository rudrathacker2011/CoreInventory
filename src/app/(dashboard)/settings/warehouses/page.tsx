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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "@/actions/settings";
import { toast } from "sonner";

type Warehouse = {
  id: string;
  name: string;
  shortCode: string;
  address: string | null;
  locations: { id: string }[];
};

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [form, setForm] = useState({ name: "", shortCode: "", address: "" });

  const loadData = () => {
    startTransition(async () => {
      const data = await getWarehouses();
      setWarehouses(data as Warehouse[]);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editing) {
        await updateWarehouse(editing.id, form);
        toast.success("Warehouse updated");
      } else {
        await createWarehouse(form);
        toast.success("Warehouse created");
      }
      setDialogOpen(false);
      setEditing(null);
      setForm({ name: "", shortCode: "", address: "" });
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleEdit = (wh: Warehouse) => {
    setEditing(wh);
    setForm({ name: wh.name, shortCode: wh.shortCode, address: wh.address || "" });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this warehouse? All locations inside will also be deleted.")) return;
    try {
      await deleteWarehouse(id);
      toast.success("Warehouse deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-sm">
            Manage your warehouses and their settings.
          </p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditing(null);
              setForm({ name: "", shortCode: "", address: "" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              New Warehouse
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Warehouse" : "New Warehouse"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Main Warehouse"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shortCode">Short Code</Label>
                <Input
                  id="shortCode"
                  value={form.shortCode}
                  onChange={(e) =>
                    setForm({ ...form, shortCode: e.target.value.toUpperCase() })
                  }
                  placeholder="WH"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address (optional)</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="123 Main St"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={!form.name || !form.shortCode}>
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Short Code</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Locations</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No warehouses yet. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              warehouses.map((wh) => (
                <TableRow key={wh.id}>
                  <TableCell className="font-medium">{wh.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{wh.shortCode}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {wh.address || "—"}
                  </TableCell>
                  <TableCell>{wh.locations.length}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(wh)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(wh.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
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

"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  getLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from "@/actions/settings";
import { getWarehouses } from "@/actions/settings";
import { toast } from "sonner";

type Location = {
  id: string;
  name: string;
  shortCode: string;
  warehouseId: string;
  warehouse: { id: string; name: string; shortCode: string };
};

type Warehouse = {
  id: string;
  name: string;
  shortCode: string;
};

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);
  const [form, setForm] = useState({
    name: "",
    shortCode: "",
    warehouseId: "",
  });

  const loadData = () => {
    startTransition(async () => {
      const [locs, whs] = await Promise.all([getLocations(), getWarehouses()]);
      setLocations(locs as Location[]);
      setWarehouses(whs as Warehouse[]);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editing) {
        await updateLocation(editing.id, form);
        toast.success("Location updated");
      } else {
        await createLocation(form);
        toast.success("Location created");
      }
      setDialogOpen(false);
      setEditing(null);
      setForm({ name: "", shortCode: "", warehouseId: "" });
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleEdit = (loc: Location) => {
    setEditing(loc);
    setForm({
      name: loc.name,
      shortCode: loc.shortCode,
      warehouseId: loc.warehouseId,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this location?")) return;
    try {
      await deleteLocation(id);
      toast.success("Location deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">
          Manage locations within your warehouses.
        </p>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditing(null);
              setForm({ name: "", shortCode: "", warehouseId: "" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              New Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? "Edit Location" : "New Location"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Rack A"
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
                  placeholder="RACK-A"
                />
              </div>
              <div className="space-y-2">
                <Label>Warehouse</Label>
                <Select
                  value={form.warehouseId}
                  onValueChange={(v) => setForm({ ...form, warehouseId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name} ({wh.shortCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!form.name || !form.shortCode || !form.warehouseId}
              >
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
              <TableHead>Warehouse</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No locations yet. Create your first one!
                </TableCell>
              </TableRow>
            ) : (
              locations.map((loc) => (
                <TableRow key={loc.id}>
                  <TableCell className="font-medium">{loc.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{loc.shortCode}</Badge>
                  </TableCell>
                  <TableCell>
                    {loc.warehouse.name} ({loc.warehouse.shortCode})
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(loc)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(loc.id)}>
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

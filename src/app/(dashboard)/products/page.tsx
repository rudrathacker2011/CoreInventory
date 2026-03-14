"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
} from "@/actions/products";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  sku: string;
  categoryId: string | null;
  unitOfMeasure: string;
  costPerUnit: number;
  category: { id: string; name: string } | null;
  reorderRule: { id: string; minQty: number; maxQty: number } | null;
  stockQuants: {
    quantity: number;
    location: { name: string; warehouse: { name: string } };
  }[];
};

type Category = { id: string; name: string; _count: { products: number } };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [catDialogOpen, setCatDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    sku: "",
    categoryId: "",
    unitOfMeasure: "Units",
    costPerUnit: 0,
    reorderMin: 0,
    reorderMax: 0,
  });

  const loadData = () => {
    startTransition(async () => {
      const [prods, cats] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prods as Product[]);
      setCategories(cats as Category[]);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...form,
        categoryId: form.categoryId || undefined,
      };
      if (editing) {
        await updateProduct(editing.id, submitData);
        toast.success("Product updated");
      } else {
        await createProduct(submitData);
        toast.success("Product created");
      }
      setDialogOpen(false);
      setEditing(null);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      sku: "",
      categoryId: "",
      unitOfMeasure: "Units",
      costPerUnit: 0,
      reorderMin: 0,
      reorderMax: 0,
    });
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      sku: p.sku,
      categoryId: p.categoryId || "",
      unitOfMeasure: p.unitOfMeasure,
      costPerUnit: p.costPerUnit,
      reorderMin: p.reorderRule?.minQty || 0,
      reorderMax: p.reorderRule?.maxQty || 0,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName) return;
    try {
      await createCategory(newCatName);
      setNewCatName("");
      setCatDialogOpen(false);
      toast.success("Category created");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to create category");
    }
  };

  const getOnHandQty = (p: Product) =>
    p.stockQuants.reduce((sum, q) => sum + q.quantity, 0);

  const isLowStock = (p: Product) => {
    const onHand = getOnHandQty(p);
    return p.reorderRule && onHand <= p.reorderRule.minQty;
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <div className="flex gap-2">
          <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Manage Categories</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Product Categories</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex gap-2">
                  <Input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="New category name"
                  />
                  <Button onClick={handleCreateCategory} disabled={!newCatName}>
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2 rounded-md border"
                    >
                      <span>{cat.name}</span>
                      <Badge variant="secondary">
                        {cat._count.products} products
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) {
                setEditing(null);
                resetForm();
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4 mr-2" />
                New Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl w-full">
              <DialogHeader>
                <DialogTitle>
                  {editing ? "Edit Product" : "New Product"}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Widget Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SKU / Code</Label>
                  <Input
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    placeholder="WDG-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => setForm({ ...form, categoryId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Unit of Measure</Label>
                  <Input
                    value={form.unitOfMeasure}
                    onChange={(e) =>
                      setForm({ ...form, unitOfMeasure: e.target.value })
                    }
                    placeholder="Units"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cost Per Unit</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.costPerUnit}
                    onChange={(e) =>
                      setForm({ ...form, costPerUnit: Math.max(0, parseFloat(e.target.value) || 0) })
                    }
                  />
                </div>
                <div />
                <div className="space-y-2">
                  <Label>Reorder Min Qty</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.reorderMin}
                    onChange={(e) =>
                      setForm({ ...form, reorderMin: Math.max(0, parseFloat(e.target.value) || 0) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reorder Max Qty</Label>
                  <Input
                    type="number"
                    min="0"
                    value={form.reorderMax}
                    onChange={(e) =>
                      setForm({ ...form, reorderMax: Math.max(0, parseFloat(e.target.value) || 0) })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!form.name || !form.sku}>
                  {editing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>UoM</TableHead>
              <TableHead className="text-right">Cost/Unit</TableHead>
              <TableHead className="text-right">On Hand</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending && products.length === 0 ? (
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
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const onHand = getOnHandQty(p);
                const lowStock = isLowStock(p);
                return (
                  <TableRow key={p.id} className={lowStock ? "bg-amber-50 dark:bg-amber-950/20" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {p.name}
                        {lowStock && (
                          <AlertTriangle className="size-4 text-amber-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{p.sku}</Badge>
                    </TableCell>
                    <TableCell>{p.category?.name || "—"}</TableCell>
                    <TableCell>{p.unitOfMeasure}</TableCell>
                    <TableCell className="text-right">
                      ${p.costPerUnit.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={onHand <= 0 ? "destructive" : "secondary"}>
                        {onHand}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

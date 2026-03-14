"use client";

import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMoveHistory } from "@/actions/stock";
import { getStatusBadgeVariant, getStatusLabel, formatDateTime } from "@/lib/helpers";

type MoveTypeLabel = {
  RECEIPT: string;
  DELIVERY: string;
  TRANSFER: string;
  ADJUSTMENT: string;
};

const moveTypeLabels: MoveTypeLabel = {
  RECEIPT: "Receipt",
  DELIVERY: "Delivery",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Adjustment",
};

const moveTypeColors: Record<string, string> = {
  RECEIPT: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  DELIVERY: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  TRANSFER: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  ADJUSTMENT: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function MoveHistoryPage() {
  const [moves, setMoves] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [view, setView] = useState<"list" | "kanban">("list");

  useEffect(() => {
    startTransition(async () => {
      const data = await getMoveHistory();
      setMoves(data);
    });
  }, []);

  const filtered = moves
    .filter((m) => {
      if (typeFilter !== "ALL" && m.moveType !== typeFilter) return false;
      if (statusFilter !== "ALL" && m.status !== statusFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          m.reference.toLowerCase().includes(s) ||
          m.product?.name.toLowerCase().includes(s)
        );
      }
      return true;
    });

  const getLocationName = (loc: any) =>
    loc ? `${loc.warehouse?.name}/${loc.name}` : "—";

  // Kanban grouping
  const statusGroups = ["DRAFT", "WAITING", "READY", "DONE", "CANCELLED"];
  const groupedMoves = statusGroups.reduce((acc, status) => {
    acc[status] = filtered.filter((m) => m.status === status);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Input
          placeholder="Search by reference or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="RECEIPT">Receipts</SelectItem>
            <SelectItem value="DELIVERY">Deliveries</SelectItem>
            <SelectItem value="TRANSFER">Transfers</SelectItem>
            <SelectItem value="ADJUSTMENT">Adjustments</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="READY">Ready</SelectItem>
            <SelectItem value="WAITING">Waiting</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "list" | "kanban")}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="kanban">Kanban View</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No move history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((m: any) => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono font-medium">{m.reference}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${moveTypeColors[m.moveType]}`}>
                          {moveTypeLabels[m.moveType as keyof MoveTypeLabel]}
                        </span>
                      </TableCell>
                      <TableCell>{getLocationName(m.fromLocation)}</TableCell>
                      <TableCell>{getLocationName(m.toLocation)}</TableCell>
                      <TableCell>{m.product?.name}</TableCell>
                      <TableCell className="text-right font-medium">{m.quantity}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateTime(m.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(m.status)}>
                          {getStatusLabel(m.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statusGroups.map((status) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{getStatusLabel(status as any)}</h3>
                  <Badge variant="secondary">{groupedMoves[status]?.length || 0}</Badge>
                </div>
                <div className="space-y-2">
                  {(groupedMoves[status] || []).map((m: any) => (
                    <Card key={m.id} className="shadow-sm">
                      <CardContent className="p-3 space-y-1">
                        <div className="font-mono text-sm font-medium">{m.reference}</div>
                        <div className="text-xs text-muted-foreground">{m.product?.name}</div>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${moveTypeColors[m.moveType]}`}>
                            {moveTypeLabels[m.moveType as keyof MoveTypeLabel]}
                          </span>
                          <span className="text-xs font-medium">{m.quantity} qty</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {(!groupedMoves[status] || groupedMoves[status].length === 0) && (
                    <p className="text-xs text-muted-foreground text-center py-4">No moves</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

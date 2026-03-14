"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ==================== WAREHOUSE ACTIONS ====================

export async function getWarehouses() {
  return db.warehouse.findMany({
    include: { locations: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createWarehouse(data: {
  name: string;
  shortCode: string;
  address?: string;
}) {
  const warehouse = await db.warehouse.create({ data });
  revalidatePath("/settings/warehouses");
  return warehouse;
}

export async function updateWarehouse(
  id: string,
  data: { name: string; shortCode: string; address?: string }
) {
  const warehouse = await db.warehouse.update({ where: { id }, data });
  revalidatePath("/settings/warehouses");
  return warehouse;
}

export async function deleteWarehouse(id: string) {
  await db.warehouse.delete({ where: { id } });
  revalidatePath("/settings/warehouses");
}

// ==================== LOCATION ACTIONS ====================

export async function getLocations() {
  return db.location.findMany({
    include: { warehouse: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLocation(data: {
  name: string;
  shortCode: string;
  warehouseId: string;
}) {
  const location = await db.location.create({ data });
  revalidatePath("/settings/locations");
  return location;
}

export async function updateLocation(
  id: string,
  data: { name: string; shortCode: string; warehouseId: string }
) {
  const location = await db.location.update({ where: { id }, data });
  revalidatePath("/settings/locations");
  return location;
}

export async function deleteLocation(id: string) {
  await db.location.delete({ where: { id } });
  revalidatePath("/settings/locations");
}

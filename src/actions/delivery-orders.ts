"use server";

import { db } from "@/lib/db";
import { getNextReference } from "@/lib/sequence";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// ==================== GET DELIVERY ORDERS ====================

export async function getDeliveryOrders() {
  return db.deliveryOrder.findMany({
    include: {
      responsible: { select: { id: true, name: true, email: true } },
      lines: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getDeliveryOrder(id: string) {
  return db.deliveryOrder.findUnique({
    where: { id },
    include: {
      responsible: { select: { id: true, name: true, email: true } },
      lines: { include: { product: { include: { stockQuants: true } } } },
    },
  });
}

// ==================== CREATE DELIVERY ORDER ====================

export async function createDeliveryOrder(data: {
  deliveryAddress?: string;
  scheduleDate: string;
  lines: { productId: string; quantity: number }[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const reference = await getNextReference("WH/OUT");

  // Check stock availability for each product
  let hasInsufficientStock = false;
  for (const line of data.lines) {
    const totalStock = await db.stockQuant.aggregate({
      where: { productId: line.productId },
      _sum: { quantity: true },
    });
    if ((totalStock._sum.quantity || 0) < line.quantity) {
      hasInsufficientStock = true;
      break;
    }
  }

  const order = await db.deliveryOrder.create({
    data: {
      reference,
      deliveryAddress: data.deliveryAddress,
      scheduleDate: new Date(data.scheduleDate),
      responsibleId: session.user.id,
      status: hasInsufficientStock ? "WAITING" : "DRAFT",
      lines: {
        create: data.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      },
    },
  });

  revalidatePath("/delivery-orders");
  return order;
}

// ==================== VALIDATE DELIVERY (READY → DONE) ====================

export async function validateDeliveryOrder(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const order = await db.deliveryOrder.findUnique({
    where: { id },
    include: { lines: true },
  });

  if (!order) throw new Error("Delivery order not found");
  if (order.status !== "READY") throw new Error("Order must be in Ready status to validate");

  const defaultLocation = await db.location.findFirst();
  if (!defaultLocation) throw new Error("No locations configured");

  // Check sufficient stock for all products
  for (const line of order.lines) {
    const quant = await db.stockQuant.findUnique({
      where: {
        productId_locationId: {
          productId: line.productId,
          locationId: defaultLocation.id,
        },
      },
    });
    if (!quant || quant.quantity < line.quantity) {
      throw new Error("Insufficient stock for delivery. Cannot validate.");
    }
  }

  await db.$transaction(async (tx) => {
    for (const line of order.lines) {
      // Decrease stock
      await tx.stockQuant.update({
        where: {
          productId_locationId: {
            productId: line.productId,
            locationId: defaultLocation.id,
          },
        },
        data: { quantity: { decrement: line.quantity } },
      });

      // Create stock move
      await tx.stockMove.create({
        data: {
          reference: order.reference,
          moveType: "DELIVERY",
          productId: line.productId,
          fromLocationId: defaultLocation.id,
          quantity: line.quantity,
          status: "DONE",
          responsibleId: session.user!.id!,
          deliveryOrderId: order.id,
        },
      });
    }

    await tx.deliveryOrder.update({
      where: { id },
      data: { status: "DONE" },
    });
  });

  revalidatePath("/delivery-orders");
  revalidatePath("/stock");
  revalidatePath("/move-history");
  revalidatePath("/dashboard");
}

// ==================== UPDATE STATUS ====================

export async function updateDeliveryOrderStatus(
  id: string,
  status: "DRAFT" | "WAITING" | "READY" | "CANCELLED"
) {
  await db.deliveryOrder.update({ where: { id }, data: { status } });
  revalidatePath("/delivery-orders");
}

// ==================== DELETE ====================

export async function deleteDeliveryOrder(id: string) {
  await db.deliveryOrder.delete({ where: { id } });
  revalidatePath("/delivery-orders");
}

"use server";

import { db } from "@/lib/db";
import { getNextReference } from "@/lib/sequence";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// ==================== GET TRANSFERS ====================

export async function getTransfers() {
  return db.internalTransfer.findMany({
    include: {
      fromLocation: { include: { warehouse: true } },
      toLocation: { include: { warehouse: true } },
      responsible: { select: { id: true, name: true, email: true } },
      lines: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTransfer(id: string) {
  return db.internalTransfer.findUnique({
    where: { id },
    include: {
      fromLocation: { include: { warehouse: true } },
      toLocation: { include: { warehouse: true } },
      responsible: { select: { id: true, name: true, email: true } },
      lines: { include: { product: true } },
    },
  });
}

// ==================== CREATE TRANSFER ====================

export async function createTransfer(data: {
  fromLocationId: string;
  toLocationId: string;
  scheduleDate: string;
  lines: { productId: string; quantity: number }[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const reference = await getNextReference("WH/INT");

  const transfer = await db.internalTransfer.create({
    data: {
      reference,
      fromLocationId: data.fromLocationId,
      toLocationId: data.toLocationId,
      scheduleDate: new Date(data.scheduleDate),
      responsibleId: session.user.id,
      status: "DRAFT",
      lines: {
        create: data.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      },
    },
  });

  revalidatePath("/internal-transfers");
  return transfer;
}

// ==================== VALIDATE TRANSFER (READY → DONE) ====================

export async function validateTransfer(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const transfer = await db.internalTransfer.findUnique({
    where: { id },
    include: { lines: true },
  });

  if (!transfer) throw new Error("Transfer not found");
  if (transfer.status !== "READY") throw new Error("Transfer must be in Ready status to validate");

  // Check stock at source location
  for (const line of transfer.lines) {
    const quant = await db.stockQuant.findUnique({
      where: {
        productId_locationId: {
          productId: line.productId,
          locationId: transfer.fromLocationId,
        },
      },
    });
    if (!quant || quant.quantity < line.quantity) {
      throw new Error("Insufficient stock at source location");
    }
  }

  await db.$transaction(async (tx) => {
    for (const line of transfer.lines) {
      // Decrease from source
      await tx.stockQuant.update({
        where: {
          productId_locationId: {
            productId: line.productId,
            locationId: transfer.fromLocationId,
          },
        },
        data: { quantity: { decrement: line.quantity } },
      });

      // Increase at destination
      await tx.stockQuant.upsert({
        where: {
          productId_locationId: {
            productId: line.productId,
            locationId: transfer.toLocationId,
          },
        },
        update: { quantity: { increment: line.quantity } },
        create: {
          productId: line.productId,
          locationId: transfer.toLocationId,
          quantity: line.quantity,
        },
      });

      // Create stock move
      await tx.stockMove.create({
        data: {
          reference: transfer.reference,
          moveType: "TRANSFER",
          productId: line.productId,
          fromLocationId: transfer.fromLocationId,
          toLocationId: transfer.toLocationId,
          quantity: line.quantity,
          status: "DONE",
          responsibleId: session.user!.id!,
          transferId: transfer.id,
        },
      });
    }

    await tx.internalTransfer.update({
      where: { id },
      data: { status: "DONE" },
    });
  });

  revalidatePath("/internal-transfers");
  revalidatePath("/stock");
  revalidatePath("/move-history");
  revalidatePath("/dashboard");
}

// ==================== UPDATE STATUS ====================

export async function updateTransferStatus(
  id: string,
  status: "DRAFT" | "READY" | "CANCELLED"
) {
  await db.internalTransfer.update({ where: { id }, data: { status } });
  revalidatePath("/internal-transfers");
}

// ==================== DELETE ====================

export async function deleteTransfer(id: string) {
  await db.internalTransfer.delete({ where: { id } });
  revalidatePath("/internal-transfers");
}

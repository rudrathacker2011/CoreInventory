"use server";

import { db } from "@/lib/db";
import { getNextReference } from "@/lib/sequence";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// ==================== GET RECEIPTS ====================

export async function getReceipts() {
  return db.receipt.findMany({
    include: {
      responsible: { select: { id: true, name: true, email: true } },
      lines: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReceipt(id: string) {
  return db.receipt.findUnique({
    where: { id },
    include: {
      responsible: { select: { id: true, name: true, email: true } },
      lines: { include: { product: { include: { stockQuants: true } } } },
    },
  });
}

// ==================== CREATE RECEIPT ====================

export async function createReceipt(data: {
  supplier?: string;
  scheduleDate: string;
  lines: { productId: string; quantity: number }[];
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const reference = await getNextReference("WH/IN");

  const receipt = await db.receipt.create({
    data: {
      reference,
      supplier: data.supplier,
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

  revalidatePath("/receipts");
  return receipt;
}

// ==================== VALIDATE RECEIPT (READY → DONE) ====================

export async function validateReceipt(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const receipt = await db.receipt.findUnique({
    where: { id },
    include: { lines: { include: { product: true } } },
  });

  if (!receipt) throw new Error("Receipt not found");
  if (receipt.status !== "READY") throw new Error("Receipt must be in Ready status to validate");

  // Get a default location to receive stock into
  const defaultLocation = await db.location.findFirst();
  if (!defaultLocation) throw new Error("No locations configured. Please create a location first.");

  // Update stock and create stock moves in a transaction
  await db.$transaction(async (tx) => {
    for (const line of receipt.lines) {
      // Increase stock at the location
      await tx.stockQuant.upsert({
        where: {
          productId_locationId: {
            productId: line.productId,
            locationId: defaultLocation.id,
          },
        },
        update: { quantity: { increment: line.quantity } },
        create: {
          productId: line.productId,
          locationId: defaultLocation.id,
          quantity: line.quantity,
        },
      });

      // Create stock move log
      await tx.stockMove.create({
        data: {
          reference: receipt.reference,
          moveType: "RECEIPT",
          productId: line.productId,
          toLocationId: defaultLocation.id,
          quantity: line.quantity,
          status: "DONE",
          responsibleId: session.user!.id!,
          receiptId: receipt.id,
        },
      });
    }

    // Update receipt status
    await tx.receipt.update({
      where: { id },
      data: { status: "DONE" },
    });
  });

  revalidatePath("/receipts");
  revalidatePath("/stock");
  revalidatePath("/move-history");
  revalidatePath("/dashboard");
}

// ==================== UPDATE STATUS ====================

export async function updateReceiptStatus(
  id: string,
  status: "DRAFT" | "READY" | "CANCELLED"
) {
  await db.receipt.update({ where: { id }, data: { status } });
  revalidatePath("/receipts");
}

// ==================== DELETE RECEIPT ====================

export async function deleteReceipt(id: string) {
  await db.receipt.delete({ where: { id } });
  revalidatePath("/receipts");
}

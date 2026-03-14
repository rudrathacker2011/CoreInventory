"use server";

import { db } from "@/lib/db";
import { getNextReference } from "@/lib/sequence";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// ==================== GET ADJUSTMENTS ====================

export async function getAdjustments() {
  return db.stockAdjustment.findMany({
    include: {
      product: true,
      location: { include: { warehouse: true } },
      responsible: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ==================== CREATE & APPLY ADJUSTMENT ====================

export async function createAdjustment(data: {
  productId: string;
  locationId: string;
  countedQty: number;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const reference = await getNextReference("WH/ADJ");

  // Get current system quantity
  const quant = await db.stockQuant.findUnique({
    where: {
      productId_locationId: {
        productId: data.productId,
        locationId: data.locationId,
      },
    },
  });

  const systemQty = quant?.quantity || 0;
  const difference = data.countedQty - systemQty;

  const adjustment = await db.$transaction(async (tx) => {
    const adj = await tx.stockAdjustment.create({
      data: {
        reference,
        productId: data.productId,
        locationId: data.locationId,
        countedQty: data.countedQty,
        systemQty,
        difference,
        responsibleId: session.user!.id!,
        status: "DONE",
      },
    });

    // Update stock to match counted quantity
    await tx.stockQuant.upsert({
      where: {
        productId_locationId: {
          productId: data.productId,
          locationId: data.locationId,
        },
      },
      update: { quantity: data.countedQty },
      create: {
        productId: data.productId,
        locationId: data.locationId,
        quantity: data.countedQty,
      },
    });

    // Create stock move log
    await tx.stockMove.create({
      data: {
        reference,
        moveType: "ADJUSTMENT",
        productId: data.productId,
        fromLocationId: difference < 0 ? data.locationId : undefined,
        toLocationId: difference >= 0 ? data.locationId : undefined,
        quantity: Math.abs(difference),
        status: "DONE",
        responsibleId: session.user!.id!,
        adjustmentId: adj.id,
      },
    });

    return adj;
  });

  revalidatePath("/stock-adjustments");
  revalidatePath("/stock");
  revalidatePath("/move-history");
  revalidatePath("/dashboard");
  return adjustment;
}

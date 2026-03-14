"use server";

import { db } from "@/lib/db";

// ==================== STOCK QUERIES ====================

export async function getStockOverview() {
  const products = await db.product.findMany({
    include: {
      category: true,
      reorderRule: true,
      stockQuants: {
        include: { location: { include: { warehouse: true } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return products.map((product) => {
    const onHand = product.stockQuants.reduce(
      (sum, q) => sum + q.quantity,
      0
    );
    return {
      ...product,
      onHand,
      isLowStock:
        product.reorderRule ? onHand <= product.reorderRule.minQty : false,
      isOutOfStock: onHand <= 0,
    };
  });
}

export async function updateStockManually(data: {
  productId: string;
  locationId: string;
  quantity: number;
}) {
  await db.stockQuant.upsert({
    where: {
      productId_locationId: {
        productId: data.productId,
        locationId: data.locationId,
      },
    },
    update: { quantity: data.quantity },
    create: {
      productId: data.productId,
      locationId: data.locationId,
      quantity: data.quantity,
    },
  });
}

// ==================== MOVE HISTORY ====================

export async function getMoveHistory() {
  return db.stockMove.findMany({
    include: {
      product: true,
      fromLocation: { include: { warehouse: true } },
      toLocation: { include: { warehouse: true } },
      responsible: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ==================== DASHBOARD KPIs ====================

export async function getDashboardKPIs() {
  const [
    totalProducts,
    lowStockProducts,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers,
  ] = await Promise.all([
    // Total products with stock > 0
    db.stockQuant.aggregate({
      _sum: { quantity: true },
      where: { quantity: { gt: 0 } },
    }),
    // Low stock / out of stock
    getStockOverview().then(
      (products) =>
        products.filter((p) => p.isLowStock || p.isOutOfStock).length
    ),
    // Pending receipts (not DONE/CANCELLED)
    db.receipt.count({
      where: { status: { in: ["DRAFT", "WAITING", "READY"] } },
    }),
    // Pending deliveries
    db.deliveryOrder.count({
      where: { status: { in: ["DRAFT", "WAITING", "READY"] } },
    }),
    // Scheduled transfers
    db.internalTransfer.count({
      where: { status: { in: ["DRAFT", "READY"] } },
    }),
  ]);

  const totalProductCount = await db.product.count();

  return {
    totalProductsInStock: totalProductCount,
    totalStockQuantity: totalProducts._sum.quantity || 0,
    lowStockCount: lowStockProducts,
    pendingReceipts,
    pendingDeliveries,
    scheduledTransfers,
  };
}

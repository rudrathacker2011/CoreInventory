"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ==================== PRODUCT CATEGORY ACTIONS ====================

export async function getCategories() {
  return db.productCategory.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string) {
  const category = await db.productCategory.create({ data: { name } });
  revalidatePath("/products");
  return category;
}

export async function deleteCategory(id: string) {
  await db.productCategory.delete({ where: { id } });
  revalidatePath("/products");
}

// ==================== PRODUCT ACTIONS ====================

export async function getProducts() {
  return db.product.findMany({
    include: {
      category: true,
      reorderRule: true,
      stockQuants: { include: { location: { include: { warehouse: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      reorderRule: true,
      stockQuants: { include: { location: { include: { warehouse: true } } } },
    },
  });
}

export async function createProduct(data: {
  name: string;
  sku: string;
  categoryId?: string;
  unitOfMeasure?: string;
  costPerUnit?: number;
  reorderMin?: number;
  reorderMax?: number;
}) {
  const { reorderMin, reorderMax, ...productData } = data;

  const product = await db.product.create({
    data: {
      ...productData,
      ...(reorderMin !== undefined && reorderMax !== undefined
        ? {
            reorderRule: {
              create: { minQty: reorderMin, maxQty: reorderMax },
            },
          }
        : {}),
    },
  });

  revalidatePath("/products");
  return product;
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    sku: string;
    categoryId?: string | null;
    unitOfMeasure?: string;
    costPerUnit?: number;
    reorderMin?: number;
    reorderMax?: number;
  }
) {
  const { reorderMin, reorderMax, ...productData } = data;

  const product = await db.product.update({
    where: { id },
    data: productData,
  });

  // Upsert reorder rule
  if (reorderMin !== undefined && reorderMax !== undefined) {
    await db.reorderRule.upsert({
      where: { productId: id },
      update: { minQty: reorderMin, maxQty: reorderMax },
      create: { productId: id, minQty: reorderMin, maxQty: reorderMax },
    });
  }

  revalidatePath("/products");
  return product;
}

export async function deleteProduct(id: string) {
  await db.product.delete({ where: { id } });
  revalidatePath("/products");
}

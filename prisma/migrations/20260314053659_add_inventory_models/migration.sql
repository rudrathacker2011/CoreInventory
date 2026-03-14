-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('DRAFT', 'WAITING', 'READY', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MoveType" AS ENUM ('RECEIPT', 'DELIVERY', 'TRANSFER', 'ADJUSTMENT');

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Warehouse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "categoryId" TEXT,
    "unitOfMeasure" TEXT NOT NULL DEFAULT 'Units',
    "costPerUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReorderRule" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "minQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maxQty" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "ReorderRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockQuant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "StockQuant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "supplier" TEXT,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "responsibleId" TEXT NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptLine" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ReceiptLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryOrder" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "deliveryAddress" TEXT,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "operationType" TEXT NOT NULL DEFAULT 'delivery',
    "responsibleId" TEXT NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryLine" (
    "id" TEXT NOT NULL,
    "deliveryOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "DeliveryLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalTransfer" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "fromLocationId" TEXT NOT NULL,
    "toLocationId" TEXT NOT NULL,
    "responsibleId" TEXT NOT NULL,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransferLine" (
    "id" TEXT NOT NULL,
    "transferId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "TransferLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockAdjustment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "countedQty" DOUBLE PRECISION NOT NULL,
    "systemQty" DOUBLE PRECISION NOT NULL,
    "difference" DOUBLE PRECISION NOT NULL,
    "responsibleId" TEXT NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockAdjustment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockMove" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "moveType" "MoveType" NOT NULL,
    "productId" TEXT NOT NULL,
    "fromLocationId" TEXT,
    "toLocationId" TEXT,
    "quantity" DOUBLE PRECISION NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'DONE',
    "responsibleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiptId" TEXT,
    "deliveryOrderId" TEXT,
    "transferId" TEXT,
    "adjustmentId" TEXT,

    CONSTRAINT "StockMove_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sequence" (
    "id" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Sequence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_shortCode_key" ON "Warehouse"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "Location_shortCode_warehouseId_key" ON "Location"("shortCode", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_name_key" ON "ProductCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ReorderRule_productId_key" ON "ReorderRule"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "StockQuant_productId_locationId_key" ON "StockQuant"("productId", "locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_reference_key" ON "Receipt"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryOrder_reference_key" ON "DeliveryOrder"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "InternalTransfer_reference_key" ON "InternalTransfer"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "StockAdjustment_reference_key" ON "StockAdjustment"("reference");

-- CreateIndex
CREATE INDEX "StockMove_productId_idx" ON "StockMove"("productId");

-- CreateIndex
CREATE INDEX "StockMove_moveType_idx" ON "StockMove"("moveType");

-- CreateIndex
CREATE INDEX "StockMove_createdAt_idx" ON "StockMove"("createdAt");

-- CreateIndex
CREATE INDEX "StockMove_reference_idx" ON "StockMove"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Sequence_prefix_key" ON "Sequence"("prefix");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReorderRule" ADD CONSTRAINT "ReorderRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockQuant" ADD CONSTRAINT "StockQuant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockQuant" ADD CONSTRAINT "StockQuant_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptLine" ADD CONSTRAINT "ReceiptLine_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptLine" ADD CONSTRAINT "ReceiptLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryOrder" ADD CONSTRAINT "DeliveryOrder_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLine" ADD CONSTRAINT "DeliveryLine_deliveryOrderId_fkey" FOREIGN KEY ("deliveryOrderId") REFERENCES "DeliveryOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryLine" ADD CONSTRAINT "DeliveryLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTransfer" ADD CONSTRAINT "InternalTransfer_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTransfer" ADD CONSTRAINT "InternalTransfer_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTransfer" ADD CONSTRAINT "InternalTransfer_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferLine" ADD CONSTRAINT "TransferLine_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "InternalTransfer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransferLine" ADD CONSTRAINT "TransferLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockAdjustment" ADD CONSTRAINT "StockAdjustment_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_responsibleId_fkey" FOREIGN KEY ("responsibleId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_deliveryOrderId_fkey" FOREIGN KEY ("deliveryOrderId") REFERENCES "DeliveryOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "InternalTransfer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMove" ADD CONSTRAINT "StockMove_adjustmentId_fkey" FOREIGN KEY ("adjustmentId") REFERENCES "StockAdjustment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

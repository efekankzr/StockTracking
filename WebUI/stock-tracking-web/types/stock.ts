export interface StockDto {
    id: number;
    productId: number;
    productName: string;
    barcode: string;
    warehouseId: number;
    warehouseName: string;
    quantity: number;
    averageCost?: number;
    lastPurchasePrice?: number;
}

export interface CreateStockEntryRequest {
    productId: number;
    warehouseId: number;
    quantity: number;
    processType: number;
    description?: string;
    unitPrice?: number;
    taxRate?: number;
}

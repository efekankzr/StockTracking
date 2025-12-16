export interface SaleDto {
    id: number;
    transactionNumber: string;
    transactionDate: string;
    warehouseName: string;
    salesPerson: string;
    paymentMethod: string;
    totalAmount: number;
    saleItems: SaleItemDto[];
}

export interface SaleItemDto {
    productName: string;
    barcode: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface CreateSaleItemRequest {
    productId: number;
    quantity: number;
    unitPrice: number;
}

export interface CreateSaleRequest {
    warehouseId: number;
    paymentMethod: number;
    actualSalesPersonId?: number;
    items: CreateSaleItemRequest[];
}

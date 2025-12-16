export interface TransferDto {
    id: number;
    transferNumber: string;
    sourceWarehouseName: string;
    targetWarehouseName: string;
    sourceWarehouseId: number;
    targetWarehouseId: number;
    productName: string;
    quantity: number;
    status: string;
    createdDate: string;
}

export interface CreateTransferRequest {
    sourceWarehouseId: number;
    targetWarehouseId: number;
    productId: number;
    quantity: number;
}

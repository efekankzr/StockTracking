export interface SaleDetailDto {
    saleId: number;
    productName: string;
    barcode: string;
    quantity: number;
    time: string;
    unitPrice: number;
    totalAmount: number;
    unitCost: number;
    profit: number;
}

export interface UserSalesReportDto {
    userId: number;
    fullName: string;
    role: string;
    totalQuantity: number;
    totalAmount: number;
    totalCost: number;
    totalProfit: number;
    profitMargin: number;
    sales: SaleDetailDto[];
}

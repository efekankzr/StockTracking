export interface DashboardSummaryDto {
    totalRevenue: number;
    dailyRevenue: number;
    monthlyRevenue: number;
    totalStockQuantity: number;
    totalEmployees: number;
    latestSales: LatestTransactionDto[];
}

export interface LatestTransactionDto {
    id: number;
    transactionNumber: string;
    date: string;
    salesPerson: string;
    warehouse: string;
    amount: number;
}

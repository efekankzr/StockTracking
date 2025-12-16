export interface ExpenseCategoryDto {
    id: number;
    name: string;
    description?: string;
    isTaxDeductible: boolean;
    defaultVatRate: number;
    hasWithholding: boolean;
    defaultWithholdingRate: number;
    isSystemDefault: boolean;
}

export interface CreateExpenseCategoryRequest {
    name: string;
    description?: string;
    isTaxDeductible: boolean;
    defaultVatRate: number;
    hasWithholding: boolean;
    defaultWithholdingRate: number;
}

export interface ExpenseTransactionDto {
    id: number;
    categoryName: string;
    warehouseName: string;
    userName: string;
    documentNumber: string;
    documentDate: string;
    description?: string;
    baseAmount: number;
    vatAmount: number;
    withholdingAmount: number;
    totalAmount: number;
}

export interface CreateExpenseTransactionRequest {
    expenseCategoryId: number;
    warehouseId: number;
    documentNumber: string;
    documentDate: string;
    description?: string;
    amount: number;
    isVatIncluded: boolean;
    vatRate?: number;
    withholdingRate?: number;
}

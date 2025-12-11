// --- ORTAK TİPLER ---
export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

// --- DASHBOARD ---
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

// --- AUTH (Giriş/Kayıt) ---
export interface LoginRequest {
  username: string;
  password?: string;
}

export interface CreateUserRequest {
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: string;
  warehouseId?: number | null;
}

export interface UserDto {
  id: number;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  warehouseId?: number;
  warehouseName?: string;
  isActive: boolean;
}

export interface TokenResponse {
  accessToken: string;
  expiration: string;
  userId: number;
  username: string;
  role: string;
}

// --- CATEGORY (Kategori) ---
export interface CategoryDto {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
  id: number;
}

// --- WAREHOUSE (Depo) ---
export interface WarehouseDto {
  id: number;
  name: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;

  // Kira Bilgileri
  rentTypeName?: string;
  rentTypeValue?: number;
  officialRentAmount: number;
  unofficialRentAmount: number;
  stopajRate: number;
  vatRate: number;

  isActive: boolean;
}

export interface CreateWarehouseRequest {
  name: string;
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;

  // Kira Bilgileri
  rentType: number; // 1: Şahıs, 2: Şirket
  officialRentAmount: number;
  unofficialRentAmount: number;
  stopajRate?: number;
  vatRate?: number;
}

export interface UpdateWarehouseRequest extends CreateWarehouseRequest {
  id: number;
}

// --- PRODUCT (Ürün) ---
export interface ProductDto {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  barcode: string;
  image?: string;
  salePrice: number;
  taxRateSelling: number;
  isActive: boolean;
}

export interface ProductListDto {
  id: number;
  name: string;
  barcode: string;
  categoryName: string;
  salePrice: number;
  totalStockQuantity: number;
  isActive?: boolean;
}

export interface CreateProductRequest {
  categoryId: number;
  name: string;
  barcode: string;
  image?: string;
  salePrice: number;
  taxRateSelling: number;
}

export interface UpdateProductRequest extends CreateProductRequest {
  id: number;
}

// --- STOCK (Stok) ---
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

// --- SALE (Satış) ---
export interface SaleDto {
  id: number;
  transactionNumber: string;
  transactionDate: string;
  warehouseName: string;
  salesPerson: string;
  paymentMethod: string;
  totalAmount: number;
  totalVatAmount: number;
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
  priceWithVat?: number;
  vatRate?: number;
}

export interface CreateSaleRequest {
  warehouseId: number;
  paymentMethod: number;
  actualSalesPersonId?: number;
  items: CreateSaleItemRequest[];
}

// --- TRANSFER ---
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

// --- REPORT ---
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

// --- ROLE ---
export interface RoleDto {
  id: number;
  name: string;
}

export interface CreateRoleRequest {
  name: string;
}

// --- EXPENSE (GİDER) ---
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

// --- SYSTEM SETUP ---
export interface UpdateUserRequest {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  warehouseId: number | null;
  role: string;
}

export interface SetupStatus {
  hasCategories: boolean;
  hasWarehouses: boolean;
  hasProducts: boolean;
  isSystemReady: boolean;
}
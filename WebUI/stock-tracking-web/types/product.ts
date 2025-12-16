export interface ProductDto {
    id: number;
    categoryId: number;
    categoryName: string;
    name: string;
    normalizedName?: string;
    barcode: string;
    image?: string;
    salePrice: number;
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
}

export interface UpdateProductRequest extends CreateProductRequest {
    id: number;
}

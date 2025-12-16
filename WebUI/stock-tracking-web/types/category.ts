export interface CategoryDto {
    id: number;
    name: string;
    normalizedName?: string;
    isActive: boolean;
}

export interface CreateCategoryRequest {
    name: string;
}

export interface UpdateCategoryRequest extends CreateCategoryRequest {
    id: number;
}

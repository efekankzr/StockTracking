export interface WarehouseDto {
    id: number;
    name: string;
    normalizedName?: string;
    address: string;
    city: string;
    district: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
}

export interface CreateWarehouseRequest {
    name: string;
    address: string;
    city: string;
    district: string;
    latitude: number;
    longitude: number;
}

export interface UpdateWarehouseRequest extends CreateWarehouseRequest {
    id: number;
}

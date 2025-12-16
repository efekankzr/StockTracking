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

export interface UpdateUserRequest {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    warehouseId: number | null;
    role: string;
}

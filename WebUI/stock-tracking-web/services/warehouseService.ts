import api from '@/lib/api';
import {
  WarehouseDto,
  CreateWarehouseRequest,
  UpdateWarehouseRequest
} from '@/types/warehouse';
import { ServiceResponse } from '@/types/common';

const warehouseService = {
  getAll: async () => {
    const response = await api.get<ServiceResponse<WarehouseDto[]>>('/warehouse');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ServiceResponse<WarehouseDto>>(`/warehouse/${id}`);
    return response.data;
  },

  create: async (data: CreateWarehouseRequest) => {
    const response = await api.post<ServiceResponse<WarehouseDto>>('/warehouse', data);
    return response.data;
  },

  update: async (data: UpdateWarehouseRequest) => {
    const response = await api.put<ServiceResponse<boolean>>('/warehouse', data);
    return response.data;
  },

  archive: async (id: number) => {
    const response = await api.delete<ServiceResponse<boolean>>(`/warehouse/${id}`);
    return response.data;
  },

  restore: async (id: number) => {
    const response = await api.put<ServiceResponse<boolean>>(`/warehouse/activate/${id}`, {});
    return response.data;
  },

  permanentDelete: async (id: number) => {
    const response = await api.delete<ServiceResponse<boolean>>(`/warehouse/hard-delete/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ServiceResponse<boolean>>(`/warehouse/${id}`);
    return response.data;
  },
};

export default warehouseService;
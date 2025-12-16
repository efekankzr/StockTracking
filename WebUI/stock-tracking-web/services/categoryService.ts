import api from '@/lib/api';
import {
  CategoryDto,
  CreateCategoryRequest,
  UpdateCategoryRequest
} from '@/types/category';
import { ServiceResponse } from '@/types/common';

const categoryService = {
  getAll: async () => {
    const response = await api.get<ServiceResponse<CategoryDto[]>>('/category');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ServiceResponse<CategoryDto>>(`/category/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryRequest) => {
    const response = await api.post<ServiceResponse<CategoryDto>>('/category', data);
    return response.data;
  },

  update: async (data: UpdateCategoryRequest) => {
    const response = await api.put<ServiceResponse<boolean>>('/category', data);
    return response.data;
  },

  archive: async (id: number) => {
    const response = await api.delete<ServiceResponse<boolean>>(`/category/${id}`);
    return response.data;
  },

  restore: async (id: number) => {
    const response = await api.put<ServiceResponse<boolean>>(`/category/activate/${id}`, {});
    return response.data;
  },

  permanentDelete: async (id: number) => {
    const response = await api.delete<ServiceResponse<boolean>>(`/category/hard-delete/${id}`);
    return response.data;
  },
};

export default categoryService;
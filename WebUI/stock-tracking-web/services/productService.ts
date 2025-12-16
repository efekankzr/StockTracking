import api from '@/lib/api';
import {
  ProductDto,
  ProductListDto,
  CreateProductRequest,
  UpdateProductRequest
} from '@/types/product';
import { ServiceResponse } from '@/types/common';

const productService = {
  getAll: async () => {
    const response = await api.get<ServiceResponse<ProductListDto[]>>('/product');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<ServiceResponse<ProductDto>>(`/product/${id}`);
    return response.data;
  },

  create: async (data: CreateProductRequest) => {
    const response = await api.post<ServiceResponse<ProductDto>>('/product', data);
    return response.data;
  },

  update: async (data: UpdateProductRequest) => {
    const response = await api.put<ServiceResponse<boolean>>('/product', data);
    return response.data;
  },

  archive: async (id: number) => {
    const response = await api.delete<ServiceResponse<boolean>>(`/product/${id}`);
    return response.data;
  },

  restore: async (id: number) => {
    const response = await api.put<ServiceResponse<boolean>>(`/product/activate/${id}`, {});
    return response.data;
  },

  permanentDelete: async (id: number) => {
    const response = await api.delete<ServiceResponse<boolean>>(`/product/hard-delete/${id}`);
    return response.data;
  },

  delete: async (id: number) => {
    return await api.delete<ServiceResponse<boolean>>(`/product/${id}`).then(res => res.data);
  }
};

export default productService;
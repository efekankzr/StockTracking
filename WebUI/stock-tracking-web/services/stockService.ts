import api from '@/lib/api';
import { StockDto, CreateStockEntryRequest, ServiceResponse } from '@/types';

const stockService = {
  getAll: async () => {
    const response = await api.get<ServiceResponse<StockDto[]>>('/stock');
    return response.data;
  },

  getByProduct: async (productId: number) => {
    const response = await api.get<ServiceResponse<StockDto[]>>(`/stock/product/${productId}`);
    return response.data;
  },

  createEntry: async (data: CreateStockEntryRequest) => {
    const response = await api.post<ServiceResponse<boolean>>('/stock/entry', data);
    return response.data;
  },
};

export default stockService;
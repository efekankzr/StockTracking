import api from '@/lib/api';
import { TransferDto, CreateTransferRequest, ServiceResponse } from '@/types';

const transferService = {
  getAll: async () => {
    const response = await api.get<ServiceResponse<TransferDto[]>>('/transfer');
    return response.data;
  },

  getByWarehouse: async (warehouseId: number) => {
    return transferService.getAll();
  },

  create: async (data: CreateTransferRequest) => {
    const response = await api.post<ServiceResponse<boolean>>('/transfer/create', data);
    return response.data;
  },

  approve: async (id: number) => {
    const response = await api.post<ServiceResponse<boolean>>(`/transfer/approve/${id}`);
    return response.data;
  },

  cancel: async (id: number) => {
    const response = await api.post<ServiceResponse<boolean>>(`/transfer/cancel/${id}`);
    return response.data;
  },
};

export default transferService;
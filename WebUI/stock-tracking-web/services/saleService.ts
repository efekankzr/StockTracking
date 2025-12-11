import api from '@/lib/api';
import { SaleDto, CreateSaleRequest, ServiceResponse, UserSalesReportDto, DashboardSummaryDto } from '@/types';

const saleService = {
  getAll: async () => {
    const response = await api.get<ServiceResponse<SaleDto[]>>('/sale');
    return response.data;
  },

  create: async (data: CreateSaleRequest) => {
    const response = await api.post<ServiceResponse<SaleDto>>('/sale', data);
    return response.data;
  },

  getDailyReport: async (date: Date) => {
    const dateString = date.toISOString();
    const response = await api.get<ServiceResponse<UserSalesReportDto[]>>(`/sale/report?date=${dateString}`);
    return response.data;
  },

  getDashboardSummary: async () => {
    const response = await api.get<ServiceResponse<DashboardSummaryDto>>('/sale/summary');
    return response.data;
  },
};

export default saleService;
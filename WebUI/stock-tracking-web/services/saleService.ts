import api from '@/lib/api';
import { SaleDto, CreateSaleRequest } from '@/types/sale';
import { UserSalesReportDto } from '@/types/report';
import { DashboardSummaryDto } from '@/types/dashboard';
import { ServiceResponse } from '@/types/common';
import { format } from 'date-fns';

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
    const dateString = format(date, 'yyyy-MM-dd');
    const response = await api.get<ServiceResponse<UserSalesReportDto[]>>(`/sale/report?date=${dateString}`);
    return response.data;
  },

  getMonthlyReport: async (year: number, month: number) => {
    const response = await api.get<ServiceResponse<UserSalesReportDto[]>>(`/sale/report/monthly?year=${year}&month=${month}`);
    return response.data;
  },

  getDashboardSummary: async () => {
    const response = await api.get<ServiceResponse<DashboardSummaryDto>>('/sale/summary');
    return response.data;
  },
};

export default saleService;
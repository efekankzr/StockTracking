import api from '@/lib/api';
import { 
  ServiceResponse,
  ExpenseCategoryDto,
  CreateExpenseCategoryRequest,
  ExpenseTransactionDto,
  CreateExpenseTransactionRequest
} from '@/types';

const expenseService = {
  // --- KATEGORİ İŞLEMLERİ ---
  getAllCategories: async () => {
    const response = await api.get<ServiceResponse<ExpenseCategoryDto[]>>('/expense/category');
    return response.data;
  },
  createCategory: async (data: CreateExpenseCategoryRequest) => {
    const response = await api.post<ServiceResponse<ExpenseCategoryDto>>('/expense/category', data);
    return response.data;
  },
  deleteCategory: async (id: number) => {
    const response = await api.delete<ServiceResponse<boolean>>(`/expense/category/${id}`);
    return response.data;
  },

  // --- FİŞ İŞLEMLERİ ---
  getAllTransactions: async () => {
    const response = await api.get<ServiceResponse<ExpenseTransactionDto[]>>('/expense/transaction');
    return response.data;
  },
  createTransaction: async (data: CreateExpenseTransactionRequest) => {
    const response = await api.post<ServiceResponse<boolean>>('/expense/transaction', data);
    return response.data;
  },
  deleteTransaction: async (id: number) => {
    const response = await api.delete<ServiceResponse<boolean>>(`/expense/transaction/${id}`);
    return response.data;
  }
};

export default expenseService;
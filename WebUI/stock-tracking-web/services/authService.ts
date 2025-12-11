import api from '@/lib/api';
import { LoginRequest, ServiceResponse, TokenResponse } from '@/types';

const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ServiceResponse<TokenResponse>>('/auth/login', data);
    return response.data;
  },
};

export default authService;
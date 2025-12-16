import api from '@/lib/api';
import { LoginRequest, TokenResponse } from '@/types/auth'; // Combined
import { ServiceResponse } from '@/types/common';

const authService = {
  login: async (data: LoginRequest) => {
    const response = await api.post<ServiceResponse<TokenResponse>>('/auth/login', data);
    return response.data;
  },
};

export default authService;
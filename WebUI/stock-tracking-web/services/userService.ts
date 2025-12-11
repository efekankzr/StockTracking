import api from '@/lib/api';
import { CreateUserRequest, ServiceResponse, UserDto } from '@/types';

const userService = {
  getAll: async () => {
    const response = await api.get<ServiceResponse<UserDto[]>>('/user');
    return response.data;
  },

  create: async (data: CreateUserRequest) => {
    const response = await api.post<ServiceResponse<boolean>>('/user/create', data);
    return response.data;
  },
};

export default userService;
import api from '@/lib/api';
import { CreateUserRequest, UpdateUserRequest, UserDto, ServiceResponse } from '@/types';

const userService = {
  getAll: async () => {
    const response = await api.get<ServiceResponse<UserDto[]>>('/user');
    return response.data;
  },

  create: async (data: CreateUserRequest) => {
    const response = await api.post<ServiceResponse<boolean>>('/user/create', data);
    return response.data;
  },

  update: async (data: UpdateUserRequest) => { // Added update method
    const response = await api.put<ServiceResponse<boolean>>('/user', data); // Assuming /user is the endpoint for update
    return response.data;
  },
};

export default userService;
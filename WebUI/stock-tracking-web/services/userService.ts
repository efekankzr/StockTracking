import api from '@/lib/api';
import { CreateUserRequest, UpdateUserRequest, UserDto } from '@/types/auth'; // UserDto is in auth in my split
import { ServiceResponse } from '@/types/common';

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
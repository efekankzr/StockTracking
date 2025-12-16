import api from '@/lib/api';
import { RoleDto, CreateRoleRequest } from '@/types/role';
import { ServiceResponse } from '@/types/common';

const roleService = {
  getAll: async () => {
    const response = await api.get<ServiceResponse<RoleDto[]>>('/role');
    return response.data;
  },

  create: async (data: CreateRoleRequest) => {
    const response = await api.post<ServiceResponse<boolean>>('/role', data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await api.delete<ServiceResponse<boolean>>(`/role/${id}`);
    return response.data;
  },
};

export default roleService;
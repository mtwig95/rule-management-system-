import { api } from './axios';

export const getRulesByTenant = async (tenantId: string, page = 1, limit = 20) => {
    const res = await api.get(`/rules/${tenantId}?page=${page}&limit=${limit}`);
    return res.data;
};

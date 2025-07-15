import { api } from './axios';
import { Rule } from '../types/rule';

export const getRules = async (
    tenantId: string,
    page: number,
    limit: number = 10
): Promise<{ data: Rule[]; total: number }> => {
  const response = await api.get(`/rules/${tenantId}?page=${page}&limit=${limit}`);
  return response.data;
};

export const createRule = async (rule: Partial<Rule>) => {
  const res = await api.post('/rules', rule);
  return res.data;
};

export const deleteRule = async (ruleId: string) => {
  const res = await api.delete(`/rules/${ruleId}`);
  return res.data;
};

export const reorderRule = async (
    id: string,
    data: { beforeId?: string | null; afterId?: string | null }
) => {
  return api.post(`/rules/${id}/reorder`, data);
};

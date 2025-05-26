import axios from 'axios';
import { Page404 } from '@/app/api/aicreate/route';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || ''
});

export const page404Api = {
  create: async (prompt: string): Promise<Page404> => {
    const { data } = await api.post<Page404>('/api/aicreate', { prompt });
    return data;
  },
  
  getAll: async (): Promise<Page404[]> => {
    const { data } = await api.get<Page404[]>('/api/aicreate');
    return data;
  }
};

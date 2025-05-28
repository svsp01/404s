import axios from 'axios';
import { Page404 } from '@/app/api/aicreate/route';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Access-Control-Allow-Origin': '*',
  }
});

export const page404Api = {
  create: async (prompt: string): Promise<Page404> => {
    console.log('page404Api.create() - calling API with prompt:', prompt);
    try {
      const { data } = await api.post<Page404>('/api/aicreate', { prompt });
      console.log('page404Api.create() - API responded with:', data);
      return data;
    } catch (error) {
      console.error('page404Api.create() - API call failed:', error);
      throw error;
    }
  },
  
  getAll: async (): Promise<Page404[]> => {
    try {
      const { data } = await api.get<Page404[]>('/api/aicreate');
      return data;
    } catch (error) {
      console.error('page404Api.getAll() - API call failed:', error);
      throw error;
    }
  }
};

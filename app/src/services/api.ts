import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

// Get API URL with proper error handling
const getApiUrl = (): string => {
  try {
    // Try to access Vite's environment variables
    const env = (import.meta as any).env;
    if (env && env.VITE_API_URL) {
      return env.VITE_API_URL;
    }
  } catch (error) {
    console.warn('Could not access import.meta.env:', error);
  }

  // Fallback to default
  return 'http://localhost:5001/api';
};

const API_BASE_URL = getApiUrl();

// Debug: Log the API URL being used
console.log('API_BASE_URL:', API_BASE_URL);

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.get(url);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      console.log('Making POST request to:', this.api.defaults.baseURL + url);
      const response = await this.api.post(url, data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url);
      return response.data;
    } catch (error: any) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      ok: false,
      code: 'NETWORK_ERROR',
      message: 'Network error occurred',
    };
  }
}

export default new ApiService();

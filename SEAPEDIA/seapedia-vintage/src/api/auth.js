import { apiClient } from './client';

export const register = (payload) => apiClient.post('/auth/register', payload);
export const login = (payload) => apiClient.post('/auth/login', payload);
export const selectRole = (payload) => apiClient.post('/auth/select-role', payload);
export const switchRole = (role) => apiClient.post('/auth/switch-role', { role });
export const addRole = (role) => apiClient.post('/auth/roles', { role });
export const getMe = () => apiClient.get('/auth/me');
export const logout = () => apiClient.post('/auth/logout');

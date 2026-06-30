import { apiClient } from './client';

export const getMyStore = () => apiClient.get('/stores/me/profile');
export const upsertMyStore = (payload) => apiClient.put('/stores/me/profile', payload);
export const getPublicStore = (storeId) => apiClient.get(`/stores/${storeId}`);
export const listPublicStores = () => apiClient.get('/stores');

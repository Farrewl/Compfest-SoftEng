import { apiClient } from './client';

export const listMyProducts = () => apiClient.get('/products/me/mine');
export const createProduct = (payload) => apiClient.post('/products/me/mine', payload);
export const updateProduct = (productId, payload) => apiClient.put(`/products/me/mine/${productId}`, payload);
export const deleteProduct = (productId) => apiClient.delete(`/products/me/mine/${productId}`);
export const listPublicProducts = (params) => apiClient.get('/products', { params });
export const getPublicProduct = (productId) => apiClient.get(`/products/${productId}`);

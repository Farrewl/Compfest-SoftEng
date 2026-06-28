import { apiClient } from './client';

export const submitReview = (payload) => apiClient.post('/reviews', payload);
export const getReviews = (params) => apiClient.get('/reviews', { params });
export const getReviewSummary = () => apiClient.get('/reviews/summary');

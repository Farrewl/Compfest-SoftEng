import { asyncHandler } from '../../utils/asyncHandler.js';
import * as reviewService from './review.service.js';
import { createReviewSchema, listReviewsQuerySchema } from './review.validators.js';

export const submitReview = asyncHandler(async (req, res) => {
  const data = createReviewSchema.parse(req.body);
  const review = await reviewService.createReview({
    ...data,
    userId: req.user?.id,
  });
  res.status(201).json({
    success: true,
    message: 'Terima kasih atas ulasannya!',
    data: review,
  });
});

export const getReviews = asyncHandler(async (req, res) => {
  const { page, limit } = listReviewsQuerySchema.parse(req.query);
  const result = await reviewService.listReviews({ page, limit });
  res.status(200).json({ success: true, ...result });
});

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await reviewService.getReviewSummary();
  res.status(200).json({ success: true, data: summary });
});

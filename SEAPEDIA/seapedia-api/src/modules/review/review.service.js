import sanitizeHtml from 'sanitize-html';
import { prisma } from '../../lib/prisma.js';

// allowedTags & allowedAttributes kosong = SEMUA tag HTML/script dibuang,
// hanya teks polos yang tersisa. Ini lapisan pertahanan pertama anti-XSS
// (di-simpan sudah bersih), React di frontend jadi lapisan kedua (otomatis
// escape saat render selama tidak memakai dangerouslySetInnerHTML).
const SANITIZE_OPTIONS = { allowedTags: [], allowedAttributes: {} };
const sanitizeText = (text) => sanitizeHtml(text, SANITIZE_OPTIONS).trim();

export const createReview = async ({ name, rating, comment, userId }) => {
  const safeName = sanitizeText(name && name.length > 0 ? name : 'Pengembara Anonim');
  const safeComment = sanitizeText(comment);

  const review = await prisma.review.create({
    data: {
      name: safeName,
      rating,
      comment: safeComment,
      userId: userId || null,
    },
  });

  return review;
};

export const listReviews = async ({ page, limit }) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count(),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const getReviewSummary = async () => {
  const reviews = await prisma.review.findMany({ select: { rating: true } });
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2))
    : 0;

  return { totalReviews, averageRating };
};

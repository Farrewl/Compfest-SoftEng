import { Router } from 'express';
import * as productController from './product.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { ROLES } from '../../constants/enums.js';

const router = Router();

// Publik
router.get('/', productController.listPublicProductsHandler);
router.get('/:productId', productController.getPublicProductHandler);

// Privat - hanya role aktif Seller
router.get('/me/mine', requireAuth, requireRole(ROLES.SELLER), productController.listMyProductsHandler);
router.post('/me/mine', requireAuth, requireRole(ROLES.SELLER), productController.createProductHandler);
router.put('/me/mine/:productId', requireAuth, requireRole(ROLES.SELLER), productController.updateProductHandler);
router.delete('/me/mine/:productId', requireAuth, requireRole(ROLES.SELLER), productController.deleteProductHandler);

export default router;

import { Router } from 'express';
import * as storeController from './store.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { ROLES } from '../../constants/enums.js';

const router = Router();

// Publik
router.get('/', storeController.listPublicStoresHandler);
router.get('/:storeId', storeController.getPublicStoreHandler);

// Privat - hanya role aktif Seller yang boleh kelola toko sendiri
router.get('/me/profile', requireAuth, requireRole(ROLES.SELLER), storeController.getMyStoreHandler);
router.put('/me/profile', requireAuth, requireRole(ROLES.SELLER), storeController.upsertMyStoreHandler);

export default router;

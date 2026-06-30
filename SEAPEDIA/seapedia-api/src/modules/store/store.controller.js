import { asyncHandler } from '../../utils/asyncHandler.js';
import * as storeService from './store.service.js';
import { upsertStoreSchema } from './store.validators.js';

export const getMyStoreHandler = asyncHandler(async (req, res) => {
  const store = await storeService.getMyStore(req.user.id);
  res.status(200).json({ success: true, data: store });
});

export const upsertMyStoreHandler = asyncHandler(async (req, res) => {
  const data = upsertStoreSchema.parse(req.body);
  const store = await storeService.upsertMyStore(req.user.id, data);
  res.status(200).json({ success: true, message: 'Profil toko berhasil disimpan', data: store });
});

export const getPublicStoreHandler = asyncHandler(async (req, res) => {
  const store = await storeService.getPublicStore(req.params.storeId);
  res.status(200).json({ success: true, data: store });
});

export const listPublicStoresHandler = asyncHandler(async (req, res) => {
  const stores = await storeService.listPublicStores();
  res.status(200).json({ success: true, data: stores });
});

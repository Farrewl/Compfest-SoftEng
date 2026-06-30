import { asyncHandler } from '../../utils/asyncHandler.js';
import * as productService from './product.service.js';
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
} from './product.validators.js';

export const createProductHandler = asyncHandler(async (req, res) => {
  const data = createProductSchema.parse(req.body);
  const product = await productService.createProduct(req.user.id, data);
  res.status(201).json({ success: true, message: 'Produk berhasil ditambahkan', data: product });
});

export const updateProductHandler = asyncHandler(async (req, res) => {
  const data = updateProductSchema.parse(req.body);
  const product = await productService.updateProduct(req.user.id, req.params.productId, data);
  res.status(200).json({ success: true, message: 'Produk berhasil diperbarui', data: product });
});

export const deleteProductHandler = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.user.id, req.params.productId);
  res.status(200).json({ success: true, message: 'Produk berhasil dihapus' });
});

export const listMyProductsHandler = asyncHandler(async (req, res) => {
  const products = await productService.listMyProducts(req.user.id);
  res.status(200).json({ success: true, data: products });
});

export const listPublicProductsHandler = asyncHandler(async (req, res) => {
  const query = listProductsQuerySchema.parse(req.query);
  const result = await productService.listPublicProducts(query);
  res.status(200).json({ success: true, ...result });
});

export const getPublicProductHandler = asyncHandler(async (req, res) => {
  const product = await productService.getPublicProduct(req.params.productId);
  res.status(200).json({ success: true, data: product });
});

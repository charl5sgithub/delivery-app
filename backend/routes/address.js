import express from 'express';
import * as addressController from '../controllers/addressController.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// All address routes require at least 'User' role
const authMiddleware = requireRole(['User', 'Admin', 'SuperUser']);

router.get('/', authMiddleware, addressController.getAddresses);
router.post('/', authMiddleware, addressController.createAddress);
router.put('/:id', authMiddleware, addressController.updateAddress);
router.delete('/:id', authMiddleware, addressController.deleteAddress);
router.patch('/:id/default', authMiddleware, addressController.setDefaultAddress);

export default router;

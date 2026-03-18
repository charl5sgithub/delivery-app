import express from 'express';
import * as profileController from '../controllers/profileController.js';
import { requireRole } from '../middleware/auth.js';

const router = express.Router();

// All profile routes require at least 'User' role
const authMiddleware = requireRole(['User', 'Admin', 'SuperUser']);

router.get('/', authMiddleware, profileController.getProfile);
router.put('/', authMiddleware, profileController.updateProfile);

export default router;

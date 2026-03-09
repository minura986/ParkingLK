import express from 'express';
import { protect, superAdmin, carOwner } from '../middleware/authMiddleware.js';
import {
    getAdminRevenueStats,
    processOwnerPayout,
    getOwnerRevenueStats
} from '../controllers/revenueController.js';

const router = express.Router();

// Super Admin routes
router.get('/admin', protect, superAdmin, getAdminRevenueStats);
router.put('/admin/payout/:ownerId', protect, superAdmin, processOwnerPayout);

// Owner routes
router.get('/owner', protect, carOwner, getOwnerRevenueStats);

export default router;

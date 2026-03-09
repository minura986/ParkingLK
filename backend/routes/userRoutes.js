import express from 'express';
import {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    updateUserRole
} from '../controllers/userController.js';
import { protect, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(registerUser)
    .get(protect, superAdmin, getUsers);

router.post('/login', authUser);

router.route('/:id')
    .delete(protect, superAdmin, deleteUser);

router.route('/:id/role')
    .put(protect, superAdmin, updateUserRole);

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

export default router;

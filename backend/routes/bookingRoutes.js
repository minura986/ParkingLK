import express from 'express';
import { createBooking, getMyBookings, getAllBookings, updateBookingStatus, cancelBooking, checkInBooking, extendBooking, checkOutBooking, getBookingById, getOwnerBookings, payBooking, payExtraCharges } from '../controllers/bookingController.js';
import { protect, superAdmin, carOwner } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createBooking);
router.route('/all').get(protect, superAdmin, getAllBookings);
router.route('/owner').get(protect, carOwner, getOwnerBookings);
router.route('/mybookings').get(protect, getMyBookings);
router.route('/:id/status').put(protect, carOwner, updateBookingStatus);
router.route('/:id/cancel').put(protect, cancelBooking);
router.route('/:id/checkin').put(protect, checkInBooking); // Might need operator protect later
router.route('/:id/extend').put(protect, extendBooking);
router.route('/:id/checkout').put(protect, checkOutBooking);
router.route('/:id/pay').put(protect, payBooking);
router.route('/:id/pay-extra').put(protect, payExtraCharges);
router.route('/:id').get(protect, getBookingById);

export default router;

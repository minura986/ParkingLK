import express from 'express';
import {
    getCarParks,
    getCarParkById,
    createCarPark,
    searchCarParks,
    addAttendant,
    getAttendants,
    removeAttendant,
    updateCarPark,
    getAdminCarParks,
    updateCarParkStatus
} from '../controllers/carParkController.js';
import { getCarParkSlots, addSlotToCarPark, deleteSlot, updateSlot } from '../controllers/slotController.js';
import { protect, carOwner, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Car Park Routes
router.get('/admin', protect, superAdmin, getAdminCarParks);
router.put('/:id/status', protect, superAdmin, updateCarParkStatus);
router.get('/search', searchCarParks); // Must be above /:id
router.route('/').get(getCarParks).post(protect, carOwner, createCarPark);
router.route('/:id')
    .get(getCarParkById)
    .put(protect, updateCarPark);

// Slot Routes (Nested)
router.route('/:carparkId/slots')
    .get(getCarParkSlots)
    .post(protect, carOwner, addSlotToCarPark);

router.route('/:carparkId/slots/:slotId')
    .put(protect, carOwner, updateSlot)
    .delete(protect, carOwner, deleteSlot);

// Attendant Routes
router.route('/:id/attendants')
    .post(protect, carOwner, addAttendant)
    .get(protect, carOwner, getAttendants);

router.route('/:id/attendants/:attendantId')
    .delete(protect, carOwner, removeAttendant);

export default router;

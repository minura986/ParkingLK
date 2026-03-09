import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import CarPark from '../models/CarPark.js';
import { io } from '../server.js';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
    const { car_park, slot, start_time, end_time, total_amount } = req.body;

    try {
        // 1. Verify slot is actually available (Basic check, robust systems need time overlap checks)
        const slotDoc = await ParkingSlot.findById(slot);
        if (!slotDoc || slotDoc.status !== 'available') {
            return res.status(400).json({ message: 'Slot is not currently available' });
        }

        const booking = new Booking({
            user: req.user._id,
            car_park,
            slot,
            start_time,
            end_time,
            total_amount,
        });

        const createdBooking = await booking.save();

        // 2. Temporarily mark slot as reserved pending payment
        slotDoc.status = 'reserved';
        await slotDoc.save();

        // 3. Trigger Socket.io event here to update map in real-time
        const updatedCarPark = await CarPark.findById(car_park).select('-owner -admins');
        io.emit('carParkUpdated', updatedCarPark);

        // 4. Send Email Notification
        await sendEmail({
            email: req.user.email,
            subject: 'ParkingLK Booking Confirmed',
            message: `
                <h1>Your Booking is Confirmed!</h1>
                <p>You have successfully booked a slot at <strong>${updatedCarPark.name}</strong>.</p>
                <p>Start Time: ${new Date(start_time).toLocaleString()}</p>
                <p>End Time: ${new Date(end_time).toLocaleString()}</p>
                <p>Total Amount: Rs. ${total_amount}</p>
                <p>Please present your QR code from the My Bookings page upon arrival.</p>
            `
        });

        res.status(201).json(createdBooking);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('car_park', 'name address location images price_per_hour')
            .populate('slot', 'slot_number type')
            .sort({ start_time: -1 });

        const now = new Date();
        const bookingsWithPending = bookings.map(booking => {
            let pendingExtraCharges = 0;
            let pendingExtraTimeMinutes = 0;
            if (booking.booking_status === 'active') {
                const endTime = new Date(booking.end_time);
                if (now > endTime) {
                    const extraTimeMs = now - endTime;
                    pendingExtraTimeMinutes = Math.floor(extraTimeMs / (1000 * 60));
                    const extra10MinBlocks = Math.ceil(pendingExtraTimeMinutes / 10);
                    if (extra10MinBlocks > 0) {
                        const hourlyRate = booking.car_park ? (booking.car_park.price_per_hour || 60) : 60;
                        pendingExtraCharges = Math.round(extra10MinBlocks * (hourlyRate / 6));
                    }
                }
            }
            const bObj = booking.toObject();

            // Retroactively calculate for older completed bookings without extra_charges_time
            if (bObj.booking_status === 'completed' && bObj.extra_charges > 0 && !bObj.extra_charges_time && bObj.actual_exit_time) {
                const extraTimeMs = new Date(bObj.actual_exit_time) - new Date(bObj.end_time);
                bObj.extra_charges_time = Math.floor(extraTimeMs / (1000 * 60));
            }

            bObj.pending_extra_charges = pendingExtraCharges;
            bObj.pending_extra_charges_time = pendingExtraTimeMinutes;
            return bObj;
        });

        bookingsWithPending.sort((a, b) => {
            if (a.booking_status === 'active' && b.booking_status !== 'active') return -1;
            if (a.booking_status !== 'active' && b.booking_status === 'active') return 1;
            return 0;
        });

        res.json(bookingsWithPending);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

// @desc    Get bookings for car parks owned by user
// @route   GET /api/bookings/owner
// @access  Private/Owner
export const getOwnerBookings = async (req, res) => {
    try {
        const ownedCarParks = await CarPark.find({ owner: req.user._id }).select('_id');
        const carParkIds = ownedCarParks.map(cp => cp._id);

        const bookings = await Booking.find({ car_park: { $in: carParkIds } })
            .populate('user', 'name email phone')
            .populate('car_park', 'name address price_per_hour')
            .populate('slot', 'slot_number type status')
            .sort({ createdAt: -1 });

        const now = new Date();
        const bookingsWithPending = bookings.map(booking => {
            let pendingExtraCharges = 0;
            let pendingExtraTimeMinutes = 0;
            if (booking.booking_status === 'active') {
                const endTime = new Date(booking.end_time);
                if (now > endTime) {
                    const extraTimeMs = now - endTime;
                    pendingExtraTimeMinutes = Math.floor(extraTimeMs / (1000 * 60));
                    const extra10MinBlocks = Math.ceil(pendingExtraTimeMinutes / 10);
                    if (extra10MinBlocks > 0) {
                        const hourlyRate = booking.car_park ? (booking.car_park.price_per_hour || 60) : 60;
                        pendingExtraCharges = Math.round(extra10MinBlocks * (hourlyRate / 6));
                    }
                }
            }
            const bObj = booking.toObject();

            // Retroactively calculate for older completed bookings without extra_charges_time
            if (bObj.booking_status === 'completed' && bObj.extra_charges > 0 && !bObj.extra_charges_time && bObj.actual_exit_time) {
                const extraTimeMs = new Date(bObj.actual_exit_time) - new Date(bObj.end_time);
                bObj.extra_charges_time = Math.floor(extraTimeMs / (1000 * 60));
            }

            bObj.pending_extra_charges = pendingExtraCharges;
            bObj.pending_extra_charges_time = pendingExtraTimeMinutes;
            return bObj;
        });

        res.json(bookingsWithPending);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

// @desc    Get all bookings (Super Admin)
// @route   GET /api/bookings/all
// @access  Private/SuperAdmin
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('user', 'name email phone')
            .populate('car_park', 'name address price_per_hour')
            .populate('slot', 'slot_number type')
            .sort({ createdAt: -1 });

        const now = new Date();
        const bookingsWithPending = bookings.map(booking => {
            let pendingExtraCharges = 0;
            let pendingExtraTimeMinutes = 0;
            if (booking.booking_status === 'active') {
                const endTime = new Date(booking.end_time);
                if (now > endTime) {
                    const extraTimeMs = now - endTime;
                    pendingExtraTimeMinutes = Math.floor(extraTimeMs / (1000 * 60));
                    const extra10MinBlocks = Math.ceil(pendingExtraTimeMinutes / 10);
                    if (extra10MinBlocks > 0) {
                        const hourlyRate = booking.car_park ? (booking.car_park.price_per_hour || 60) : 60;
                        pendingExtraCharges = Math.round(extra10MinBlocks * (hourlyRate / 6));
                    }
                }
            }
            const bObj = booking.toObject();

            // Retroactively calculate for older completed bookings without extra_charges_time
            if (bObj.booking_status === 'completed' && bObj.extra_charges > 0 && !bObj.extra_charges_time && bObj.actual_exit_time) {
                const extraTimeMs = new Date(bObj.actual_exit_time) - new Date(bObj.end_time);
                bObj.extra_charges_time = Math.floor(extraTimeMs / (1000 * 60));
            }

            bObj.pending_extra_charges = pendingExtraCharges;
            bObj.pending_extra_charges_time = pendingExtraTimeMinutes;
            return bObj;
        });

        res.json(bookingsWithPending);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

// @desc    Update booking status (Super Admin / Owner)
// @route   PUT /api/bookings/:id/status
// @access  Private/SuperAdmin/Owner
export const updateBookingStatus = async (req, res) => {
    try {
        const { booking_status, payment_status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const carPark = await CarPark.findById(booking.car_park);
        if (req.user.role !== 'super_admin' && (!carPark || carPark.owner.toString() !== req.user._id.toString())) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to manage this booking.' });
        }

        if (booking_status) booking.booking_status = booking_status;
        if (payment_status) booking.payment_status = payment_status;

        const updatedBooking = await booking.save();

        // If status changed to completed or cancelled, free the slot
        if (booking_status === 'completed' || booking_status === 'cancelled') {
            const slot = await ParkingSlot.findById(booking.slot);
            if (slot && slot.status !== 'available') {
                slot.status = 'available';
                await slot.save();

                // Emit event to update map for all viewers
                const updatedCarPark = await CarPark.findById(booking.car_park).select('-owner -admins');
                if (updatedCarPark) {
                    io.emit('carParkUpdated', updatedCarPark);
                }
            }
        }

        // Populate fields to return the updated booking properly
        const populatedBooking = await Booking.findById(updatedBooking._id)
            .populate('user', 'name email phone')
            .populate('car_park', 'name address price_per_hour')
            .populate('slot', 'slot_number type');

        res.json(populatedBooking);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify user owns the booking
        if (booking.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        if (booking.booking_status !== 'upcoming') {
            return res.status(400).json({ message: 'Only upcoming bookings can be cancelled' });
        }

        const now = new Date();
        const startTime = new Date(booking.start_time);

        if (now >= startTime) {
            return res.status(400).json({ message: 'Booking start time has passed, cancellation not allowed', refund: 0 });
        }

        const timeDiffMinutes = (startTime - now) / (1000 * 60);
        let refundPercentage = 0;

        if (timeDiffMinutes >= 60) {
            refundPercentage = 100;
        } else if (timeDiffMinutes >= 0) {
            refundPercentage = 50;
        }

        booking.booking_status = 'cancelled';
        if (refundPercentage > 0) {
            booking.payment_status = 'refunded'; // Simplified for now
        }
        await booking.save();

        // Free up the slot
        const slot = await ParkingSlot.findById(booking.slot);
        if (slot) {
            slot.status = 'available';
            await slot.save();

            // Emit event to update map for all viewers
            const updatedCarPark = await CarPark.findById(booking.car_park).select('-owner -admins');
            if (updatedCarPark) {
                io.emit('carParkUpdated', updatedCarPark);
            }
        }

        // Notify user via Socket.io
        io.to(booking.user.toString()).emit('bookingUpdated', {
            bookingId: booking._id,
            status: booking.booking_status
        });

        // Send Email Notification
        await sendEmail({
            email: req.user.email,
            subject: 'ParkingLK Booking Cancelled',
            message: `
                <h1>Booking Cancelled</h1>
                <p>Your booking has been successfully cancelled.</p>
                <p>Refund Percentage: ${refundPercentage}%</p>
                <p>If applicable, refunds will be processed soon.</p>
            `
        });

        res.json({
            message: 'Booking cancelled successfully',
            refund_percentage: refundPercentage,
            booking
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Check-in to a booking
// @route   PUT /api/bookings/:id/checkin
// @access  Private
export const checkInBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // --- Role-Based Access Control ---
        const carPark = await CarPark.findById(booking.car_park);
        if (req.user.role !== 'super_admin') {
            if (req.user.role === 'car_owner' && carPark.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized: You do not own this car park.' });
            }
            if (req.user.role === 'attendant' && !carPark.attendants.includes(req.user._id)) {
                return res.status(403).json({ message: 'Not authorized: You are not assigned to this car park.' });
            }
            if (req.user.role === 'user') {
                return res.status(403).json({ message: 'Not authorized: Users cannot manually check-in.' });
            }
        }
        // ---------------------------------

        if (booking.booking_status === 'cancelled' || booking.booking_status === 'cancelled_noshow') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        if (booking.booking_status === 'active' || booking.booking_status === 'completed') {
            return res.status(400).json({ message: 'Booking is already active or completed' });
        }

        const now = new Date();
        const startTime = new Date(booking.start_time);
        const lateThreshold = new Date(startTime.getTime() + 30 * 60000); // 30 mins late

        if (now > lateThreshold) {
            booking.booking_status = 'cancelled_noshow';
            await booking.save();

            const slot = await ParkingSlot.findById(booking.slot);
            if (slot) {
                slot.status = 'available';
                await slot.save();
            }
            return res.status(400).json({ message: 'Check-in failed: 30-minute holding period expired. Booking cancelled.' });
        }

        booking.booking_status = 'active';

        // Handle early check in: charge extra if they arrive > 10 minutes early
        let earlyArrivalCharge = 0;
        let earlyArrivalMins = 0;
        if (now < startTime) {
            const earlyMs = startTime - now;
            earlyArrivalMins = Math.floor(earlyMs / (1000 * 60));
            // Only charge if they are more than 10 mins early
            if (earlyArrivalMins > 10) {
                // Charge proportional rate per 10 minutes of early arrival
                const early10MinBlocks = Math.ceil(earlyArrivalMins / 10);
                const hourlyRate = carPark ? (carPark.price_per_hour || 60) : 60;
                earlyArrivalCharge = Math.round(early10MinBlocks * (hourlyRate / 6));

                // Add to extra_charges & extra_charges_time immediately
                // Or we can add it directly to total_amount
                booking.extra_charges += earlyArrivalCharge;
                booking.extra_charges_time += earlyArrivalMins;
                booking.total_amount += earlyArrivalCharge;
            }
            // Start the actual parking time from now so that standard end_time calculation remains intact
            booking.start_time = now;
        }

        await booking.save();

        const slot = await ParkingSlot.findById(booking.slot);
        if (slot) {
            slot.status = 'occupied';
            await slot.save();
        }

        // Notify user via Socket.io
        io.to(booking.user.toString()).emit('bookingUpdated', {
            bookingId: booking._id,
            status: booking.booking_status
        });

        res.json({ message: 'Successfully checked in', booking });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Extend an active booking
// @route   PUT /api/bookings/:id/extend
// @access  Private
export const extendBooking = async (req, res) => {
    try {
        const { extension_duration_hours } = req.body;

        if (!extension_duration_hours || isNaN(extension_duration_hours) || extension_duration_hours <= 0) {
            return res.status(400).json({ message: 'Valid extension duration is required' });
        }

        const booking = await Booking.findById(req.params.id).populate('car_park');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to extend this booking' });
        }

        // Only active bookings can be extended
        if (booking.booking_status !== 'active') {
            return res.status(400).json({ message: 'Only active bookings can be extended' });
        }

        const currentEndTime = new Date(booking.end_time);
        const extensionMs = extension_duration_hours * 60 * 60 * 1000;
        const newEndTime = new Date(currentEndTime.getTime() + extensionMs);

        // Check for collisions with other bookings for the same slot
        const collidingBooking = await Booking.findOne({
            slot: booking.slot,
            _id: { $ne: booking._id },
            booking_status: { $in: ['upcoming', 'active'] },
            start_time: { $lt: newEndTime }
        });

        if (collidingBooking) {
            return res.status(400).json({
                message: 'Cannot extend: Slot is booked by another user immediately after.',
                colliding_start_time: collidingBooking.start_time
            });
        }

        // Calculate extra fee
        let extraFee = 0;
        if (booking.car_park && booking.car_park.price_per_hour) {
            extraFee = extension_duration_hours * booking.car_park.price_per_hour;
        }

        booking.end_time = newEndTime;
        booking.total_amount += extraFee;

        await booking.save();

        res.json({
            message: 'Booking extended successfully',
            booking,
            extra_fee: extraFee
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Check-out of a booking (QR scan exit)
// @route   PUT /api/bookings/:id/checkout
// @access  Private
export const checkOutBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // --- Role-Based Access Control ---
        const carPark = await CarPark.findById(booking.car_park);
        if (req.user.role !== 'super_admin') {
            if (req.user.role === 'car_owner' && carPark.owner.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized: You do not own this car park.' });
            }
            if (req.user.role === 'attendant' && !carPark.attendants.includes(req.user._id)) {
                return res.status(403).json({ message: 'Not authorized: You are not assigned to this car park.' });
            }
            // Allow users to check themselves out manually from the app
            if (req.user.role === 'user' && booking.user.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized: You can only checkout your own bookings.' });
            }
        }
        // ---------------------------------

        if (booking.booking_status !== 'active') {
            return res.status(400).json({ message: 'Only active bookings can be checked out' });
        }

        const now = new Date();
        const endTime = new Date(booking.end_time);

        // Calculate penalty if checkout is after end_time
        let extraCharges = 0;
        let extraTimeMinutes = 0;
        if (now > endTime) {
            const extraTimeMs = now - endTime;
            extraTimeMinutes = Math.floor(extraTimeMs / (1000 * 60));
            // Proportional rate per 10 minutes
            const extra10MinBlocks = Math.ceil(extraTimeMinutes / 10);
            if (extra10MinBlocks > 0) {
                const hourlyRate = carPark ? (carPark.price_per_hour || 60) : 60;
                extraCharges = Math.round(extra10MinBlocks * (hourlyRate / 6));
            }
        }

        booking.actual_exit_time = now;
        booking.extra_charges = extraCharges;
        if (extraTimeMinutes > 0) {
            booking.extra_charges_time = extraTimeMinutes;
        }
        booking.booking_status = 'completed';

        // Add extra charges to total amount if needed, or keep it separate.
        // We will keep it separate in `extra_charges` but also optionally add to `total_amount` depending on how frontend displays it.
        // Adding it to total_amount ensures it's part of the comprehensive revenue.
        booking.total_amount += extraCharges;

        await booking.save();

        // Free up the slot
        const slot = await ParkingSlot.findById(booking.slot);
        if (slot) {
            slot.status = 'available';
            await slot.save();
        }

        // Notify user via Socket.io
        io.to(booking.user.toString()).emit('bookingUpdated', {
            bookingId: booking._id,
            status: booking.booking_status,
            extra_charges: extraCharges,
            extra_charges_time: extraTimeMinutes
        });

        res.json({
            message: 'Successfully checked out',
            extra_charges: extraCharges,
            extra_charges_time: extraTimeMinutes,
            booking
        });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('car_park', 'name address price_per_hour')
            .populate('slot', 'slot_number type status');

        if (booking) {
            // Calculate pending extra charges if booking is active and past end time
            let pendingExtraCharges = 0;
            let pendingExtraTimeMinutes = 0;

            if (booking.booking_status === 'active') {
                const now = new Date();
                const endTime = new Date(booking.end_time);
                if (now > endTime) {
                    const extraTimeMs = now - endTime;
                    pendingExtraTimeMinutes = Math.floor(extraTimeMs / (1000 * 60));
                    const extra10MinBlocks = Math.ceil(pendingExtraTimeMinutes / 10);
                    if (extra10MinBlocks > 0) {
                        const hourlyRate = booking.car_park ? (booking.car_park.price_per_hour || 60) : 60;
                        pendingExtraCharges = Math.round(extra10MinBlocks * (hourlyRate / 6));
                    }
                }
            }

            // Convert to object so we can add arbitrary fields
            const bookingObj = booking.toObject();

            // Retroactively calculate for older completed bookings without extra_charges_time
            if (bookingObj.booking_status === 'completed' && bookingObj.extra_charges > 0 && !bookingObj.extra_charges_time && bookingObj.actual_exit_time) {
                const extraTimeMs = new Date(bookingObj.actual_exit_time) - new Date(bookingObj.end_time);
                bookingObj.extra_charges_time = Math.floor(extraTimeMs / (1000 * 60));
            }

            bookingObj.pending_extra_charges = pendingExtraCharges;
            bookingObj.pending_extra_charges_time = pendingExtraTimeMinutes;

            res.json(bookingObj);
        } else {
            res.status(404).json({ message: 'Booking not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update booking as paid
// @route   PUT /api/bookings/:id/pay
// @access  Private
export const payBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Verify user owns the booking or is admin
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to pay for this booking' });
        }

        booking.isPaid = true;
        booking.payment_status = 'completed';
        booking.payment_id = req.body.id; // The PayPal order ID
        booking.payment_method = 'PayPal';

        const updatedBooking = await booking.save();

        // Populate and return
        const populatedBooking = await Booking.findById(updatedBooking._id)
            .populate('car_park', 'name address')
            .populate('slot', 'slot_number');

        res.json(populatedBooking);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update booking extra charges as paid
// @route   PUT /api/bookings/:id/pay-extra
// @access  Private
export const payExtraCharges = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to pay for these extra charges' });
        }

        booking.extra_charges_paid = true;
        // Optionally store another payment ID context if we added a field for it, 
        // for now just marking the boolean flag is sufficient for the MVP flow.

        const updatedBooking = await booking.save();

        res.json(updatedBooking);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

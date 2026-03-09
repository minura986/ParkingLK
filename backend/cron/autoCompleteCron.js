import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import CarPark from '../models/CarPark.js';
import { io } from '../server.js';

export const startAutoCompleteCron = () => {
    // Run every 5 minutes
    setInterval(async () => {
        try {
            const now = new Date();

            // Find all active or upcoming bookings where the end time has already passed
            const expiredBookings = await Booking.find({
                booking_status: { $in: ['active', 'upcoming'] },
                end_time: { $lt: now }
            }).populate('car_park');

            if (expiredBookings.length > 0) {
                console.log(`[CRON] Found ${expiredBookings.length} expired bookings. Auto-completing...`);

                for (const booking of expiredBookings) {

                    // Logic: Auto-checkout the user

                    // Calculate penalty if checkout is after end_time
                    // Note: We use actual_exit_time as now for the cron. This will calculate extra minutes.
                    let extraCharges = 0;
                    const endTime = new Date(booking.end_time);

                    if (now > endTime) {
                        const extraTimeMs = now - endTime;
                        const extraTimeMinutes = Math.floor(extraTimeMs / (1000 * 60));
                        // Rs. 10 per every 10 minutes
                        const extra10MinBlocks = Math.ceil(extraTimeMinutes / 10);
                        if (extra10MinBlocks > 0) {
                            extraCharges = extra10MinBlocks * 10;
                        }
                    }

                    booking.actual_exit_time = now;
                    booking.extra_charges = extraCharges;
                    booking.booking_status = 'completed';
                    booking.total_amount += extraCharges;

                    await booking.save();

                    // Free up the associate slot
                    const slot = await ParkingSlot.findById(booking.slot);
                    if (slot && slot.status !== 'available') {
                        slot.status = 'available';
                        await slot.save();

                        // Emit event to update map
                        const updatedCarPark = await CarPark.findById(booking.car_park).select('-owner -admins');
                        if (updatedCarPark) {
                            io.emit('carParkUpdated', updatedCarPark);
                        }
                    }

                    // Notify user via Socket.io
                    io.to(booking.user.toString()).emit('bookingUpdated', {
                        bookingId: booking._id,
                        status: booking.booking_status,
                        extra_charges: extraCharges
                    });
                }
                console.log('[CRON] Auto-complete processing complete.');
            }
        } catch (error) {
            console.error('[CRON Error] Failed to process auto-complete:', error);
        }
    }, 5 * 60 * 1000); // Check every 5 minutes
};

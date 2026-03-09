import Booking from '../models/Booking.js';
import ParkingSlot from '../models/ParkingSlot.js';
import CarPark from '../models/CarPark.js';
import { io } from '../server.js';

export const startNoShowCron = () => {
    // Run every 5 minutes (in milliseconds: 5 * 60 * 1000)
    setInterval(async () => {
        try {
            const now = new Date();
            const lateThreshold = new Date(now.getTime() - 30 * 60000); // 30 mins ago

            // Find all upcoming bookings where the start time was more than 30 minutes ago
            const lateBookings = await Booking.find({
                booking_status: 'upcoming',
                start_time: { $lt: lateThreshold }
            });

            if (lateBookings.length > 0) {
                console.log(`[CRON] Found ${lateBookings.length} late bookings. Marking as no-show...`);

                for (const booking of lateBookings) {
                    booking.booking_status = 'cancelled_noshow';
                    await booking.save();

                    // Free up the associate slot
                    const slot = await ParkingSlot.findById(booking.slot);
                    if (slot) {
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
                        status: booking.booking_status
                    });
                }
                console.log('[CRON] No-show processing complete.');
            }
        } catch (error) {
            console.error('[CRON Error] Failed to process no-shows:', error);
        }
    }, 5 * 60 * 1000); // Check every 5 minutes
};

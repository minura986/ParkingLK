import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import ParkingSlot from './models/ParkingSlot.js';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parkinglk');

    const slots = await ParkingSlot.find({ status: { $ne: 'available' } });
    let fixed = 0;
    for (const slot of slots) {
        // find active/upcoming bookings for this slot
        const activeBookings = await Booking.find({
            slot: slot._id,
            booking_status: { $in: ['active', 'upcoming'] }
        });

        if (activeBookings.length === 0) {
            console.log(`Fixing slot ${slot.slot_number}... Status was ${slot.status}, but no active/upcoming bookings found.`);
            slot.status = 'available';
            await slot.save();
            fixed++;
        }
    }

    console.log(`Fixed ${fixed} slots.`);
    process.exit(0);
};

run().catch(console.error);

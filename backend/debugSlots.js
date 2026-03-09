import mongoose from 'mongoose';
import Booking from './models/Booking.js';
import ParkingSlot from './models/ParkingSlot.js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parkinglk');

    let output = '';
    const slots = await ParkingSlot.find({ status: { $ne: 'available' } });
    output += `Found ${slots.length} non-available slots:\n`;
    for (const slot of slots) {
        output += `- Slot ${slot.slot_number} is ${slot.status}\n`;
        // find latest booking for this slot
        const booking = await Booking.findOne({ slot: slot._id }).sort({ createdAt: -1 });
        if (booking) {
            output += `  -> Latest Booking: status=${booking.booking_status}, start=${booking.start_time.toLocaleString()}, end=${booking.end_time.toLocaleString()}\n`;
        } else {
            output += `  -> No booking found for this slot!\n`;
        }
    }

    fs.writeFileSync('cleanOutput.txt', output, 'utf8');
    process.exit(0);
};

run().catch(console.error);

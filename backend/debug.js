import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

import ParkingSlot from './models/ParkingSlot.js';

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/parkingapp', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(async () => {
        try {
            const slotsToInsert = [];
            for (let i = 1; i <= 2; i++) {
                slotsToInsert.push({
                    car_park: new mongoose.Types.ObjectId(),
                    slot_number: `X${i}`,
                    location_type: 'normal',
                    vehicle_types: ['car', 'van']
                });
            }
            await ParkingSlot.insertMany(slotsToInsert, { ordered: false });
            fs.writeFileSync('output-node.txt', 'Success', 'utf8');
        } catch (e) {
            fs.writeFileSync('output-node.txt', `ERROR: ${e.message}\n${e.stack}`, 'utf8');
        }
        process.exit(0);
    })
    .catch(console.error);

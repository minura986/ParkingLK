import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

dotenv.config();

const seedAdmins = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/parkinglk_db');

        // Check if superadmin exists
        const adminExists = await User.findOne({ email: 'admin@parkinglk.com' });
        if (!adminExists) {
            await User.create({
                name: 'Super Admin',
                email: 'admin@parkinglk.com',
                password: 'admin123', // Model 'pre-save' hook will hash this
                role: 'super_admin'
            });
            console.log('Super Admin Seeded: admin@parkinglk.com / admin123');
        } else {
            console.log('Super Admin already exists.');
        }

        // Check if owner exists
        const ownerExists = await User.findOne({ email: 'owner@parkinglk.com' });
        if (!ownerExists) {
            await User.create({
                name: 'Car Park Owner',
                email: 'owner@parkinglk.com',
                password: 'admin123', // Model 'pre-save' hook will hash this
                role: 'car_owner'
            });
            console.log('Car Owner Seeded: owner@parkinglk.com / admin123');
        } else {
            console.log('Car Owner already exists.');
        }

        process.exit();
    } catch (error) {
        console.error('Error seeding admins:', error);
        process.exit(1);
    }
};

seedAdmins();

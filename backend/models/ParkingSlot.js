import mongoose from 'mongoose';

const parkingSlotSchema = new mongoose.Schema(
    {
        car_park: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'CarPark',
        },
        slot_number: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['available', 'reserved', 'occupied', 'maintenance'],
            default: 'available',
        },
        location_type: {
            type: String,
            enum: ['normal', 'covered', 'ev', 'disabled'],
            default: 'normal',
        },
        vehicle_types: [{
            type: String,
            enum: ['car', 'van', 'lorry', 'bike']
        }],
    },
    { timestamps: true }
);

// Create compound index to ensure slot numbers are unique per car park
parkingSlotSchema.index({ car_park: 1, slot_number: 1 }, { unique: true });

const ParkingSlot = mongoose.model('ParkingSlot', parkingSlotSchema);
export default ParkingSlot;

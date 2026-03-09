import mongoose from 'mongoose';

const carParkSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        attendants: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        name: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true,
            },
        },
        total_slots: {
            type: Number,
            required: true,
        },
        amenities: {
            has_ev_charging: { type: Boolean, default: false },
            is_covered: { type: Boolean, default: false },
            has_security: { type: Boolean, default: false },
        },
        images: [String],
        description: String,
        price_per_hour: {
            type: Number,
            required: true,
        },
        ev_charging_fee: {
            type: Number,
            default: 0,
        },
        dynamic_pricing_enabled: {
            type: Boolean,
            default: false,
        },
        peak_multiplier: {
            type: Number,
            default: 1.5,
        },
        off_peak_multiplier: {
            type: Number,
            default: 0.8,
        },
        is_active: {
            type: Boolean,
            default: true,
        },
        approval_status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'approved',
        }
    },
    { timestamps: true }
);

// Create geospatial index for location searching
carParkSchema.index({ location: '2dsphere' });

const CarPark = mongoose.model('CarPark', carParkSchema);
export default CarPark;

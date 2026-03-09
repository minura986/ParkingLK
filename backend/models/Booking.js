import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        car_park: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'CarPark',
        },
        slot: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'ParkingSlot',
        },
        start_time: {
            type: Date,
            required: true,
        },
        end_time: {
            type: Date,
            required: true,
        },
        total_amount: {
            type: Number,
            required: true,
        },
        payment_status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending',
        },
        payment_id: {
            type: String, // from PayHere
        },
        qr_code_data: {
            type: String, // securely generated string for validation
        },
        booking_status: {
            type: String,
            enum: ['upcoming', 'active', 'completed', 'cancelled', 'cancelled_noshow'],
            default: 'upcoming',
        },
        actual_exit_time: {
            type: Date,
        },
        extra_charges: {
            type: Number,
            default: 0,
        },
        extra_charges_time: {
            type: Number,
            default: 0,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        extra_charges_paid: {
            type: Boolean,
            default: false,
        },
        payment_method: {
            type: String,
            default: 'PayPal',
        },
        owner_payout_status: {
            type: String,
            enum: ['pending', 'paid'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;

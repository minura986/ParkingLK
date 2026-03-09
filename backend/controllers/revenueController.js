import Booking from '../models/Booking.js';
import User from '../models/User.js';
import CarPark from '../models/CarPark.js';

// @desc    Get aggregated revenue stats for all owners
// @route   GET /api/revenue/admin
// @access  Private/SuperAdmin
export const getAdminRevenueStats = async (req, res) => {
    try {
        const owners = await User.find({ role: 'car_owner' }).select('_id name email');

        // Parallelize fetching stats for each owner
        const statsPromises = owners.map(async (owner) => {
            const ownedCarParks = await CarPark.find({ owner: owner._id }).select('_id');
            const carParkIds = ownedCarParks.map(cp => cp._id);

            // We only count revenue from completed bookings that have actually been paid 
            // by the user (or handled manually if we assume all completed are paid).
            // For safety, we'll check booking_status === 'completed'
            const bookings = await Booking.find({
                car_park: { $in: carParkIds },
                booking_status: 'completed'
            });

            let totalGenerated = 0;
            let totalPaid = 0;
            let totalPending = 0;

            bookings.forEach(b => {
                const amount = b.total_amount || 0;
                totalGenerated += amount;

                if (b.owner_payout_status === 'paid') {
                    totalPaid += amount;
                } else {
                    totalPending += amount;
                }
            });

            return {
                ownerId: owner._id,
                name: owner.name,
                email: owner.email,
                totalGenerated,
                totalPaid,
                totalPending
            };
        });

        const stats = await Promise.all(statsPromises);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Process payout for a specific owner
// @route   PUT /api/revenue/admin/payout/:ownerId
// @access  Private/SuperAdmin
export const processOwnerPayout = async (req, res) => {
    try {
        const ownedCarParks = await CarPark.find({ owner: req.params.ownerId }).select('_id');
        const carParkIds = ownedCarParks.map(cp => cp._id);

        const result = await Booking.updateMany(
            {
                car_park: { $in: carParkIds },
                booking_status: 'completed',
                owner_payout_status: 'pending'
            },
            {
                $set: { owner_payout_status: 'paid' }
            }
        );

        res.json({ message: `Successfully marked ${result.modifiedCount} bookings as paid to the owner.` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get specific owner's revenue stats
// @route   GET /api/revenue/owner
// @access  Private/Owner
export const getOwnerRevenueStats = async (req, res) => {
    try {
        const ownedCarParks = await CarPark.find({ owner: req.user._id }).select('_id');
        const carParkIds = ownedCarParks.map(cp => cp._id);

        const bookings = await Booking.find({
            car_park: { $in: carParkIds },
            booking_status: 'completed'
        })
            .populate('car_park', 'name')
            .sort({ createdAt: -1 });

        let totalGenerated = 0;
        let totalPaid = 0;
        let totalPending = 0;

        bookings.forEach(b => {
            const amount = b.total_amount || 0;
            totalGenerated += amount;

            if (b.owner_payout_status === 'paid') {
                totalPaid += amount;
            } else {
                totalPending += amount;
            }
        });

        res.json({
            stats: {
                totalGenerated,
                totalPaid,
                totalPending
            },
            recentBookings: bookings.slice(0, 50) // Return last 50 for the table
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

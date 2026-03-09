import CarPark from '../models/CarPark.js';
import User from '../models/User.js';

// @desc    Get all active car parks (Approved only)
// @route   GET /api/carparks
// @access  Public
export const getCarParks = async (req, res) => {
    try {
        const carparks = await CarPark.find({ is_active: true, approval_status: 'approved' });
        res.json(carparks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all car parks for admin (including pending)
// @route   GET /api/carparks/admin
// @access  Private/SuperAdmin
export const getAdminCarParks = async (req, res) => {
    try {
        const carparks = await CarPark.find().populate('owner', 'name email');
        res.json(carparks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get specific car park info
// @route   GET /api/carparks/:id
// @access  Public
export const getCarParkById = async (req, res) => {
    try {
        const carPark = await CarPark.findById(req.params.id).lean();
        if (!carPark) {
            return res.status(404).json({ message: 'Car park not found' });
        }

        let currentPrice = carPark.price_per_hour;

        if (carPark.dynamic_pricing_enabled) {
            const ParkingSlot = (await import('../models/ParkingSlot.js')).default;
            const totalSlotsCount = await ParkingSlot.countDocuments({ car_park: carPark._id });
            const occupiedSlotsCount = await ParkingSlot.countDocuments({
                car_park: carPark._id,
                status: { $in: ['occupied', 'reserved'] }
            });

            if (totalSlotsCount > 0) {
                const occupancyRate = occupiedSlotsCount / totalSlotsCount;

                if (occupancyRate > 0.75) {
                    currentPrice = currentPrice * carPark.peak_multiplier;
                }
                else if (occupancyRate < 0.25) {
                    currentPrice = currentPrice * carPark.off_peak_multiplier;
                }
            }
        }

        carPark.dynamic_price_per_hour = Math.round(currentPrice);

        res.json(carPark);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create a new car park
// @route   POST /api/carparks
// @access  Private/Owner/Admin
export const createCarPark = async (req, res) => {
    const {
        name, address, coordinates, total_slots, price_per_hour, amenities, description,
        dynamic_pricing_enabled, peak_multiplier, off_peak_multiplier, ev_charging_fee,
        owner_account
    } = req.body;

    try {
        let assignedOwnerId = req.user._id;

        if (req.body.existing_owner_id) {
            const existingUser = await User.findById(req.body.existing_owner_id);
            if (!existingUser) {
                return res.status(404).json({ message: 'The selected existing owner does not exist.' });
            }
            assignedOwnerId = existingUser._id;
        }

        else if (owner_account && owner_account.name && owner_account.email && owner_account.password) {
            const userExists = await User.findOne({ email: owner_account.email });

            if (userExists) {
                return res.status(400).json({ message: `A user with email ${owner_account.email} already exists.` });
            }

            try {
                const newUser = await User.create({
                    name: owner_account.name,
                    email: owner_account.email,
                    password: owner_account.password,
                    role: 'car_owner'
                });
                assignedOwnerId = newUser._id;
            } catch (err) {
                throw err;
            }
        }


        const carPark = new CarPark({
            owner: assignedOwnerId,
            name,
            address,
            location: {
                type: 'Point',
                coordinates: coordinates,
            },
            total_slots,
            price_per_hour,
            amenities,
            description,
            ev_charging_fee: ev_charging_fee || 0,
            dynamic_pricing_enabled: dynamic_pricing_enabled || false,
            peak_multiplier: peak_multiplier || 1.5,
            off_peak_multiplier: off_peak_multiplier || 0.8,
            approval_status: req.user.role === 'super_admin' ? 'approved' : 'pending',
            is_active: req.user.role === 'super_admin'
        });

        const createdCarPark = await carPark.save();
        res.status(201).json(createdCarPark);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update car park configuration
// @route   PUT /api/carparks/:id
// @access  Private/Owner/Admin
export const updateCarPark = async (req, res) => {
    try {
        const carPark = await CarPark.findById(req.params.id);

        if (!carPark) {
            return res.status(404).json({ message: 'Car park not found' });
        }

        // Optional authorization check: Ensure user is the owner or super_admin
        if (carPark.owner.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to update this car park' });
        }

        carPark.name = req.body.name || carPark.name;
        carPark.price_per_hour = req.body.price_per_hour || carPark.price_per_hour;
        if (req.body.ev_charging_fee !== undefined) {
            carPark.ev_charging_fee = req.body.ev_charging_fee;
        }

        // Update dynamic pricing fields if provided (check against undefined as false is a valid boolean state)
        if (req.body.dynamic_pricing_enabled !== undefined) {
            carPark.dynamic_pricing_enabled = req.body.dynamic_pricing_enabled;
        }
        if (req.body.peak_multiplier) carPark.peak_multiplier = req.body.peak_multiplier;
        if (req.body.off_peak_multiplier) carPark.off_peak_multiplier = req.body.off_peak_multiplier;

        const updatedCarPark = await carPark.save();
        res.json(updatedCarPark);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update car park approval status
// @route   PUT /api/carparks/:id/status
// @access  Private/SuperAdmin
export const updateCarParkStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const carPark = await CarPark.findById(req.params.id);

        if (!carPark) {
            return res.status(404).json({ message: 'Car park not found' });
        }

        carPark.approval_status = status;
        carPark.is_active = status === 'approved';

        const updatedCarPark = await carPark.save();
        res.json(updatedCarPark);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Search car parks by radius (lat, lng, radius in km)
// @route   GET /api/carparks/search
// @access  Public
export const searchCarParks = async (req, res) => {
    const { lat, lng, radius = 5 } = req.query; // default 5km

    if (!lat || !lng) {
        return res.status(400).json({ message: 'Please provide lat and lng' });
    }

    try {
        const carparks = await CarPark.find({
            is_active: true,
            approval_status: 'approved',
            location: {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: radius * 1000 // meters
                }
            }
        });
        res.json(carparks);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

// @desc    Add a new attendant to a car park
// @route   POST /api/carparks/:id/attendants
// @access  Private/Owner
export const addAttendant = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const carPark = await CarPark.findById(req.params.id);

        if (!carPark) {
            return res.status(404).json({ message: 'Car park not found' });
        }

        if (carPark.owner.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to add attendants to this car park' });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const attendantUser = await User.create({
            name,
            email,
            password,
            role: 'attendant'
        });

        carPark.attendants.push(attendantUser._id);
        await carPark.save();

        res.status(201).json({
            message: 'Attendant added successfully',
            attendant: {
                _id: attendantUser._id,
                name: attendantUser.name,
                email: attendantUser.email,
                role: attendantUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all attendants for a car park
// @route   GET /api/carparks/:id/attendants
// @access  Private/Owner
export const getAttendants = async (req, res) => {
    try {
        const carPark = await CarPark.findById(req.params.id).populate('attendants', '-password');

        if (!carPark) {
            return res.status(404).json({ message: 'Car park not found' });
        }

        if (carPark.owner.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to view attendants for this car park' });
        }

        res.json(carPark.attendants);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Remove an attendant from a car park and delete user
// @route   DELETE /api/carparks/:id/attendants/:attendantId
// @access  Private/Owner
export const removeAttendant = async (req, res) => {
    try {
        const carPark = await CarPark.findById(req.params.id);

        if (!carPark) {
            return res.status(404).json({ message: 'Car park not found' });
        }


        if (carPark.owner.toString() !== req.user._id.toString() && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to remove attendants from this car park' });
        }


        carPark.attendants = carPark.attendants.filter(
            (attendantId) => attendantId.toString() !== req.params.attendantId
        );
        await carPark.save();


        await User.findByIdAndDelete(req.params.attendantId);

        res.json({ message: 'Attendant removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

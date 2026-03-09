import ParkingSlot from '../models/ParkingSlot.js';
import CarPark from '../models/CarPark.js';

// @desc    Get slots for a specific car park
// @route   GET /api/carparks/:carparkId/slots
// @access  Public
export const getCarParkSlots = async (req, res) => {
    try {
        const slots = await ParkingSlot.find({ car_park: req.params.carparkId });
        res.json(slots);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error', stack: error.stack });
    }
};

// @desc    Add slot(s) to a car park (Single or Bulk)
// @route   POST /api/carparks/:carparkId/slots
// @access  Private/Owner/Admin
export const addSlotToCarPark = async (req, res) => {
    const {
        slot_number, location_type, vehicle_types,
        prefix, start_number, end_number
    } = req.body;
    const carparkId = req.params.carparkId;

    try {
        const carPark = await CarPark.findById(carparkId);
        if (!carPark) {
            return res.status(404).json({ message: 'Car park not found' });
        }

        if (req.user.role !== 'super_admin' && carPark.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to manage slots for this Car Park.' });
        }

        if (prefix !== undefined && start_number !== undefined && end_number !== undefined) {
            const start = parseInt(start_number);
            const end = parseInt(end_number);

            if (start > end || start < 1) {
                return res.status(400).json({ message: 'Invalid start and end numbers' });
            }

            const slotsToInsert = [];
            for (let i = start; i <= end; i++) {
                slotsToInsert.push({
                    car_park: carparkId,
                    slot_number: `${prefix}${i}`,
                    location_type: location_type || 'normal',
                    vehicle_types: vehicle_types && vehicle_types.length > 0 ? vehicle_types : ['car']
                });
            }

            try {
                const createdSlots = await ParkingSlot.insertMany(slotsToInsert, { ordered: false });
                return res.status(201).json(createdSlots);
            } catch (bulkError) {
                if (bulkError.code === 11000 || (bulkError.writeErrors && bulkError.writeErrors[0].code === 11000)) {
                    return res.status(400).json({ message: 'Warning: One or more slots in that range already exist.' });
                }
                throw bulkError;
            }

        } else {
            if (!slot_number) {
                return res.status(400).json({ message: 'Please provide either slot_number OR prefix/start_number/end_number' });
            }

            const slot = new ParkingSlot({
                car_park: carparkId,
                slot_number,
                location_type: location_type || 'normal',
                vehicle_types: vehicle_types && vehicle_types.length > 0 ? vehicle_types : ['car']
            });

            const createdSlot = await slot.save();
            return res.status(201).json([createdSlot]); // Return as array to match bulk insert response shape locally
        }

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Slot number already exists in this car park' });
        }
        res.status(500).json({ message: error.message || 'Server Error', stack: error.stack });
    }
};

// @desc    Delete a parking slot
// @route   DELETE /api/carparks/:carparkId/slots/:slotId
// @access  Private/Owner/Admin
export const deleteSlot = async (req, res) => {
    try {
        const slot = await ParkingSlot.findById(req.params.slotId);

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        // Verify car park exists
        const carPark = await CarPark.findById(req.params.carparkId);
        if (!carPark) {
            return res.status(404).json({ message: 'Car park not found' });
        }

        if (req.user.role !== 'super_admin' && carPark.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to manage slots for this Car Park.' });
        }

        await ParkingSlot.findByIdAndDelete(req.params.slotId);

        res.json({ message: 'Slot removed' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Server Error', stack: error.stack });
    }
}

// @desc    Update a parking slot
// @route   PUT /api/carparks/:carparkId/slots/:slotId
// @access  Private/Owner/Admin
export const updateSlot = async (req, res) => {
    const { slot_number, location_type, vehicle_types } = req.body;

    try {
        const slot = await ParkingSlot.findById(req.params.slotId);

        if (!slot) {
            return res.status(404).json({ message: 'Slot not found' });
        }

        const carPark = await CarPark.findById(req.params.carparkId);
        if (!carPark) {
            return res.status(404).json({ message: 'Car park not found' });
        }

        if (req.user.role !== 'super_admin' && carPark.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to manage slots for this Car Park.' });
        }

        slot.slot_number = slot_number || slot.slot_number;
        slot.location_type = location_type || slot.location_type;
        if (vehicle_types && vehicle_types.length > 0) {
            slot.vehicle_types = vehicle_types;
        }

        const updatedSlot = await slot.save();
        res.json(updatedSlot);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Slot number already exists in this car park' });
        }
        res.status(500).json({ message: error.message || 'Server Error', stack: error.stack });
    }
};

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const ManageSlots = () => {
    const { user } = useAuth();

    // Core data state
    const [carParks, setCarParks] = useState([]);
    const [selectedCarParkId, setSelectedCarParkId] = useState('');
    const [slots, setSlots] = useState([]);
    const [filterType, setFilterType] = useState('all');

    // UI state
    const [loadingCarParks, setLoadingCarParks] = useState(true);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    // Form state - Bulk Insert
    const [slotPrefix, setSlotPrefix] = useState('P');
    const [startNumber, setStartNumber] = useState(1);
    const [endNumber, setEndNumber] = useState(10);
    const [locationType, setLocationType] = useState('normal'); // normal, covered, ev, disabled
    const [vehicleTypes, setVehicleTypes] = useState(['car']); // array of ['car', 'van', 'lorry', 'bike']

    // Form state - Edit
    const [editingSlotId, setEditingSlotId] = useState(null);
    const [editSlotNumber, setEditSlotNumber] = useState('');
    const [editLocationType, setEditLocationType] = useState('normal');
    const [editVehicleTypes, setEditVehicleTypes] = useState(['car']);

    // Fetch Car Parks on Mount
    useEffect(() => {
        const fetchCarParks = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };

                const { data } = await axios.get('/api/carparks', config);

                // Filter if user is just a car_owner
                const filteredCarParks = user.role === 'super_admin'
                    ? data
                    : data.filter(cp => cp.owner === user._id);

                setCarParks(filteredCarParks);
                setLoadingCarParks(false);
            } catch (err) {
                setError('Failed to load Car Parks');
                setLoadingCarParks(false);
            }
        };

        fetchCarParks();
    }, [user]);

    // Fetch Slots when Car Park is selected
    useEffect(() => {
        if (!selectedCarParkId) {
            setSlots([]);
            return;
        }

        const fetchSlots = async () => {
            setLoadingSlots(true);
            try {
                const { data } = await axios.get(`/api/carparks/${selectedCarParkId}/slots`);
                setSlots(data);
                setLoadingSlots(false);
            } catch (err) {
                setError('Failed to load slots for this car park');
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [selectedCarParkId]);

    const handleVehicleTypeChange = (type, isEdit = false) => {
        const updater = prev => {
            if (prev.includes(type)) {
                if (prev.length === 1) return prev;
                return prev.filter(t => t !== type);
            } else {
                return [...prev, type];
            }
        };
        if (isEdit) {
            setEditVehicleTypes(updater);
        } else {
            setVehicleTypes(updater);
        }
    };

    const handleAddSlot = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (!selectedCarParkId) {
            setError('Please select a Car Park.');
            return;
        }

        if (startNumber > endNumber) {
            setError('Start number must be less than or equal to end number.');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const payload = {
                prefix: slotPrefix,
                start_number: startNumber,
                end_number: endNumber,
                location_type: locationType,
                vehicle_types: vehicleTypes
            };

            const { data } = await axios.post(
                `/api/carparks/${selectedCarParkId}/slots`,
                payload,
                config
            );

            setMessage(`Successfully added ${endNumber - startNumber + 1} slots!`);

            // Re-fetch slots to get the updated list properly sorted from DB
            const updatedSlots = await axios.get(`/api/carparks/${selectedCarParkId}/slots`);
            setSlots(updatedSlots.data);

            // clear success msg after 4 seconds
            setTimeout(() => setMessage(null), 4000);

        } catch (error) {
            setError(error.response?.data?.message || 'Error occurred while saving slots');
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm('Are you sure you want to delete this parking slot?')) return;

        setError(null);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            await axios.delete(`/api/carparks/${selectedCarParkId}/slots/${slotId}`, config);
            setSlots(slots.filter(s => s._id !== slotId));
            setMessage('Slot successfully deleted.');

            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete slot');
        }
    };

    const handleEditClick = (slot) => {
        setEditingSlotId(slot._id);
        setEditSlotNumber(slot.slot_number);
        setEditLocationType(slot.location_type || slot.type || 'normal');
        setEditVehicleTypes(slot.vehicle_types || [slot.vehicle_type || 'car']);
    };

    const handleUpdateSlot = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const payload = {
                slot_number: editSlotNumber,
                location_type: editLocationType,
                vehicle_types: editVehicleTypes
            };

            const { data } = await axios.put(
                `/api/carparks/${selectedCarParkId}/slots/${editingSlotId}`,
                payload,
                config
            );

            setMessage(`Successfully updated slot ${data.slot_number}!`);

            // Re-fetch slots
            const updatedSlots = await axios.get(`/api/carparks/${selectedCarParkId}/slots`);
            setSlots(updatedSlots.data);

            setEditingSlotId(null);
            setTimeout(() => setMessage(null), 4000);
        } catch (error) {
            setError(error.response?.data?.message || 'Error occurred while updating slot');
        }
    };

    return (
        <AdminLayout title="Slot Management" role={user?.role || 'car_owner'}>

            {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Left Column: Form */}
                <div className="xl:col-span-1 space-y-6">
                    {/* Select Car Park Form */}
                    <div className="bg-white shadow rounded-t-none border-t-[3px] border-[#3C8DBC] overflow-hidden p-6 text-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Select Car Park</h2>
                        {loadingCarParks ? (
                            <p className="text-gray-500">Loading car parks...</p>
                        ) : (
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-white transition-colors"
                                value={selectedCarParkId}
                                onChange={(e) => setSelectedCarParkId(e.target.value)}
                            >
                                <option value="">-- Choose a Car Park --</option>
                                {carParks.map(cp => (
                                    <option key={cp._id} value={cp._id}>{cp.name} ({cp.address})</option>
                                ))}
                            </select>
                        )}
                        {carParks.length === 0 && !loadingCarParks && (
                            <p className="text-red-500 mt-2 text-xs">No car parks found. Please create one first.</p>
                        )}
                    </div>

                    {/* Add Slot Form */}
                    <div className={`bg-white shadow rounded-t-none border-t-[3px] border-[#00A65A] overflow-hidden p-6 text-sm transition-opacity ${!selectedCarParkId ? 'opacity-50 pointer-events-none' : ''}`}>
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Add Parking Slots (Bulk)</h2>

                        <form onSubmit={handleAddSlot} className="space-y-4">

                            <div className="grid grid-cols-3 gap-3">
                                <div className="col-span-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Prefix</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors"
                                        value={slotPrefix}
                                        onChange={(e) => setSlotPrefix(e.target.value.toUpperCase())}
                                        placeholder="e.g. A"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Start #</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors"
                                        value={startNumber}
                                        onChange={(e) => setStartNumber(parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">End #</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors"
                                        value={endNumber}
                                        onChange={(e) => setEndNumber(parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 -mt-2">Creates slots: {slotPrefix}{startNumber} to {slotPrefix}{endNumber}</p>

                            <hr className="border-gray-100" />

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">Location Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-white transition-colors"
                                    value={locationType}
                                    onChange={(e) => setLocationType(e.target.value)}
                                >
                                    <option value="normal">Normal / Open Air</option>
                                    <option value="covered">Covered / Indoor</option>
                                    <option value="ev">EV Charging Station</option>
                                    <option value="disabled">Disabled Access</option>
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-2">Vehicle Types Allowed (Multiple)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['car', 'van', 'lorry', 'bike'].map(type => (
                                        <label key={type} className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="rounded text-[#3C8DBC] focus:ring-[#3C8DBC]"
                                                checked={vehicleTypes.includes(type)}
                                                onChange={() => handleVehicleTypeChange(type, false)}
                                            />
                                            <span className="text-sm capitalize">{type}</span>
                                        </label>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Select at least one vehicle type.</p>
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full bg-[#00A65A] hover:bg-[#008d4c] text-white font-bold py-2 px-4 rounded shadow-sm transition-colors cursor-pointer">
                                    <i className="fas fa-plus mr-2"></i> Add {endNumber >= startNumber ? (endNumber - startNumber + 1) : 0} Slots
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Slot List */}
                <div className="xl:col-span-2">
                    <div className="bg-white shadow rounded-t-none border-t-[3px] border-[#F39C12] overflow-hidden">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Current Slots</h2>
                            <div className="flex items-center space-x-4">
                                <div className="flex space-x-1 border border-gray-300 rounded overflow-hidden">
                                    {['all', 'normal', 'covered', 'ev', 'disabled'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`px-3 py-1 text-xs font-medium transition-colors ${filterType === type ? 'bg-[#3C8DBC] text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {type === 'all' ? 'All' : type === 'ev' ? 'EV' : type.charAt(0).toUpperCase() + type.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <span className="bg-[#F39C12] text-white text-xs font-bold px-2 py-1 rounded">
                                    {slots.length} Total
                                </span>
                            </div>
                        </div>

                        <div className="p-0">
                            {!selectedCarParkId ? (
                                <div className="p-12 text-center text-gray-500">
                                    <p>Please select a Car Park from the left to view and manage its slots.</p>
                                </div>
                            ) : loadingSlots ? (
                                <div className="p-8 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3C8DBC]"></div>
                                </div>
                            ) : slots.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">
                                    <p>No slots found for this car park.</p>
                                    <p className="text-sm mt-2">Use the form on the left to bulk add your first slots.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100 sticky top-0">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Number</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Types</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {slots.filter(s => filterType === 'all' || (s.location_type || s.type) === filterType).length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                                                        No slots found in this category.
                                                    </td>
                                                </tr>
                                            )}
                                            {slots.filter(s => filterType === 'all' || (s.location_type || s.type) === filterType).map((slot) => (
                                                <tr key={slot._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 border-l-4 border-transparent hover:border-[#3C8DBC]">
                                                        {slot.slot_number}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <div className="flex flex-wrap gap-1">
                                                            {/* Fallback to legacy single vehicle_type if old document */}
                                                            {(slot.vehicle_types || [slot.vehicle_type]).map(vt => (
                                                                <span key={vt} className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded 
                                                                    ${vt === 'car' ? 'bg-blue-100 text-blue-800' :
                                                                        vt === 'van' ? 'bg-indigo-100 text-indigo-800' :
                                                                            vt === 'lorry' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                                                                    {vt === 'car' ? '🚗 Car' :
                                                                        vt === 'van' ? '🚐 Van' :
                                                                            vt === 'lorry' ? '🚚 Lorry' : '🏍️ Bike'}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border
                                                            ${(slot.location_type || slot.type) === 'ev' ? 'bg-green-50 text-green-700 border-green-200' :
                                                                (slot.location_type || slot.type) === 'disabled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                    (slot.location_type || slot.type) === 'covered' ? 'bg-gray-200 text-gray-800 border-gray-300' :
                                                                        'bg-gray-50 text-gray-700 border-gray-200'}`}>

                                                            {(slot.location_type || slot.type) === 'ev' ? '🔌 EV' :
                                                                (slot.location_type || slot.type) === 'disabled' ? '♿ Disabled' :
                                                                    (slot.location_type || slot.type) === 'covered' ? '☂️ Covered' : '☀️ Normal'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                                                            ${slot.status === 'available' ? 'text-green-600' :
                                                                slot.status === 'reserved' ? 'text-yellow-600' :
                                                                    slot.status === 'occupied' ? 'text-red-600' :
                                                                        'text-gray-500'}`}>
                                                            • {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => handleEditClick(slot)}
                                                            className="text-gray-400 hover:text-[#3C8DBC] focus:outline-none transition-colors mr-3"
                                                            title="Edit Slot"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSlot(slot._id)}
                                                            className="text-gray-400 hover:text-red-600 focus:outline-none transition-colors"
                                                            title="Delete Slot"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Edit Modal */}
            {editingSlotId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
                        <div className="bg-[#3C8DBC] px-6 py-4 flex justify-between items-center text-white">
                            <h3 className="text-lg font-bold">Edit Parking Slot</h3>
                            <button onClick={() => setEditingSlotId(null)} className="text-white hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleUpdateSlot} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-white"
                                    value={editSlotNumber}
                                    onChange={(e) => setEditSlotNumber(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-white"
                                    value={editLocationType}
                                    onChange={(e) => setEditLocationType(e.target.value)}
                                >
                                    <option value="normal">Normal / Open Air</option>
                                    <option value="covered">Covered / Indoor</option>
                                    <option value="ev">EV Charging Station</option>
                                    <option value="disabled">Disabled Access</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Types Allowed (Multiple)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['car', 'van', 'lorry', 'bike'].map(type => (
                                        <label key={type} className="flex items-center space-x-2 cursor-pointer p-2 border rounded hover:bg-gray-50">
                                            <input
                                                type="checkbox"
                                                className="rounded text-[#3C8DBC] focus:ring-[#3C8DBC]"
                                                checked={editVehicleTypes.includes(type)}
                                                onChange={() => handleVehicleTypeChange(type, true)}
                                            />
                                            <span className="text-sm capitalize">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setEditingSlotId(null)}
                                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#3C8DBC] text-white rounded hover:bg-[#367FA9] focus:outline-none transition-colors font-medium"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ManageSlots;

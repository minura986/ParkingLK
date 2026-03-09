import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const CarParkDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [carPark, setCarPark] = useState(null);
    const [slots, setSlots] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [filterType, setFilterType] = useState('all');
    const getLocalISOTime = (date) => {
        const tzOffset = date.getTimezoneOffset() * 60000;
        return (new Date(date - tzOffset)).toISOString().slice(0, 16);
    };

    const getInitialStart = () => {
        const d = new Date();
        d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0); // Align to next 15 mins
        return getLocalISOTime(d);
    };

    const getInitialEnd = () => {
        const d = new Date();
        d.setMinutes(Math.ceil(d.getMinutes() / 15) * 15, 0, 0);
        d.setHours(d.getHours() + 1); // Default to 1 hour
        return getLocalISOTime(d);
    };

    const [entryDateTime, setEntryDateTime] = useState(getInitialStart);
    const [exitDateTime, setExitDateTime] = useState(getInitialEnd);
    const [durationHours, setDurationHours] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // Fetch car park info
                const { data: cpData } = await axios.get(`/api/carparks/${id}`);
                setCarPark(cpData);

                // Fetch slots for this car park
                const { data: slotData } = await axios.get(`/api/carparks/${id}/slots`);
                setSlots(slotData);

                setLoading(false);
            } catch (err) {
                setError('Failed to load car park details');
                setLoading(false);
            }
        };

        // Fallback for mock marker
        if (id === 'mock1') {
            setCarPark({
                _id: 'mock1',
                name: 'City Center Park (Mock)',
                address: '123 Main St, Colombo 03',
                total_slots: 50,
                price_per_hour: 200,
                amenities: { has_ev_charging: true, is_covered: true, has_security: true },
                description: 'A premium, fully covered parking facility in the heart of the city.',
            });
            setSlots([
                { _id: 's1', slot_number: 'A1', status: 'available', type: 'standard' },
                { _id: 's2', slot_number: 'A2', status: 'occupied', type: 'standard' },
            ]);
            setLoading(false);
        } else {
            fetchDetails();
        }
    }, [id]);

    useEffect(() => {
        const start = new Date(entryDateTime);
        const end = new Date(exitDateTime);
        if (start && end && end > start) {
            const diffInMs = end - start;
            const diffInHours = diffInMs / (1000 * 60 * 60);

            // Round up to the nearest integer hour for pricing (or whatever business logic needed)
            // Example: 1.2 hours -> 2 hours
            setDurationHours(Math.max(1, Math.ceil(diffInHours)));
        } else {
            setDurationHours(0);
        }
    }, [entryDateTime, exitDateTime]);

    const handleBooking = async () => {
        if (!selectedSlot) return;
        if (!user) {
            alert('Please login to book a slot');
            navigate('/login');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const startTime = new Date(entryDateTime);
            const endTime = new Date(exitDateTime);

            if (endTime <= startTime) {
                alert('Departure time must be after arrival time.');
                return;
            }

            const baseAmount = (carPark.dynamic_price_per_hour || carPark.price_per_hour) * durationHours;
            const evFee = selectedSlot.location_type === 'ev' ? (carPark.ev_charging_fee || 0) * durationHours : 0;
            const totalAmount = baseAmount + evFee;

            const { data } = await axios.post('/api/bookings', {
                car_park: carPark._id,
                slot: selectedSlot._id,
                start_time: startTime,
                end_time: endTime,
                total_amount: totalAmount
            }, config);

            // Redirect to the new payment flow
            navigate(`/payment/${data._id}`);

        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        }
    };

    if (loading) return <div className="p-8 text-center text-xl">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <button onClick={() => navigate('/')} className="mb-6 text-blue-600 hover:text-blue-800 font-medium">
                &larr; Back to Map
            </button>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gray-900 text-white p-8">
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">{carPark.name}</h1>
                    <p className="text-gray-300 text-lg flex items-center">
                        <span className="mr-2">📍</span> {carPark.address}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mt-6">
                        <div className="flex gap-4">
                            {carPark.amenities?.is_covered && <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">🏠 Covered</span>}
                            {carPark.amenities?.has_ev_charging && <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">⚡ EV Charging</span>}
                            {carPark.amenities?.has_security && <span className="bg-gray-800 px-3 py-1 rounded-full text-sm">👮 Security 24/7</span>}
                        </div>
                        <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${carPark.location.coordinates[1]},${carPark.location.coordinates[0]}`}
                            target="_blank" rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors flex items-center ml-auto"
                        >
                            📍 Get Directions
                        </a>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1 space-y-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">About</h3>
                            <p className="text-gray-600">{carPark.description}</p>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Summary</h3>

                            <div className="mb-4 space-y-4">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Arrival Date</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                                <input
                                                    type="date"
                                                    value={entryDateTime.split('T')[0] || ''}
                                                    onChange={(e) => setEntryDateTime(`${e.target.value}T${entryDateTime.split('T')[1] || '00:00'}`)}
                                                    className="w-full pl-10 pr-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Arrival Time</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </div>
                                                <input
                                                    type="time"
                                                    value={entryDateTime.split('T')[1] || ''}
                                                    onChange={(e) => setEntryDateTime(`${entryDateTime.split('T')[0] || ''}T${e.target.value}`)}
                                                    className="w-full pl-10 pr-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Departure Date</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                </div>
                                                <input
                                                    type="date"
                                                    value={exitDateTime.split('T')[0] || ''}
                                                    onChange={(e) => setExitDateTime(`${e.target.value}T${exitDateTime.split('T')[1] || '00:00'}`)}
                                                    className="w-full pl-10 pr-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 bg-white"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Departure Time</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </div>
                                                <input
                                                    type="time"
                                                    value={exitDateTime.split('T')[1] || ''}
                                                    onChange={(e) => setExitDateTime(`${exitDateTime.split('T')[0] || ''}T${e.target.value}`)}
                                                    className="w-full pl-10 pr-2 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 bg-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {durationHours === 0 ? (
                                    <p className="text-red-500 text-sm font-medium">Departure must be later than arrival.</p>
                                ) : (
                                    <p className="text-gray-600 text-sm font-medium">Calculated Duration: {durationHours} hour(s)</p>
                                )}
                            </div>

                            <div className="flex justify-between items-center py-3 border-t border-blue-200 mt-4">
                                <div>
                                    <span className="text-gray-600">Rate per hour</span>
                                    {carPark.dynamic_price_per_hour > carPark.price_per_hour && (
                                        <span className="ml-2 text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            High Demand
                                        </span>
                                    )}
                                </div>
                                <div className="text-right">
                                    {carPark.dynamic_price_per_hour > carPark.price_per_hour && (
                                        <span className="text-xs text-gray-400 line-through mr-2">Rs. {carPark.price_per_hour}</span>
                                    )}
                                    <span className="font-medium text-gray-900">
                                        Rs. {carPark.dynamic_price_per_hour || carPark.price_per_hour}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-3">
                                <span className="text-gray-600">Selected Slot</span>
                                <div className="text-right">
                                    <span className="font-medium text-blue-600 bg-white px-2 py-1 rounded shadow-sm border border-blue-100 flex items-center">
                                        {selectedSlot ? selectedSlot.slot_number : 'None'}
                                        {selectedSlot && selectedSlot.location_type === 'ev' && <span className="ml-2">🔌</span>}
                                    </span>
                                </div>
                            </div>

                            {selectedSlot && selectedSlot.location_type === 'ev' && carPark.ev_charging_fee > 0 && (
                                <div className="flex justify-between items-center py-2 text-sm">
                                    <span className="text-gray-500">EV Premium Rate</span>
                                    <span className="text-gray-700">+ Rs. {carPark.ev_charging_fee}/hr</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-3 border-t border-blue-200 text-lg font-bold">
                                <span>Total Estimate</span>
                                <span className="text-blue-600">
                                    Rs. {((carPark.dynamic_price_per_hour || carPark.price_per_hour) + (selectedSlot?.location_type === 'ev' ? (carPark.ev_charging_fee || 0) : 0)) * durationHours}
                                </span>
                            </div>

                            <button
                                onClick={handleBooking}
                                disabled={!selectedSlot || durationHours === 0}
                                className={`mt-6 w-full py-3 px-4 rounded-lg font-bold text-white transition-all shadow-md
                                    ${(selectedSlot && durationHours > 0)
                                        ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
                                        : 'bg-gray-400 cursor-not-allowed'}`}
                            >
                                {(!selectedSlot) ? 'Select a Slot First' : (durationHours === 0 ? 'Invalid Time Range' : 'Proceed to Payment')}
                            </button>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                            Select a Slot
                            <div className="flex space-x-4 text-sm font-normal">
                                <div className="flex items-center"><div className="w-4 h-4 rounded bg-white border border-gray-300 mr-2"></div> Available</div>
                                <div className="flex items-center"><div className="w-4 h-4 rounded bg-red-100 border border-red-300 mr-2"></div> Occupied</div>
                                <div className="flex items-center"><div className="w-4 h-4 rounded bg-blue-600 border border-blue-600 mr-2"></div> Selected</div>
                            </div>
                        </h3>

                        <div className="mb-6 flex space-x-2 border-b border-gray-200 overflow-x-auto scrollbar-hide">
                            {['all', 'normal', 'covered', 'ev', 'disabled'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`whitespace-nowrap px-4 py-2 font-medium text-sm border-b-2 transition-colors ${filterType === type ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                                >
                                    {type === 'all' ? 'All Slots' : type === 'ev' ? 'EV Charging 🔌' : type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 p-6 bg-gray-50 rounded-xl border border-gray-200 min-h-[300px] content-start">
                            {slots.length === 0 && <p className="text-gray-500 col-span-full text-center">No slots configured for this car park yet.</p>}
                            {slots.filter(s => filterType === 'all' || (s.location_type || s.type) === filterType).map(slot => {
                                const isAvailable = slot.status === 'available';
                                const isSelected = selectedSlot?._id === slot._id;

                                return (
                                    <button
                                        key={slot._id}
                                        disabled={!isAvailable}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`
                                            relative h-24 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-200
                                            ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-md transform scale-105' : ''}
                                            ${isAvailable && !isSelected ? 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-sm text-gray-700' : ''}
                                            ${!isAvailable ? 'bg-red-50 border-red-200 text-red-400 cursor-not-allowed opacity-60' : ''}
                                        `}
                                    >
                                        <span className={`text-xl font-bold ${isSelected ? 'text-white' : ''}`}>
                                            {slot.slot_number}
                                            {slot.location_type === 'ev' && <span className="ml-1 text-sm">🔌</span>}
                                        </span>
                                        <span className="text-xs mt-1 lowercase font-medium opacity-80">{slot.location_type}</span>

                                        {!isAvailable && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-20 rounded-lg">
                                                <svg className="w-8 h-8 text-red-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CarParkDetails;

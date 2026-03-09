import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ activeBookings: 0, revenue: 0, totalSlots: 0 });
    const [loading, setLoading] = useState(true);

    // Dynamic Pricing State
    const [carPark, setCarPark] = useState(null);
    const [pricingEnabled, setPricingEnabled] = useState(false);
    const [peakMultiplier, setPeakMultiplier] = useState(1.5);
    const [basePrice, setBasePrice] = useState(0);
    const [evChargingFee, setEvChargingFee] = useState(0);
    const [savingPricing, setSavingPricing] = useState(false);

    const [slots, setSlots] = useState([]);
    const [filterType, setFilterType] = useState('all');

    const [ownerParks, setOwnerParks] = useState([]);
    const [selectedParkId, setSelectedParkId] = useState('');
    const [allBookings, setAllBookings] = useState([]);

    useEffect(() => {
        if (!user || user.role !== 'car_owner') {
            navigate('/');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                // 1. Fetch the owner's car parks
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data: allParks } = await axios.get('/api/carparks');
                const myParks = allParks.filter(p => p.owner === user._id);

                setOwnerParks(myParks);

                if (myParks.length > 0) {
                    setSelectedParkId(myParks[0]._id);
                }

                // 2. Fetch all bookings for the owner
                try {
                    const { data: bookings } = await axios.get('/api/bookings/owner', config);
                    setAllBookings(bookings);
                } catch (bookingError) {
                    console.error("Failed to fetch owner bookings for stats", bookingError);
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, navigate]);

    // Recalculate stats whenever the selected park or bookings change
    useEffect(() => {
        if (!selectedParkId || ownerParks.length === 0) return;

        const currentPark = ownerParks.find(p => p._id === selectedParkId);

        if (currentPark) {
            setCarPark(currentPark);
            setPricingEnabled(currentPark.dynamic_pricing_enabled || false);
            setPeakMultiplier(currentPark.peak_multiplier || 1.5);
            setBasePrice(currentPark.price_per_hour || 0);
            setEvChargingFee(currentPark.ev_charging_fee || 0);

            // Fetch live slots
            axios.get(`/api/carparks/${currentPark._id}/slots`)
                .then(res => setSlots(res.data))
                .catch(err => console.error("Failed fetching slots", err));

            let activeBookings = 0;
            let revenue = 0;
            let totalSlots = currentPark.total_slots || 0;

            // Filter bookings for the selected park
            const parkBookings = allBookings.filter(b =>
                (typeof b.car_park === 'object' && b.car_park._id === selectedParkId) ||
                (typeof b.car_park === 'string' && b.car_park === selectedParkId)
            );

            parkBookings.forEach(booking => {
                if (booking.booking_status === 'active') {
                    activeBookings++;
                }
                if (booking.booking_status !== 'cancelled' && booking.booking_status !== 'cancelled_noshow') {
                    revenue += booking.total_amount || 0;
                    revenue += booking.extra_charges || 0;
                }
            });

            setStats({
                activeBookings,
                revenue,
                totalSlots
            });
        }
    }, [selectedParkId, ownerParks, allBookings]);

    const handleSavePricing = async () => {
        if (!carPark) return;
        setSavingPricing(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/carparks/${carPark._id}`, {
                dynamic_pricing_enabled: pricingEnabled,
                peak_multiplier: parseFloat(peakMultiplier),
                price_per_hour: parseFloat(basePrice),
                ev_charging_fee: parseFloat(evChargingFee)
            }, config);
            // Optionally update local state
            setCarPark({ ...carPark, price_per_hour: parseFloat(basePrice), ev_charging_fee: parseFloat(evChargingFee) });
            alert('Pricing configuration saved successfully!');
        } catch (error) {
            console.error('Failed to save pricing', error);
            alert('Failed to save pricing configuration.');
        } finally {
            setSavingPricing(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-xl">Loading Dashboard...</div>;

    return (
        <AdminLayout title="Owner Dashboard" role="car_owner">
            {ownerParks.length > 1 && (
                <div className="mb-6 bg-white p-4 rounded shadow flex items-center justify-between border-l-4 border-blue-500">
                    <div className="flex items-center space-x-2">
                        <i className="fas fa-building text-blue-500"></i>
                        <span className="font-bold text-gray-700">Select Car Park:</span>
                    </div>
                    <select
                        className="form-select block w-full sm:w-1/2 md:w-1/3 px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                        value={selectedParkId}
                        onChange={(e) => setSelectedParkId(e.target.value)}
                    >
                        {ownerParks.map(park => (
                            <option key={park._id} value={park._id}>{park.name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

                {/* QR Scanner Quick Access */}
                <div
                    onClick={() => navigate('/scanner')}
                    className="bg-[#2D3748] rounded shadow-sm p-6 text-white relative overflow-hidden group pb-10 cursor-pointer hover:bg-[#1A202C] transition-colors"
                >
                    <div className="absolute top-4 right-4 text-white/20 text-6xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-qrcode"></i>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 mt-2">QR Scanner</h3>
                    <p className="text-sm font-semibold uppercase tracking-wider mb-2 text-blue-300">Launch Attendant View</p>
                    <div className="mt-4 border-t border-white/20 pt-2 text-center text-sm bg-black/10 absolute bottom-0 left-0 w-full py-1">
                        Open Scanner <span className="ml-1">➔</span>
                    </div>
                </div>

                <div className="bg-[#F39C12] rounded shadow-sm p-6 text-white relative overflow-hidden group pb-10">
                    <div className="absolute top-4 right-4 text-white/20 text-6xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                    <h3 className="text-4xl font-bold mb-2">{stats.activeBookings}</h3>
                    <p className="text-sm font-semibold uppercase tracking-wider mb-2">Active Bookings</p>
                    <div className="mt-4 border-t border-white/20 pt-2 text-center text-sm bg-black/10 absolute bottom-0 left-0 w-full py-1 cursor-pointer hover:bg-black/20 transition-colors">
                        More info <span className="ml-1">➔</span>
                    </div>
                </div>

                <div className="bg-[#00A65A] rounded shadow-sm p-6 text-white relative overflow-hidden group pb-10">
                    <div className="absolute top-4 right-4 text-white/20 text-6xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-coins"></i>
                    </div>
                    <h3 className="text-4xl font-bold mb-2">Rs {stats.revenue}</h3>
                    <p className="text-sm font-semibold uppercase tracking-wider mb-2">Total Revenue</p>
                    <div className="mt-4 border-t border-white/20 pt-2 text-center text-sm bg-black/10 absolute bottom-0 left-0 w-full py-1 cursor-pointer hover:bg-black/20 transition-colors">
                        More info <span className="ml-1">➔</span>
                    </div>
                </div>

                <div className="bg-[#00C0EF] rounded shadow-sm p-6 text-white relative overflow-hidden group pb-10">
                    <div className="absolute top-4 right-4 text-white/20 text-6xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-parking"></i>
                    </div>
                    <h3 className="text-4xl font-bold mb-2">{stats.totalSlots}</h3>
                    <p className="text-sm font-semibold uppercase tracking-wider mb-2">Total Managed Slots</p>
                    <div className="mt-4 border-t border-white/20 pt-2 text-center text-sm bg-black/10 absolute bottom-0 left-0 w-full py-1 cursor-pointer hover:bg-black/20 transition-colors">
                        More info <span className="ml-1">➔</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Dynamic Pricing Configuration */}
                <div className="bg-white shadow rounded-t-none border-t-[3px] border-[#DD4B39] overflow-hidden flex flex-col">
                    <div className="border-b border-gray-100 p-4 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Pricing Configuration</h2>
                        {pricingEnabled ? (
                            <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded border border-green-200">Active</span>
                        ) : (
                            <span className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-0.5 rounded border border-gray-200">Inactive</span>
                        )}
                    </div>
                    <div className="p-6 flex-grow">
                        {carPark ? (
                            <div className="space-y-6">
                                <p className="text-sm text-gray-600">Configure base rate and automated surge pricing during high-demand periods.</p>

                                <div className="mb-4 pt-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Base Hourly Rate (Rs.)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        value={basePrice}
                                        onChange={(e) => setBasePrice(e.target.value)}
                                    />
                                </div>
                                <div className="mb-4 pt-2">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">EV Charging Premium (Rs./hr)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                        value={evChargingFee}
                                        onChange={(e) => setEvChargingFee(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Extra fee applied only when drivers book EV slots.</p>
                                </div>

                                <div className="flex items-center justify-between border-b pb-4">
                                    <div>
                                        <h4 className="font-bold text-gray-800">Enable Surge Pricing</h4>
                                        <p className="text-xs text-gray-500">Automatically multiply rates when occupancy hits 80%</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={pricingEnabled} onChange={(e) => setPricingEnabled(e.target.checked)} />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>

                                <div className={`transition-opacity ${pricingEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Peak Multiplier (e.g. 1.5x)</label>
                                    <div className="flex items-center">
                                        <input
                                            type="number"
                                            step="0.1"
                                            min="1.0"
                                            max="3.0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                            value={peakMultiplier}
                                            onChange={(e) => setPeakMultiplier(e.target.value)}
                                        />
                                        <span className="ml-3 font-bold text-gray-600">= Rs. {(basePrice * peakMultiplier).toFixed(2)}/hr</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Base rate: Rs. {basePrice}/hr</p>
                                </div>

                                <button
                                    onClick={handleSavePricing}
                                    disabled={savingPricing}
                                    className="w-full bg-[#DD4B39] hover:bg-[#C9302C] text-white font-bold py-2 px-4 rounded transition-colors shadow-sm"
                                >
                                    {savingPricing ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center text-gray-500 py-8">
                                <p>No car park found assigned to your account.</p>
                                <p className="text-sm mt-2">Please contact the super administrator.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Live Slot Status Mockup */}
                <div className="bg-white shadow rounded-t-none border-t-[3px] border-[#3C8DBC] overflow-hidden">
                    <div className="border-b border-gray-100 p-4 flex justify-between items-center bg-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Live Slot Status</h2>
                        <button
                            onClick={() => navigate('/owner/slots')}
                            className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            Manage
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="mb-4 flex space-x-2 border-b border-gray-100 overflow-x-auto scrollbar-hide">
                            {['all', 'normal', 'covered', 'ev', 'disabled'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`whitespace-nowrap px-3 py-1.5 font-medium text-xs border-b-2 transition-colors ${filterType === type ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'}`}
                                >
                                    {type === 'all' ? 'All Slots' : type === 'ev' ? 'EV Charging 🔌' : type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {slots.filter(s => filterType === 'all' || (s.location_type || s.type) === filterType).map(slot => {
                                let bgClass = 'bg-gray-100 border-gray-200 text-gray-600';
                                if (slot.status === 'available') bgClass = 'bg-green-100 border-green-200 text-green-800';
                                if (slot.status === 'occupied') bgClass = 'bg-red-100 border-red-200 text-red-800';
                                if (slot.status === 'reserved') bgClass = 'bg-yellow-100 border-yellow-200 text-yellow-800';
                                if (slot.status === 'maintenance') bgClass = 'bg-gray-300 border-gray-400 text-gray-800';

                                return (
                                    <div key={slot._id} className={`${bgClass} border h-16 rounded-lg flex flex-col items-center justify-center font-bold relative`}>
                                        {slot.slot_number}
                                        {slot.location_type === 'ev' && <span className="absolute top-1 right-1 text-xs">🔌</span>}
                                        <span className="text-[10px] uppercase mt-1 opacity-70">{slot.status}</span>
                                    </div>
                                );
                            })}
                            {slots.length === 0 && (
                                <div className="col-span-4 text-center text-gray-500 py-4">No slots configured for this car park yet.</div>
                            )}
                            {slots.length > 0 && slots.filter(s => filterType === 'all' || (s.location_type || s.type) === filterType).length === 0 && (
                                <div className="col-span-4 text-center text-gray-400 py-4 text-sm">No slots found in this category.</div>
                            )}
                        </div>
                        <div className="mt-4 flex space-x-4 text-xs text-gray-600 justify-center">
                            <span className="flex items-center"><span className="w-3 h-3 bg-green-400 rounded-full mr-1"></span> Available</span>
                            <span className="flex items-center"><span className="w-3 h-3 bg-red-400 rounded-full mr-1"></span> Occupied</span>
                            <span className="flex items-center"><span className="w-3 h-3 bg-yellow-400 rounded-full mr-1"></span> Reserved</span>
                        </div>
                    </div>
                </div>

            </div>
        </AdminLayout>
    );
};

export default OwnerDashboard;

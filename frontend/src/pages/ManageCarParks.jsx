import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';

const LocationPicker = ({ lat, lng, setLat, setLng }) => {
    useMapEvents({
        click(e) {
            setLat(e.latlng.lat.toFixed(6));
            setLng(e.latlng.lng.toFixed(6));
        },
    });
    return lat && lng ? <Marker position={[lat, lng]} /> : null;
};

const ManageCarParks = () => {
    const { user } = useAuth();

    // Form state
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [totalSlots, setTotalSlots] = useState('');
    const [price, setPrice] = useState('');

    // Owner Details state
    const [assignmentType, setAssignmentType] = useState('new'); // 'new' or 'existing'
    const [existingOwnerId, setExistingOwnerId] = useState('');
    const [carOwners, setCarOwners] = useState([]);

    const [ownerName, setOwnerName] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [ownerPassword, setOwnerPassword] = useState('');

    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get('/api/users?role=car_owner', config);
                setCarOwners(data);
            } catch (error) {
                console.error("Failed to fetch car owners", error);
            }
        };
        // Only fetch existing owners if the user is a super_admin
        if (user && user.token && user.role === 'super_admin') {
            fetchOwners();
        }
    }, [user]);

    const [amenities, setAmenities] = useState({
        has_ev_charging: false,
        is_covered: false,
        has_security: false
    });
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleCreateCarPark = async (e) => {
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
                name,
                address,
                coordinates: [parseFloat(lng), parseFloat(lat)],
                total_slots: parseInt(totalSlots),
                price_per_hour: parseFloat(price),
                amenities
            };

            // Include owner account details if provided
            if (assignmentType === 'existing') {
                if (!existingOwnerId) {
                    setError('You must select an existing owner.');
                    return;
                }
                payload.existing_owner_id = existingOwnerId;
            } else {
                if (ownerName || ownerEmail || ownerPassword) {
                    if (!ownerName || !ownerEmail || !ownerPassword) {
                        setError('You must provide the Owner Name, Email, and Password together to assign a new owner.');
                        return;
                    }
                    payload.owner_account = {
                        name: ownerName,
                        email: ownerEmail,
                        password: ownerPassword
                    };
                }
            }

            await axios.post(
                '/api/carparks',
                payload,
                config
            );

            if (user.role === 'super_admin') {
                setMessage('Car Park Created Successfully! It is now active.');
            } else {
                setMessage('Car Park Registered Successfully! It is pending Super Admin approval before becoming active.');
            }

            // Reset form
            setName(''); setAddress(''); setLat(''); setLng(''); setTotalSlots(''); setPrice('');
            setOwnerName(''); setOwnerEmail(''); setOwnerPassword(''); setExistingOwnerId('');
            setAmenities({ has_ev_charging: false, is_covered: false, has_security: false });

        } catch (error) {
            setError(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    };

    const handleAmenityChange = (e) => {
        setAmenities({
            ...amenities,
            [e.target.name]: e.target.checked
        });
    };

    return (
        <AdminLayout title={user?.role === 'super_admin' ? "Manage Car Parks" : "Register a New Car Park"} role={user?.role || "super_admin"}>
            <div className="bg-white shadow rounded-t-none border-t-[3px] border-[#00A65A] overflow-hidden p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Register New Car Park</h2>

                {user?.role === 'car_owner' && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <i className="fas fa-info-circle text-blue-400"></i>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    Need to expand your business? Register a new car park here. Please gather all required details (e.g., location, capacity, pricing) and submit. Note that newly registered car parks are set to <b>Pending</b> status and will only become visible to the public once approved by a Super Administrator.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{message}</div>}
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

                <form onSubmit={handleCreateCarPark} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Car Park Name</label>
                                    <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors" value={name} onChange={(e) => setName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors" value={address} onChange={(e) => setAddress(e.target.value)} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input type="number" step="any" required className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="e.g. 6.9271" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <input type="number" step="any" required className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="e.g. 79.8612" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Capacity</label>
                                    <input type="number" required className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors" value={totalSlots} onChange={(e) => setTotalSlots(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Hour (Rs)</label>
                                    <input type="number" required className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors" value={price} onChange={(e) => setPrice(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Amenities</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox text-[#3C8DBC] rounded focus:ring-[#3C8DBC] mr-2" name="has_ev_charging" checked={amenities.has_ev_charging} onChange={handleAmenityChange} />
                                        <span className="text-sm text-gray-700">EV Charging</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox text-[#3C8DBC] rounded focus:ring-[#3C8DBC] mr-2" name="is_covered" checked={amenities.is_covered} onChange={handleAmenityChange} />
                                        <span className="text-sm text-gray-700">Covered Parking</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input type="checkbox" className="form-checkbox text-[#3C8DBC] rounded focus:ring-[#3C8DBC] mr-2" name="has_security" checked={amenities.has_security} onChange={handleAmenityChange} />
                                        <span className="text-sm text-gray-700">24/7 Security</span>
                                    </label>
                                </div>
                            </div>

                            {user?.role === 'super_admin' && (
                                <>
                                    <hr className="border-gray-200 my-4" />

                                    <h3 className="text-lg font-bold text-gray-800">Assign Car Park Owner</h3>

                                    <div className="flex gap-4 mb-4">
                                        <label className="flex items-center">
                                            <input type="radio" className="form-radio text-[#3C8DBC]" name="assignmentType" value="new" checked={assignmentType === 'new'} onChange={() => setAssignmentType('new')} />
                                            <span className="ml-2 text-sm text-gray-700">Create New Owner</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="radio" className="form-radio text-[#3C8DBC]" name="assignmentType" value="existing" checked={assignmentType === 'existing'} onChange={() => setAssignmentType('existing')} />
                                            <span className="ml-2 text-sm text-gray-700">Assign to Existing Owner</span>
                                        </label>
                                    </div>

                                    {assignmentType === 'new' ? (
                                        <>
                                            <p className="text-xs text-gray-500 mb-4">Create a new Car Owner account to manage this facility. They can change their password later.</p>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name <span className="text-red-500">*</span></label>
                                                    <input type="text" required={assignmentType === 'new'} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="e.g. John Doe" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Email <span className="text-red-500">*</span></label>
                                                    <input type="email" required={assignmentType === 'new'} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="e.g. owner@carpark.com" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password <span className="text-red-500">*</span></label>
                                                    <input type="text" required={assignmentType === 'new'} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} placeholder="e.g. temp1234" />
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs text-gray-500 mb-4">Select an existing Car Owner account to assign this facility to.</p>

                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Owner <span className="text-red-500">*</span></label>
                                                    <select required={assignmentType === 'existing'} className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-[#3C8DBC] focus:border-[#3C8DBC] bg-gray-50 focus:bg-white transition-colors" value={existingOwnerId} onChange={(e) => setExistingOwnerId(e.target.value)}>
                                                        <option value="">-- Select an Owner --</option>
                                                        {carOwners.map((owner) => (
                                                            <option key={owner._id} value={owner._id}>{owner.name} ({owner.email})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Interactive Map for Coordinate Selection */}
                        <div className="h-64 lg:h-full bg-gray-200 rounded border border-gray-300 overflow-hidden relative">
                            <MapContainer center={[6.9271, 79.8612]} zoom={12} className="h-full w-full">
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap"
                                />
                                <LocationPicker lat={lat} lng={lng} setLat={setLat} setLng={setLng} />
                            </MapContainer>
                            <div className="absolute bottom-2 left-2 bg-white/90 px-3 py-1 text-xs font-bold shadow-md rounded pointer-events-none z-[1000]">
                                Click map to set location
                            </div>
                        </div>
                    </div>
                    <div className="pt-4">
                        <button type="submit" className="bg-[#3C8DBC] hover:bg-[#367FA9] text-white font-bold py-2 px-6 rounded shadow-sm transition-colors">
                            Register Location
                        </button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
};

export default ManageCarParks;

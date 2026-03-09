import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user, login } = useAuth(); // We'll re-use login/setUser logic implicitly by updating localstorage manually or adding a specific context function. For now, re-set local state.
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [vehicleType, setVehicleType] = useState('car');
    const [licensePlate, setLicensePlate] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [bookingsError, setBookingsError] = useState(null);

    // Tab state
    const [activeTab, setActiveTab] = useState('details');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            const fetchProfile = async () => {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    };
                    const { data } = await axios.get('http://localhost:5000/api/users/profile', config);
                    setName(data.name || '');
                    setEmail(data.email || '');
                    setPhone(data.phone || '');
                    setProfilePicture(data.profile_picture || '');
                    if (data.vehicle_details) {
                        setVehicleType(data.vehicle_details.vehicle_type || 'car');
                        setLicensePlate(data.vehicle_details.license_plate || '');
                    }
                    setLoading(false);
                } catch (error) {
                    setError('Failed to fetch profile.');
                    setLoading(false);
                }
            };

            const fetchBookings = async () => {
                setBookingsLoading(true);
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        }
                    };
                    const { data } = await axios.get('http://localhost:5000/api/bookings/mybookings', config);
                    // Get only the 3 most recent bookings for the profile preview
                    setBookings(data.slice(0, 3));
                    setBookingsLoading(false);
                } catch (err) {
                    setBookingsError('Failed to load recent bookings');
                    setBookingsLoading(false);
                }
            };

            fetchProfile();
            fetchBookings();
        }
    }, [user, navigate]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size should be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setProfilePicture(reader.result);
                setError('');
            };
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (password && password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const { data } = await axios.put(
                'http://localhost:5000/api/users/profile',
                {
                    name,
                    email,
                    phone,
                    password,
                    profile_picture: profilePicture,
                    vehicle_details: {
                        vehicle_type: vehicleType,
                        license_plate: licensePlate
                    }
                },
                config
            );

            // Update user in local storage to reflect new details globally
            localStorage.setItem('userInfo', JSON.stringify(data));
            setMessage('Profile Updated Successfully!');
            setPassword('');
            setConfirmPassword('');

            // To fully refresh context, we'd normally call a context function, but a quick reload works for MVP profile updates.
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
            setError(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            case 'cancelled_noshow': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status) => {
        if (status === 'cancelled_noshow') return 'No Show (Cancelled)';
        return status;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
            <div className="max-w-4xl mx-auto">
                {/* Header Banner */}
                <div className="relative rounded-t-3xl h-56 sm:h-72 overflow-hidden mb-8 shadow-xl border border-gray-100 bg-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 opacity-90"></div>
                    <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 flex items-end">
                        <div className="relative group">
                            <div className="h-28 w-28 sm:h-40 sm:w-40 rounded-2xl bg-white border-4 border-white shadow-lg overflow-hidden flex items-center justify-center transform transition duration-500 sm:hover:scale-105 z-10 relative">
                                {profilePicture ? (
                                    <img src={profilePicture} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-gray-400 text-5xl sm:text-7xl font-extrabold">{name ? name.charAt(0).toUpperCase() : 'U'}</span>
                                )}
                                <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                </label>
                            </div>
                        </div>
                        <div className="ml-6 sm:ml-8 mb-2 sm:mb-4 relative z-10">
                            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-md">{name || 'User'}</h1>
                            <p className="text-blue-100 mt-2 font-medium drop-shadow text-sm sm:text-lg flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                {email}
                            </p>
                        </div>
                    </div>
                </div>

                {message && <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl mb-6 flex items-center shadow-sm"><svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{message}</div>}
                {error && <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center shadow-sm"><svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{error}</div>}

                {/* Tab Navigation */}
                <div className="flex bg-white p-1.5 rounded-2xl mb-8 border border-gray-200 w-fit shadow-sm">
                    <button
                        onClick={() => setActiveTab('details')}
                        className={`px-5 sm:px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'details' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                    >
                        Profile Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`px-5 sm:px-8 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === 'bookings' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                    >
                        Recent Bookings
                    </button>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xl relative overflow-hidden">

                    {activeTab === 'details' && (
                        <form onSubmit={submitHandler} className="space-y-8 relative z-10 animate-fadeIn">
                            {/* Personal Info */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    Personal Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all focus:bg-white"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all focus:bg-white"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all focus:bg-white"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+94 7X XXX XXXX"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* Vehicle Details */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                                    Vehicle Details
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                                        <select
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all focus:bg-white"
                                            value={vehicleType}
                                            onChange={(e) => setVehicleType(e.target.value)}
                                        >
                                            <option value="car">Car</option>
                                            <option value="suv">SUV</option>
                                            <option value="van">Van</option>
                                            <option value="bike">Motorbike</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">License Plate</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all uppercase focus:bg-white"
                                            value={licensePlate}
                                            onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                                            placeholder="ABC-1234 or WP CAA-1234"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-200" />

                            {/* Security */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    Security
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">Leave blank if you do not wish to change your password.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all focus:bg-white"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 transition-all focus:bg-white"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 w-full sm:w-auto"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'bookings' && (
                        <div className="animate-fadeIn relative z-10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                    Recent Bookings
                                </h3>
                                <Link
                                    to="/mybookings"
                                    className="text-blue-600 hover:text-blue-800 font-bold bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 hover:bg-blue-100"
                                >
                                    View All <span className="text-xl leading-none">&rarr;</span>
                                </Link>
                            </div>

                            {bookingsLoading ? (
                                <div className="text-center py-12 text-gray-500 flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                                    Loading your bookings...
                                </div>
                            ) : bookingsError ? (
                                <div className="text-center py-8 text-red-600 bg-red-50 rounded-xl border border-red-200">{bookingsError}</div>
                            ) : bookings.length === 0 ? (
                                <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-200">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200 shadow-sm">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                                    </div>
                                    <p className="text-gray-500 mb-6 text-lg">You have no recent bookings.</p>
                                    <Link to="/" className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 font-bold rounded-xl text-white hover:bg-blue-700 transition-colors shadow-md">
                                        Find a Parking Spot
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map((booking) => (
                                        <div key={booking._id} className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-blue-300 transition-colors group shadow-sm hover:shadow-md">
                                            <div className="mb-4 sm:mb-0">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{booking.car_park?.name || 'Unknown Car Park'}</h4>
                                                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border ${getStatusStyles(booking.booking_status)}`}>
                                                        {getStatusText(booking.booking_status)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 flex items-center gap-2">
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                    Slot {booking.slot?.slot_number} &bull; {new Date(booking.start_time).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-6 w-full sm:w-auto justify-between sm:justify-end">
                                                <div className="text-left sm:text-right">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Amount</p>
                                                    <p className="font-extrabold text-xl text-gray-900">Rs. {booking.total_amount}</p>
                                                </div>
                                                <Link to="/mybookings" className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:text-white hover:bg-blue-600 transition-all border border-blue-100 shadow-sm">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                    {bookings.length >= 3 && (
                                        <div className="text-center mt-8">
                                            <Link to="/mybookings" className="inline-flex items-center justify-center px-8 py-3 bg-white border border-gray-300 font-bold rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                                                Manage All Bookings
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

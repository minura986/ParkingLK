import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';

const BookingDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/bookings/${id}`, config);
                setBooking(data);
            } catch (err) {
                console.error(err);
                setError('Failed to fetch booking details.');
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            fetchBooking();
        }
    }, [id, user]);

    if (!user) return null;

    const formatDuration = (totalMinutes) => {
        if (!totalMinutes) return '';
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        if (hours > 0 && minutes > 0) {
            return `${hours} hr ${minutes} min`;
        } else if (hours > 0) {
            return `${hours} hr`;
        }
        return `${minutes} min`;
    };

    const content = (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl mt-8 mb-8 border border-gray-100">
            <div className="flex justify-between items-center border-b border-gray-200 pb-6 mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900">Booking Details</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Go Back
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium text-center">{error}</div>
            ) : booking ? (
                <div className="space-y-8 text-gray-700">
                    <div className="bg-gray-50 rounded-xl p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 border border-gray-100">
                        {/* Status Highlights */}
                        <div className="col-span-1 md:col-span-2 flex flex-wrap gap-4 mb-2">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${booking.booking_status === 'active' ? 'bg-green-100 text-green-800 border border-green-200' :
                                    booking.booking_status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                        booking.booking_status === 'upcoming' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                            'bg-gray-100 text-gray-800 border border-gray-200'
                                }`}>
                                {booking.booking_status}
                            </span>
                            {booking.is_ev_charging && (
                                <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    EV Charging
                                </span>
                            )}
                        </div>

                        {/* ID Section */}
                        <div className="col-span-1 md:col-span-2">
                            <p className="text-sm text-gray-500 font-semibold mb-1">Booking ID</p>
                            <p className="font-mono text-lg text-gray-800 bg-white px-3 py-2 rounded-lg border border-gray-200 inline-block">{booking._id}</p>
                        </div>

                        {/* Details */}
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Driver Name</p>
                            <p className="font-medium text-lg">{booking.user?.name || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Vehicle</p>
                            <p className="font-medium text-lg">
                                {booking.vehicle_type ? (
                                    <span className="capitalize">{booking.vehicle_type} - </span>
                                ) : ''}
                                <span className="uppercase bg-gray-200 px-2 py-0.5 rounded text-sm tracking-widest">{booking.license_plate || 'N/A'}</span>
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Facility (Car Park)</p>
                            <p className="font-medium text-lg text-blue-700">{booking.car_park?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Assigned Slot</p>
                            <p className="font-bold text-xl text-blue-600 bg-blue-50 px-3 py-1 rounded inline-block">{booking.slot?.slot_number || 'N/A'}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Booked Start Time</p>
                            <p className="font-medium">{new Date(booking.start_time).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-semibold mb-1">Booked End Time</p>
                            <p className="font-medium">{new Date(booking.end_time).toLocaleString()}</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                                Actual Check-In
                            </p>
                            <p className={`font-semibold ${booking.actual_check_in_time ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                {booking.actual_check_in_time ? new Date(booking.actual_check_in_time).toLocaleString() : 'Not checked in yet'}
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-sm text-gray-500 font-semibold mb-1 flex items-center gap-2">
                                <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                Actual Check-Out
                            </p>
                            <p className={`font-semibold ${booking.actual_check_out_time ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                {booking.actual_check_out_time ? new Date(booking.actual_check_out_time).toLocaleString() : 'Not checked out yet'}
                            </p>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-lg overflow-hidden relative">
                        {/* Decorative background circle */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white opacity-5 blur-2xl"></div>

                        <h3 className="text-lg font-bold text-gray-300 mb-6 uppercase tracking-wider flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"></path></svg>
                            Financial Summary
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end border-b border-gray-700 pb-3">
                                <div>
                                    <p className="text-gray-400 text-sm mb-1">Base Amount</p>
                                </div>
                                <p className="text-xl font-medium">Rs. {booking.total_amount - (booking.extra_charges || 0)}</p>
                            </div>

                            {(booking.extra_charges > 0 || booking.pending_extra_charges > 0) && (
                                <div className="flex justify-between items-end border-b border-gray-700 pb-3">
                                    <div>
                                        <p className="text-orange-400 text-sm font-semibold mb-1">
                                            {booking.extra_charges > 0 ? 'Overstay Charges' : 'Pending Overstay Charges'}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Duration: {formatDuration(booking.extra_charges_time || booking.pending_extra_charges_time)}
                                        </p>
                                    </div>
                                    <p className="text-xl font-bold text-orange-400">
                                        + Rs. {booking.extra_charges || booking.pending_extra_charges}
                                    </p>
                                </div>
                            )}

                            <div className="flex justify-between items-end pt-4">
                                <div>
                                    <p className="text-gray-300 text-sm uppercase tracking-wider font-bold mb-1">Total Amount</p>
                                </div>
                                <p className="text-4xl font-extrabold text-green-400 tracking-tight">
                                    Rs. {booking.total_amount + (booking.pending_extra_charges || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );

    if (user.role === 'admin' || user.role === 'owner' || user.role === 'attendant') {
        return (
            <AdminLayout title={`Booking ${booking?._id ? `#${booking._id.substring(booking._id.length - 6)}` : 'Details'}`} role={user.role}>
                {content}
            </AdminLayout>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {content}
        </div>
    );
};

export default BookingDetails;

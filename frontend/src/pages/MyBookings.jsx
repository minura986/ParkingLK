import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import { useSocket } from '../context/SocketContext';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

const MyBookings = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'upcoming', 'completed', 'cancelled'

    // Actions state
    const [actionLoading, setActionLoading] = useState(false);
    const [actionMessage, setActionMessage] = useState('');
    const [actionError, setActionError] = useState('');

    // Modals state
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedQrBooking, setSelectedQrBooking] = useState(null);

    // PayPal state
    const [paypalClientId, setPaypalClientId] = useState('');

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

    const fetchBookings = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            };
            const [bookingsRes, configRes] = await Promise.all([
                axios.get('http://localhost:5000/api/bookings/mybookings', config),
                axios.get('http://localhost:5000/api/payment/config/paypal')
            ]);
            setBookings(bookingsRes.data);
            setPaypalClientId(configRes.data.clientId);
            setLoading(false);
        } catch (err) {
            setError('Failed to load bookings');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();

        if (user && socket) {
            const handleBookingUpdate = (data) => {
                console.log('Real-time booking update received in MyBookings:', data);
                fetchBookings();
            };

            socket.on('bookingUpdated', handleBookingUpdate);

            return () => {
                socket.off('bookingUpdated', handleBookingUpdate);
            };
        }
    }, [user, socket]);

    const handleCancelClick = (booking) => {
        setSelectedBooking(booking);
        setShowCancelModal(true);
        setActionError('');
        setActionMessage('');
    };

    const confirmCancel = async () => {
        setActionLoading(true);
        setActionError('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`http://localhost:5000/api/bookings/${selectedBooking._id}/cancel`, {}, config);
            setActionMessage(`Cancelled successfully. Refund: ${data.refund_percentage}%`);
            setTimeout(() => {
                setShowCancelModal(false);
                fetchBookings();
                setActionMessage('');
            }, 2000);
        } catch (err) {
            setActionError(err.response?.data?.message || 'Cancellation failed');
        } finally {
            setActionLoading(false);
        }
    };

    const handleExtraChargesPayment = async (bookingId, orderData) => {
        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` } };
            await axios.put(`http://localhost:5000/api/bookings/${bookingId}/pay-extra`, { id: orderData.id }, config);
            alert('Extra charges paid successfully!');
            fetchBookings();
        } catch (err) {
            alert('Failed to update extra charges. Please contact support.');
            console.error(err);
        }
    };

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

    const filteredBookings = bookings.filter(booking => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'cancelled') return booking.booking_status === 'cancelled' || booking.booking_status === 'cancelled_noshow';
        return booking.booking_status === filterStatus;
    });

    if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 text-gray-600 font-medium">Please login to view your bookings.</div>;
    if (loading && bookings.length === 0) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        </div>
    );
    if (error) return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8 text-red-600 font-medium">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">My Bookings</h1>
                        <p className="text-gray-500 mt-1 font-medium">Manage and view your parking reservations</p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-sm">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-transparent text-gray-700 font-bold text-sm px-4 py-2 border-none focus:ring-0 cursor-pointer outline-none w-full"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="bg-gray-50 p-1.5 rounded-xl border border-gray-200 shadow-sm flex">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition-all duration-300 ${viewMode === 'grid' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                                Cards
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-bold transition-all duration-300 ${viewMode === 'list' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-lg p-16 text-center border border-gray-200 max-w-2xl mx-auto mt-12">
                        <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings yet</h3>
                        <p className="text-gray-500 text-lg mb-8">You haven't made any parking reservations in this status.</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'list' ? (
                            <div className="flex flex-col gap-6">
                                {filteredBookings.map((booking) => (
                                    <div key={booking._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden group">

                                        {/* Colored Left Border Indicator */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${booking.booking_status === 'active' ? 'bg-green-500' :
                                                booking.booking_status === 'upcoming' ? 'bg-blue-500' :
                                                    booking.booking_status === 'completed' ? 'bg-gray-400' : 'bg-red-500'
                                            }`}></div>

                                        {/* Left Status & Location */}
                                        <div className="min-w-[250px] flex-shrink-0 pl-3">
                                            <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold mb-3 uppercase tracking-wider border ${getStatusStyles(booking.booking_status)}`}>
                                                {getStatusText(booking.booking_status)}
                                            </span>
                                            <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors">{booking.car_park?.name || 'Unknown'}</h3>
                                            <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                                                Slot {booking.slot?.slot_number} <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-1">({booking.slot?.type})</span>
                                            </p>
                                        </div>

                                        {/* Middle Timings */}
                                        <div className="flex-grow flex flex-col sm:flex-row gap-6 sm:gap-12 text-sm text-gray-700 bg-gray-50/50 border border-gray-100 p-4 rounded-xl w-full md:w-auto">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Start Time</span>
                                                <div className="flex items-center font-bold text-gray-900 text-base">
                                                    {new Date(booking.start_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <div className="hidden sm:block w-px bg-gray-200"></div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">End Time</span>
                                                <div className="flex items-center font-bold text-gray-900 text-base">
                                                    {new Date(booking.end_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Pricing & Actions */}
                                        <div className="flex flex-row md:flex-col justify-between items-center md:items-end w-full md:w-auto min-w-[140px] ml-auto">
                                            <div className="text-left md:text-right">
                                                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider block mb-1">Total Amount</span>
                                                <span className="font-extrabold text-2xl text-gray-900 block leading-none mb-1">Rs. {booking.total_amount}</span>
                                                {booking.extra_charges > 0 ? (
                                                    <div className="flex flex-col items-end mt-2">
                                                        <div className="text-xs font-bold text-orange-700 bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-md inline-block shadow-sm">Overstay: Rs. {booking.extra_charges}</div>
                                                        {!booking.extra_charges_paid && paypalClientId && (
                                                            <div className="mt-2 w-[150px] z-10">
                                                                <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: "USD" }}>
                                                                    <PayPalButtons
                                                                        style={{ layout: "horizontal", height: 25, tagline: false }}
                                                                        createOrder={(data, actions) => {
                                                                            const usdAmount = (booking.extra_charges / 300).toFixed(2);
                                                                            return actions.order.create({
                                                                                purchase_units: [{ amount: { value: usdAmount > 0 ? usdAmount : '1.00' }, description: "Parking Overstay Charges" }],
                                                                            });
                                                                        }}
                                                                        onApprove={async (data, actions) => {
                                                                            const order = await actions.order.capture();
                                                                            handleExtraChargesPayment(booking._id, order);
                                                                        }}
                                                                    />
                                                                </PayPalScriptProvider>
                                                            </div>
                                                        )}
                                                        {booking.extra_charges_paid && <div className="text-xs text-green-700 bg-green-100 font-bold mt-2 px-2 py-1 rounded border border-green-200 inline-block shadow-sm">Paid</div>}
                                                    </div>
                                                ) : booking.pending_extra_charges > 0 ? (
                                                    <div className="text-xs font-bold text-orange-700 bg-orange-100 border border-orange-200 px-2.5 py-1 rounded-md animate-pulse inline-block mt-2 shadow-sm">Pending: Rs. {booking.pending_extra_charges}</div>
                                                ) : null}
                                            </div>

                                            <div className="flex flex-col items-end gap-2 mt-0 md:mt-4">
                                                {booking.booking_status === 'upcoming' && (
                                                    <button onClick={() => handleCancelClick(booking)} className="text-sm font-bold text-red-600 hover:text-white hover:bg-red-600 px-4 py-2 rounded-lg transition-colors border border-red-200 hover:border-red-600 shadow-sm">Cancel</button>
                                                )}
                                                {booking.booking_status !== 'cancelled' && booking.booking_status !== 'cancelled_noshow' && (
                                                    <button onClick={() => setSelectedQrBooking(booking)} className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-md hover:shadow-lg">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                                                        View QR
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {filteredBookings.map((booking) => (
                                    <div key={booking._id} className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col sm:flex-row relative">
                                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${booking.booking_status === 'active' ? 'bg-green-500' :
                                                booking.booking_status === 'upcoming' ? 'bg-blue-500' :
                                                    booking.booking_status === 'completed' ? 'bg-gray-400' : 'bg-red-500'
                                            }`}></div>

                                        {/* Left Side: Booking Details */}
                                        <div className="p-8 flex-grow border-b sm:border-b-0 sm:border-r border-gray-100 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold mb-3 uppercase tracking-wider border ${getStatusStyles(booking.booking_status)}`}>
                                                            {getStatusText(booking.booking_status)}
                                                        </span>
                                                        <h3 className="text-2xl font-extrabold text-blue-900">{booking.car_park?.name || 'Unknown Car Park'}</h3>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end">
                                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-wider block">Total Amount</span>
                                                        <span className="font-extrabold text-2xl text-gray-900">Rs. {booking.total_amount}</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 text-gray-600 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                                                    <div className="flex items-center font-medium">
                                                        <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3 text-blue-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></span>
                                                        {booking.car_park?.address}
                                                    </div>
                                                    <div className="flex items-center font-medium">
                                                        <span className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center mr-3 text-indigo-600"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg></span>
                                                        Slot {booking.slot?.slot_number} <span className="ml-1 text-xs bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500">{booking.slot?.type}</span>
                                                    </div>

                                                    <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Check In</p>
                                                            <p className="font-bold text-gray-900 flex items-center">
                                                                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                                                {new Date(booking.start_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Check Out</p>
                                                            <p className="font-bold text-gray-900 flex items-center">
                                                                <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                                                                {new Date(booking.end_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {booking.extra_charges > 0 ? (
                                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                                            <div className="flex items-center text-orange-700 font-bold bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                                                                Overstay: Rs. {booking.extra_charges} {booking.extra_charges_time ? `(${formatDuration(booking.extra_charges_time)})` : ''}
                                                            </div>
                                                            {!booking.extra_charges_paid && paypalClientId && (
                                                                <div className="w-full z-10 pt-3">
                                                                    <PayPalScriptProvider options={{ "client-id": paypalClientId, currency: "USD" }}>
                                                                        <PayPalButtons
                                                                            style={{ layout: "horizontal", height: 35, tagline: false }}
                                                                            createOrder={(data, actions) => {
                                                                                const usdAmount = (booking.extra_charges / 300).toFixed(2);
                                                                                return actions.order.create({
                                                                                    purchase_units: [{ amount: { value: usdAmount > 0 ? usdAmount : '1.00' }, description: "Parking Overstay Charges" }],
                                                                                });
                                                                            }}
                                                                            onApprove={async (data, actions) => {
                                                                                const order = await actions.order.capture();
                                                                                handleExtraChargesPayment(booking._id, order);
                                                                            }}
                                                                        />
                                                                    </PayPalScriptProvider>
                                                                </div>
                                                            )}
                                                            {booking.extra_charges_paid && <span className="mt-3 text-sm font-bold text-green-700 px-3 py-1.5 bg-green-100 border border-green-200 rounded-lg inline-block w-full text-center shadow-sm">Overstay Paid Successfully</span>}
                                                        </div>
                                                    ) : (
                                                        booking.pending_extra_charges > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                                <div className="flex items-center justify-center text-orange-700 font-bold animate-pulse bg-orange-50 px-3 py-2 rounded-lg border border-orange-100">
                                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                                    Pending Overstay: Rs. {booking.pending_extra_charges} {booking.pending_extra_charges_time ? `(${formatDuration(booking.pending_extra_charges_time)})` : ''}
                                                                </div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {booking.booking_status === 'upcoming' && (
                                                <div className="mt-6 flex">
                                                    <button
                                                        onClick={() => handleCancelClick(booking)}
                                                        className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm"
                                                    >
                                                        Cancel Reservation
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Side: QR Code */}
                                        <div className="p-8 bg-gray-50 flex flex-col items-center justify-center min-w-[220px]">
                                            {booking.booking_status !== 'cancelled' && booking.booking_status !== 'cancelled_noshow' ? (
                                                <>
                                                    <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 mb-4 transform transition-transform hover:scale-105">
                                                        <QRCodeSVG
                                                            value={JSON.stringify({ bookingId: booking._id, userId: user._id })}
                                                            size={130}
                                                            level="H"
                                                            fgColor={booking.booking_status === 'completed' ? "#9CA3AF" : "#1E3A8A"}
                                                        />
                                                    </div>
                                                    <p className="text-sm text-center text-gray-600 font-bold mb-1 line-clamp-2">Scan at entrance<br />and exit</p>
                                                    <p className="text-xs text-gray-400 font-mono tracking-wider bg-gray-200 px-2 py-1 rounded mt-2">ID: {booking._id.substring(0, 8)}</p>

                                                    <button onClick={() => setSelectedQrBooking(booking)} className="mt-4 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 hover:bg-blue-100 py-2 px-4 rounded-lg border border-blue-100">
                                                        Expand QR
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center">
                                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path></svg>
                                                    </div>
                                                    <div className="text-gray-500 font-bold text-center">QR Invalidated</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                <div className="mt-0">
                    {/* Cancel Modal */}
                    {showCancelModal && selectedBooking && (
                        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100 overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-2 bg-red-500"></div>
                                <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Cancel Booking</h2>
                                <p className="text-gray-600 mb-6 font-medium">
                                    Are you sure you want to cancel your booking for <span className="font-bold text-gray-900">{selectedBooking.car_park?.name}</span>?
                                </p>
                                <div className="bg-red-50/50 border border-red-100 p-5 rounded-2xl mb-6 text-sm">
                                    <p className="text-red-800 font-bold mb-3 flex items-center"><svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>Refund Policy:</p>
                                    <ul className="space-y-2 text-gray-700 font-medium">
                                        <li className="flex justify-between items-center"><span className="text-gray-500">&gt; 1 hr before start</span> <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded font-bold">100% Refund</span></li>
                                        <li className="flex justify-between items-center"><span className="text-gray-500">&lt; 1 hr before start</span> <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-bold">50% Refund</span></li>
                                        <li className="flex justify-between items-center"><span className="text-gray-500">After start</span> <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">No Refund</span></li>
                                    </ul>
                                </div>
                                {actionMessage && <div className="mb-6 bg-green-50 text-green-700 p-3 rounded-lg border border-green-200 font-bold flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{actionMessage}</div>}
                                {actionError && <div className="mb-6 bg-red-50 text-red-700 p-3 rounded-lg border border-red-200 font-bold flex items-center"><svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>{actionError}</div>}
                                <div className="flex justify-end space-x-4">
                                    <button
                                        onClick={() => setShowCancelModal(false)}
                                        className="px-6 py-3 text-gray-600 bg-white border border-gray-300 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                        disabled={actionLoading}
                                    >
                                        Keep Booking
                                    </button>
                                    <button
                                        onClick={confirmCancel}
                                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? (
                                            <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Cancelling...</>
                                        ) : 'Confirm Cancel'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* QR Details Modal */}
                    {selectedQrBooking && (
                        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
                            <div className="bg-white rounded-3xl max-w-sm w-full p-10 flex flex-col items-center shadow-2xl relative border border-gray-100">
                                <button
                                    onClick={() => setSelectedQrBooking(null)}
                                    className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>

                                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                                </div>

                                <h2 className="text-2xl font-extrabold text-blue-900 mb-1 text-center">{selectedQrBooking.car_park?.name}</h2>
                                <p className="text-gray-500 font-bold mb-8">Slot {selectedQrBooking.slot?.slot_number}</p>

                                <div className="bg-white p-5 rounded-3xl shadow-lg border border-gray-100 mb-6 w-full flex justify-center transform transition-transform hover:scale-105">
                                    <QRCodeSVG
                                        value={JSON.stringify({ bookingId: selectedQrBooking._id, userId: user._id })}
                                        size={220}
                                        level="H"
                                        fgColor={selectedQrBooking.booking_status === 'completed' ? "#9CA3AF" : "#1E3A8A"}
                                    />
                                </div>

                                <p className="text-sm text-center text-gray-800 font-bold mb-2">Scan at entrance and exit gate</p>
                                <p className="text-xs text-gray-500 font-mono tracking-wider bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">ID: {selectedQrBooking._id}</p>

                                <button
                                    onClick={() => setSelectedQrBooking(null)}
                                    className="mt-8 w-full px-4 py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBookings;

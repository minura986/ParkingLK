import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';

const ManageBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            };

            const endpoint = user?.role === 'super_admin'
                ? 'http://localhost:5000/api/bookings/all'
                : 'http://localhost:5000/api/bookings/owner';

            const { data } = await axios.get(endpoint, config);
            setBookings(data);
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || 'Error fetching bookings');
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, field, value) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`
                }
            };
            const updateData = { [field]: value };

            const { data } = await axios.put(`http://localhost:5000/api/bookings/${id}/status`, updateData, config);

            // Update local state
            setBookings(bookings.map(booking => booking._id === id ? data : booking));
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating status');
        }
    };

    if (loading) {
        return (
            <AdminLayout title="Manage Bookings" role={user?.role}>
                <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout title="Manage Bookings" role={user?.role}>
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </AdminLayout>
        );
    }

    // Group bookings by car park
    const groupedBookings = bookings.reduce((acc, booking) => {
        const carParkName = booking.car_park?.name || 'Unknown Car Park';
        if (!acc[carParkName]) {
            acc[carParkName] = [];
        }
        acc[carParkName].push(booking);
        return acc;
    }, {});

    return (
        <AdminLayout title="Manage Bookings" role={user?.role}>
            <div className="space-y-8">
                {Object.keys(groupedBookings).length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        No bookings found.
                    </div>
                ) : (
                    Object.keys(groupedBookings).map((carParkName) => (
                        <div key={carParkName} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                            <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                    {carParkName}
                                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                                        {groupedBookings[carParkName].length} Bookings
                                    </span>
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot Details</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {groupedBookings[carParkName].map((booking) => (
                                            <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono" title={booking._id}>
                                                    {booking._id.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-gray-900">{booking.user?.name || 'N/A'}</div>
                                                    <div className="text-xs text-gray-500">{booking.user?.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">Slot {booking.slot?.slot_number}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{booking.slot?.type}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                                        <span className="text-green-500 text-xs">●</span>
                                                        {new Date(booking.start_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-600 mt-1 flex items-center gap-1">
                                                        <span className="text-red-500 text-xs">●</span>
                                                        {new Date(booking.end_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                                    Rs. {booking.total_amount}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={booking.payment_status}
                                                        onChange={(e) => handleStatusChange(booking._id, 'payment_status', e.target.value)}
                                                        className={`text-xs rounded-full px-3 py-1 font-bold border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none appearance-none
                                                            ${booking.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-red-100 text-red-800'}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="failed">Failed</option>
                                                        <option value="refunded">Refunded</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        value={booking.booking_status}
                                                        onChange={(e) => handleStatusChange(booking._id, 'booking_status', e.target.value)}
                                                        className={`text-xs rounded-full px-3 py-1 font-bold border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none appearance-none
                                                            ${booking.booking_status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                                booking.booking_status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                    booking.booking_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                        booking.booking_status === 'cancelled_noshow' ? 'bg-orange-100 text-orange-800' :
                                                                            'bg-gray-100 text-gray-800'}`}
                                                    >
                                                        <option value="upcoming">Upcoming</option>
                                                        <option value="active">Active</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                        <option value="cancelled_noshow">No Show</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </AdminLayout>
    );
};

export default ManageBookings;

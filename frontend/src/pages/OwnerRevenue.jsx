import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';

const OwnerRevenue = () => {
    const { user } = useAuth();
    const [data, setData] = useState({ stats: null, recentBookings: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRevenue = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data: resData } = await axios.get('/api/revenue/owner', config);
                setData(resData);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load revenue data');
                setLoading(false);
            }
        };
        fetchRevenue();
    }, [user.token]);

    return (
        <AdminLayout title="Revenue & Payouts" role="car_owner">
            <div className="space-y-6">
                {/* Stats Cards */}
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading revenue stats...</div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">{error}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Generated</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 mt-2">Rs. {data.stats?.totalGenerated?.toLocaleString()}</h3>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-gray-500">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span> Lifetime Platform Earnings
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Paid Out</p>
                                    <h3 className="text-3xl font-extrabold text-green-600 mt-2">Rs. {data.stats?.totalPaid?.toLocaleString()}</h3>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-gray-500">
                                    <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span> Successfully transferred
                                </div>
                            </div>

                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500 p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div>
                                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending Payout</p>
                                    <h3 className="text-3xl font-extrabold text-orange-600 mt-2">Rs. {data.stats?.totalPending?.toLocaleString()}</h3>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-gray-500">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span> Awaiting Admin processing
                                </div>
                            </div>
                        </div>

                        {/* Recent Income Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800">Recent Completed Bookings</h2>
                                    <p className="text-sm text-gray-500">History of your parking lot revenue events.</p>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                                            <th className="px-6 py-4 font-semibold">Booking ID</th>
                                            <th className="px-6 py-4 font-semibold">Car Park</th>
                                            <th className="px-6 py-4 font-semibold">Date</th>
                                            <th className="px-6 py-4 font-semibold text-right">Amount</th>
                                            <th className="px-6 py-4 font-semibold text-center">Payout Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {data.recentBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                                    No completed bookings found yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            data.recentBookings.map((booking) => (
                                                <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-xs font-mono text-gray-500">{booking._id.substring(0, 8)}...</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{booking.car_park?.name || 'Unknown'}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {new Date(booking.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-green-600 text-right">
                                                        Rs. {booking.total_amount?.toLocaleString() || 0}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${booking.owner_payout_status === 'paid'
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-orange-100 text-orange-800'
                                                            }`}>
                                                            {booking.owner_payout_status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default OwnerRevenue;

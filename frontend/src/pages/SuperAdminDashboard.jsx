import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const SuperAdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ users: 0, parks: 0, bookings: 0 });
    const [loading, setLoading] = useState(true);
    const [editingParkId, setEditingParkId] = useState(null);
    const [editPriceValue, setEditPriceValue] = useState('');
    const [savingPrice, setSavingPrice] = useState(false);

    useEffect(() => {
        // Simple protection
        if (!user || user.role !== 'super_admin') {
            navigate('/');
            return;
        }

        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                // Fetch real data simultaneously
                const [parksRes, usersRes, bookingsRes] = await Promise.all([
                    axios.get('/api/carparks/admin', config),
                    axios.get('/api/users', config),
                    axios.get('/api/bookings/all', config)
                ]);

                setStats({
                    users: usersRes.data.length,
                    parks: parksRes.data.filter(p => p.is_active).length,
                    bookings: bookingsRes.data.length,
                    carParksList: parksRes.data
                });
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, navigate]);

    const handleSavePrice = async (parkId) => {
        if (!editPriceValue || isNaN(editPriceValue)) return;
        setSavingPrice(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/carparks/${parkId}`, {
                price_per_hour: parseFloat(editPriceValue)
            }, config);

            // Update local state
            setStats(prevStats => ({
                ...prevStats,
                carParksList: prevStats.carParksList.map(p =>
                    p._id === parkId ? { ...p, price_per_hour: parseFloat(editPriceValue) } : p
                )
            }));

            setEditingParkId(null);
        } catch (error) {
            console.error("Failed to update price", error);
            alert('Failed to update price.');
        } finally {
            setSavingPrice(false);
        }
    };

    const handleApproveReject = async (parkId, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/carparks/${parkId}/status`, { status }, config);

            // Update local state
            setStats(prevStats => ({
                ...prevStats,
                carParksList: prevStats.carParksList.map(p =>
                    p._id === parkId ? { ...p, approval_status: status, is_active: status === 'approved' } : p
                )
            }));
        } catch (error) {
            console.error(`Failed to ${status} car park`, error);
            alert(`Failed to update car park status to ${status}.`);
        }
    };

    if (loading) return <div className="p-8 text-center text-xl">Loading Dashboard...</div>;

    return (
        <AdminLayout title="Dashboard Control Panel" role="super_admin">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-[#00C0EF] rounded shadow-sm p-6 text-white relative overflow-hidden group">
                    <div className="absolute top-4 right-4 text-white/20 text-6xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-file-alt"></i> {/* Placeholder for generic icon effect */}
                    </div>
                    <h3 className="text-4xl font-bold mb-2">{stats.users}</h3>
                    <p className="text-sm font-semibold uppercase tracking-wider mb-2">Total Users</p>
                    <div className="mt-4 border-t border-white/20 pt-2 text-center text-sm bg-black/10 absolute bottom-0 left-0 w-full py-1 cursor-pointer hover:bg-black/20 transition-colors">
                        More info <span className="ml-1">➔</span>
                    </div>
                </div>

                <div className="bg-[#F39C12] rounded shadow-sm p-6 text-white relative overflow-hidden group pb-10">
                    <div className="absolute top-4 right-4 text-white/20 text-6xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-image"></i>
                    </div>
                    <h3 className="text-4xl font-bold mb-2">{stats.parks}</h3>
                    <p className="text-sm font-semibold uppercase tracking-wider mb-2">Active Car Parks</p>
                    <div className="mt-4 border-t border-white/20 pt-2 text-center text-sm bg-black/10 absolute bottom-0 left-0 w-full py-1 cursor-pointer hover:bg-black/20 transition-colors">
                        More info <span className="ml-1">➔</span>
                    </div>
                </div>

                <div className="bg-[#DD4B39] rounded shadow-sm p-6 text-white relative overflow-hidden group pb-10">
                    <div className="absolute top-4 right-4 text-white/20 text-6xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-users"></i>
                    </div>
                    <h3 className="text-4xl font-bold mb-2">{stats.bookings}</h3>
                    <p className="text-sm font-semibold uppercase tracking-wider mb-2">Total Bookings</p>
                    <div className="mt-4 border-t border-white/20 pt-2 text-center text-sm bg-black/10 absolute bottom-0 left-0 w-full py-1 cursor-pointer hover:bg-black/20 transition-colors">
                        More info <span className="ml-1">➔</span>
                    </div>
                </div>

                <div className="bg-[#00A65A] rounded shadow-sm p-6 text-white relative overflow-hidden group pb-10">
                    <div className="absolute top-4 right-4 text-white/20 text-6xl group-hover:scale-110 transition-transform">
                        <i className="fas fa-cogs"></i>
                    </div>
                    <h3 className="text-4xl font-bold mb-2">System</h3>
                    <p className="text-sm font-semibold uppercase tracking-wider mb-2">All Services Operational</p>
                    <div className="mt-4 border-t border-white/20 pt-2 text-center text-sm bg-black/10 absolute bottom-0 left-0 w-full py-1 cursor-pointer hover:bg-black/20 transition-colors">
                        More info <span className="ml-1">➔</span>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-t-none border-t-[3px] border-[#3C8DBC] overflow-hidden mb-8">
                <div className="border-b border-gray-100 p-4">
                    <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                    <button className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-4 py-2 rounded-lg font-medium transition-colors">
                        View All
                    </button>
                </div>
                <div className="p-0">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Park Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Base Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner Detail</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {stats.carParksList && stats.carParksList.map((park) => (
                                <tr key={park._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{park.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{park.address}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{park.total_slots} Slots</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {editingParkId === park._id ? (
                                            <input
                                                type="number"
                                                className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                value={editPriceValue}
                                                onChange={(e) => setEditPriceValue(e.target.value)}
                                            />
                                        ) : (
                                            `Rs. ${park.price_per_hour}`
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {park.approval_status === 'approved' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>}
                                        {park.approval_status === 'pending' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>}
                                        {park.approval_status === 'rejected' && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>}
                                        {!park.approval_status && <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {park.owner?.name ? `${park.owner.name} (${park.owner.email})` : 'System ID: ' + park._id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-y-2">
                                        {editingParkId === park._id ? (
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleSavePrice(park._id)}
                                                    disabled={savingPrice}
                                                    className="text-green-600 hover:text-green-900 font-medium"
                                                >
                                                    {savingPrice ? '...' : 'Save'}
                                                </button>
                                                <button
                                                    onClick={() => setEditingParkId(null)}
                                                    className="text-gray-600 hover:text-gray-900 font-medium"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => {
                                                        setEditingParkId(park._id);
                                                        setEditPriceValue(park.price_per_hour);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                                >
                                                    Edit Price
                                                </button>

                                                {park.approval_status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApproveReject(park._id, 'approved')}
                                                            className="text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-xs font-bold"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleApproveReject(park._id, 'rejected')}
                                                            className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs font-bold"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {(!stats.carParksList || stats.carParksList.length === 0) && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No Car Parks registered yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default SuperAdminDashboard;

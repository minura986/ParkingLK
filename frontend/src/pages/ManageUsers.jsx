import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const ManageUsers = () => {
    const { user } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const roleFilter = queryParams.get('role');

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            const endpoint = roleFilter ? `/api/users?role=${roleFilter}` : '/api/users';
            const { data } = await axios.get(endpoint, config);

            setUsers(data);
            setLoading(false);
        } catch (error) {
            setError(error.response && error.response.data.message ? error.response.data.message : error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [user, location.search]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.put(`/api/users/${userId}/role`, { role: newRole }, config);
            setMessage('User role updated successfully.');
            setTimeout(() => setMessage(null), 3000);
            fetchUsers();
        } catch (error) {
            setError(error.response && error.response.data.message ? error.response.data.message : error.message);
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                await axios.delete(`/api/users/${userId}`, config);
                setMessage('User deleted successfully.');
                setTimeout(() => setMessage(null), 3000);
                fetchUsers();
            } catch (error) {
                setError(error.response && error.response.data.message ? error.response.data.message : error.message);
                setTimeout(() => setError(null), 3000);
            }
        }
    };

    return (
        <AdminLayout title="Manage Users" role="super_admin">
            <div className="bg-white shadow rounded-t-none border-t-[3px] border-[#3C8DBC] overflow-hidden">
                <div className="border-b border-gray-100 p-4">
                    <h2 className="text-xl font-bold text-gray-900">
                        {roleFilter === 'user' && 'Users'}
                        {roleFilter === 'car_owner' && 'Car Owners'}
                        {roleFilter === 'attendant' && 'Attendants'}
                        {roleFilter === 'super_admin' && 'Super Admins'}
                        {!roleFilter && 'All Users'}
                    </h2>
                </div>

                {message && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 m-4" role="alert">{message}</div>}
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 m-4" role="alert">{error}</div>}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-4">Loading users...</td></tr>
                            ) : users.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {/* Don't allow changing own role to prevent lockout */}
                                        {u._id === user._id ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {u.role}
                                            </span>
                                        ) : (
                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                                className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-[#3C8DBC] focus:border-[#3C8DBC] sm:text-sm rounded-md"
                                            >
                                                <option value="user">User</option>
                                                <option value="car_owner">Car Owner</option>
                                                <option value="attendant">Attendant</option>
                                                <option value="super_admin">Super Admin</option>
                                            </select>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex space-x-2">
                                        {u._id !== user._id && (
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageUsers;

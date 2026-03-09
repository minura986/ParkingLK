import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';

const ManageAttendants = () => {
    const { user } = useAuth();
    const [attendants, setAttendants] = useState([]);
    const [carParks, setCarParks] = useState([]);
    const [selectedCarPark, setSelectedCarPark] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // New Attendant Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        fetchCarParks();
    }, []);

    useEffect(() => {
        if (selectedCarPark) {
            fetchAttendants(selectedCarPark);
        } else {
            setAttendants([]);
        }
    }, [selectedCarPark]);

    const fetchCarParks = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Note: owner/carparks isn't a direct endpoint right now, we use general /api/carparks and filter for owner on FE, or better yet if we have an owner-specific endpoint.
            // Using standard GET /api/carparks and filtering by this owner.
            const { data } = await axios.get('/api/carparks', config);
            const myParks = data.filter(cp => cp.owner === user._id || user.role === 'super_admin');
            setCarParks(myParks);
            if (myParks.length > 0) {
                setSelectedCarPark(myParks[0]._id);
            }
        } catch (error) {
            console.error('Failed to fetch car parks', error);
        }
    };

    const fetchAttendants = async (carParkId) => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`/api/carparks/${carParkId}/attendants`, config);
            setAttendants(data);
        } catch (error) {
            console.error('Failed to fetch attendants', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddAttendant = async (e) => {
        e.preventDefault();
        if (!selectedCarPark) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post(`/api/carparks/${selectedCarPark}/attendants`, formData, config);

            // Reset form and reload list
            setFormData({ name: '', email: '', password: '' });
            fetchAttendants(selectedCarPark);
            alert('Attendant added successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add attendant');
        }
    };

    const handleRemoveAttendant = async (attendantId) => {
        if (!window.confirm('Are you sure you want to remove this attendant? Their account will be deactivated.')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`/api/carparks/${selectedCarPark}/attendants/${attendantId}`, config);
            fetchAttendants(selectedCarPark);
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to remove attendant');
        }
    };

    return (
        <AdminLayout title="Manage Attendants" role={user.role}>
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header Controls */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Attendant Roster</h2>
                        <p className="text-sm text-gray-500">Manage scanner personnel for your facilities</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <label className="font-medium text-gray-700">Select Facility:</label>
                        <select
                            className="p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedCarPark}
                            onChange={(e) => setSelectedCarPark(e.target.value)}
                        >
                            <option value="">-- Choose Car Park --</option>
                            {carParks.map(cp => (
                                <option key={cp._id} value={cp._id}>{cp.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Attendant Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                            <div className="bg-blue-600 px-6 py-4">
                                <h3 className="text-white font-bold text-lg">Add New Attendant</h3>
                            </div>
                            <form onSubmit={handleAddAttendant} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        minLength="6"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={!selectedCarPark}
                                    className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
                                >
                                    Create Attendant Account
                                </button>
                                {!selectedCarPark && <p className="text-xs text-red-500 text-center mt-2">Please select a facility first</p>}
                            </form>
                        </div>
                    </div>

                    {/* Attendants List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {isLoading ? (
                                        <tr><td colSpan="4" className="text-center py-8 text-gray-500">Loading...</td></tr>
                                    ) : attendants.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-8 text-gray-500">No attendants found for this facility.</td></tr>
                                    ) : (
                                        attendants.map((attendant) => (
                                            <tr key={attendant._id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600" title={attendant.name}>
                                                            {attendant.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">{attendant.name}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {attendant.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        {attendant.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleRemoveAttendant(attendant._id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition">
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageAttendants;

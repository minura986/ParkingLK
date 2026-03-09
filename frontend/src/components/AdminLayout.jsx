import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children, title, role }) => {
    const { logout } = useAuth();
    const location = useLocation();

    const superAdminLinks = [
        { name: 'Dashboard', path: '/admin', icon: '📊' },
        { name: 'Manage Users', path: '/admin/users', icon: '👥' },
        { name: 'Car Parks', path: '/admin/carparks', icon: '🅿️' },
        { name: 'Bookings', path: '/admin/bookings', icon: '📅' },
        { name: 'Manage Slots', path: '/admin/slots', icon: '🚗' },
        { name: 'Scanner Base', path: '/scanner', icon: '📷' },
        { name: 'Payouts', path: '/admin/payouts', icon: '💸' },
        { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
    ];

    const ownerLinks = [
        { name: 'Dashboard', path: '/owner', icon: '📊' },
        { name: 'My Car Parks', path: '/owner/carparks', icon: '🅿️' },
        { name: 'Slot Management', path: '/owner/slots', icon: '🚗' },
        { name: 'Bookings', path: '/owner/bookings', icon: '📅' },
        { name: 'QR Scanner', path: '/scanner', icon: '📷' },
        { name: 'Attendants', path: '/owner/attendants', icon: '👷' },
        { name: 'Revenue', path: '/owner/revenue', icon: '💰' },
    ];

    const attendantLinks = [
        { name: 'QR Scanner', path: '/scanner', icon: '📷' },
        { name: 'Profile', path: '/profile', icon: '👤' },
    ];

    const [usersDropdownOpen, setUsersDropdownOpen] = useState(false);

    let links = [];
    let roleTitle = 'Panel';
    if (role === 'super_admin') {
        links = superAdminLinks;
        roleTitle = 'Master Admin';
    } else if (role === 'car_owner') {
        links = ownerLinks;
        roleTitle = 'Owner Panel';
    } else if (role === 'attendant') {
        links = attendantLinks;
        roleTitle = 'Attendant Base';
    }

    const toggleUsersDropdown = () => {
        setUsersDropdownOpen(!usersDropdownOpen);
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 bg-[#222E3C] text-gray-300 flex flex-col shadow-xl z-20">
                <div className="h-16 flex items-center px-6 bg-[#1A222C] text-white font-bold text-xl tracking-wider">
                    {roleTitle}
                </div>
                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path || (link.name === 'Manage Users' && location.pathname.startsWith('/admin/users'));

                            if (link.name === 'Manage Users') {
                                return (
                                    <div key={link.name}>
                                        <button
                                            onClick={toggleUsersDropdown}
                                            className={`w-full flex items-center justify-between px-6 py-3 text-sm font-medium transition-colors ${isActive
                                                ? 'bg-[#2C3B4E] text-white border-l-4 border-blue-500'
                                                : 'hover:bg-[#2C3B4E] hover:text-white border-l-4 border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-center">
                                                <span className="mr-3">{link.icon}</span>
                                                {link.name}
                                            </div>
                                            <span>{usersDropdownOpen ? '▲' : '▼'}</span>
                                        </button>

                                        {usersDropdownOpen && (
                                            <div className="bg-[#1A222C] py-2">
                                                <Link
                                                    to="/admin/users?role=user"
                                                    className={`block px-12 py-2 text-sm font-medium transition-colors ${location.search === '?role=user' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    Users
                                                </Link>
                                                <Link
                                                    to="/admin/users?role=car_owner"
                                                    className={`block px-12 py-2 text-sm font-medium transition-colors ${location.search === '?role=car_owner' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    Car Owners
                                                </Link>
                                                <Link
                                                    to="/admin/users?role=attendant"
                                                    className={`block px-12 py-2 text-sm font-medium transition-colors ${location.search === '?role=attendant' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    Attendants
                                                </Link>
                                                <Link
                                                    to="/admin/users?role=super_admin"
                                                    className={`block px-12 py-2 text-sm font-medium transition-colors ${location.search === '?role=super_admin' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    Super Admins
                                                </Link>
                                                <Link
                                                    to="/admin/users"
                                                    className={`block px-12 py-2 text-sm font-medium transition-colors ${!location.search ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    All Users
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-[#2C3B4E] text-white border-l-4 border-blue-500'
                                        : 'hover:bg-[#2C3B4E] hover:text-white border-l-4 border-transparent'
                                        }`}
                                >
                                    <span className="mr-3">{link.icon}</span>
                                    {link.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="p-4 bg-[#1A222C]">
                    <button
                        onClick={logout}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors text-sm font-bold"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-[#3C8DBC] shadow flex items-center justify-between px-6 z-10 text-white">
                    <div className="flex items-center">
                        <span className="text-xl font-semibold">{title}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                        <Link to="/" className="hover:text-gray-200 transition-colors">Return to Map</Link>
                    </div>
                </header>

                {/* Main scrollable content */}
                <main className="flex-1 overflow-auto p-6 bg-[#ECF0F5]">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;

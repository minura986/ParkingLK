import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket() || {};
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const profileRef = useRef(null);
    const notifRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-gray-900 text-white p-4 shadow-xl sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
                <Link to="/" className="text-2xl font-extrabold tracking-tight hover:text-blue-400 transition-colors flex items-center gap-2">
                    <span className="text-blue-500 text-3xl leading-none">&bull;</span> ParkingLK
                </Link>
                <div className="flex items-center space-x-6 text-sm font-medium">
                    <Link to="/" className="text-gray-300 hover:text-white transition-colors">Map</Link>
                    <Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
                    {user ? (
                        <div className="relative flex items-center gap-2 sm:gap-4">
                            {/* Notification Bell */}
                            <div className="relative" ref={notifRef}>
                                <button
                                    onClick={() => {
                                        setIsNotifOpen(!isNotifOpen);
                                        if (isDropdownOpen) setIsDropdownOpen(false);
                                    }}
                                    className="p-2 text-gray-300 hover:text-white rounded-full hover:bg-gray-800 transition-colors focus:outline-none relative"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border border-gray-900">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown Menu */}
                                {isNotifOpen && (
                                    <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 animate-fadeIn z-50 overflow-hidden origin-top-right">
                                        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                                            {unreadCount > 0 && (
                                                <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Mark all as read</button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto">
                                            {notifications && notifications.length > 0 ? (
                                                notifications.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50/50' : ''}`}
                                                        onClick={() => {
                                                            if (!notif.read) markAsRead(notif.id);
                                                            if (notif.bookingId) {
                                                                navigate('/mybookings');
                                                                setIsNotifOpen(false);
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className={`text-xs font-bold ${notif.type === 'success' ? 'text-green-600' : notif.type === 'error' ? 'text-red-600' : notif.type === 'warning' ? 'text-orange-600' : 'text-blue-600'}`}>
                                                                {notif.title}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                                                                {new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{notif.message}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="px-4 py-8 text-center text-gray-500 text-sm flex flex-col items-center">
                                                    <span className="text-3xl mb-2">📭</span>
                                                    No notifications yet
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile Dropdown */}
                            <div className="relative" ref={profileRef}>
                                <button
                                    onClick={() => {
                                        setIsDropdownOpen(!isDropdownOpen);
                                        if (isNotifOpen) setIsNotifOpen(false);
                                    }}
                                    className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-full border border-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                                >
                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                        {user.profile_picture ? (
                                            <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            user.name ? user.name.charAt(0).toUpperCase() : 'U'
                                        )}
                                    </div>
                                    <span className="hidden sm:block text-gray-200">{user.name}</span>
                                    <svg
                                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 animate-fadeIn z-50 overflow-hidden origin-top-right">
                                        <div className="px-4 py-3 border-b border-gray-100 flex flex-col">
                                            <div className="flex items-center gap-3 mb-1">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold overflow-hidden flex-shrink-0">
                                                    {user.profile_picture ? (
                                                        <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.name ? user.name.charAt(0).toUpperCase() : 'U'
                                                    )}
                                                </div>
                                                <div className="flex flex-col overflow-hidden">
                                                    <span className="text-sm font-bold text-gray-900 truncate">{user.name}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 truncate">{user.email}</span>
                                        </div>

                                        <div className="py-1">
                                            <Link
                                                to="/profile"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                                My Profile
                                            </Link>
                                            <Link
                                                to="/mybookings"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                                                My Bookings
                                            </Link>

                                            {user.role === 'super_admin' && (
                                                <Link
                                                    to="/admin"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="block px-4 py-2 text-sm font-semibold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 flex items-center gap-2 mt-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            {user.role === 'car_owner' && (
                                                <Link
                                                    to="/owner"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                    className="block px-4 py-2 text-sm font-semibold text-yellow-600 bg-yellow-50 hover:bg-yellow-100 flex items-center gap-2 mt-1"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                                    Owner Dashboard
                                                </Link>
                                            )}
                                        </div>

                                        <div className="border-t border-gray-100 py-1">
                                            <button
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    handleLogout();
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                                                Sign out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <Link to="/login" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-5 rounded-full shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5">
                            Login / Register
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

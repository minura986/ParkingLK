import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CarParkDetails from './pages/CarParkDetails';
import MyBookings from './pages/MyBookings';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import ManageUsers from './pages/ManageUsers';
import OwnerDashboard from './pages/OwnerDashboard';
import ManageCarParks from './pages/ManageCarParks';
import ManageBookings from './pages/ManageBookings';
import ManageSlots from './pages/ManageSlots';
import AttendantView from './pages/AttendantView';
import ManageAttendants from './pages/ManageAttendants';
import SuperAdminPayouts from './pages/SuperAdminPayouts';
import OwnerRevenue from './pages/OwnerRevenue';
import BookingDetails from './pages/BookingDetails';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

import About from './pages/About';
import Footer from './components/Footer';

import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';

const AppContent = () => {
    const location = useLocation();
    const { user } = useAuth();
    const navigate = useNavigate();

    const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/owner') || location.pathname.startsWith('/scanner');

    useEffect(() => {
        // If an attendant logs in and hits the root or generic owner/admin path, redirect them
        if (user && user.role === 'attendant') {
            if (location.pathname === '/' || location.pathname === '/admin' || location.pathname === '/owner') {
                navigate('/scanner');
            }
        }
    }, [user, location.pathname, navigate]);

    return (
        <div className={`min-h-screen font-sans bg-gray-50 flex flex-col ${isAdminRoute ? 'h-screen' : ''}`}>
            <Toaster position="top-right" reverseOrder={false} />
            {!isAdminRoute && <Navbar />}
            <main className={isAdminRoute ? 'h-full flex-grow' : 'flex-grow'}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/cookie-policy" element={<CookiePolicy />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/carpark/:id" element={<CarParkDetails />} />
                    <Route path="/mybookings" element={<MyBookings />} />
                    <Route path="/admin" element={<SuperAdminDashboard />} />
                    <Route path="/admin/users" element={<ManageUsers />} />
                    <Route path="/admin/carparks" element={<ManageCarParks />} />
                    <Route path="/admin/bookings" element={<ManageBookings />} />
                    <Route path="/admin/slots" element={<ManageSlots />} />
                    <Route path="/admin/payouts" element={<SuperAdminPayouts />} />
                    <Route path="/owner" element={<OwnerDashboard />} />
                    <Route path="/owner/carparks" element={<ManageCarParks />} />
                    <Route path="/owner/slots" element={<ManageSlots />} />
                    <Route path="/owner/bookings" element={<ManageBookings />} />
                    <Route path="/owner/attendants" element={<ManageAttendants />} />
                    <Route path="/owner/revenue" element={<OwnerRevenue />} />

                    {/* Make Scanner Route available to both roles securely */}
                    <Route path="/scanner" element={<AttendantView />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/booking/:id" element={<BookingDetails />} />
                    <Route path="/payment/:id" element={<Payment />} />
                </Routes>
            </main>
            {!isAdminRoute && <Footer />}
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <SocketProvider>
                <Router>
                    <AppContent />
                </Router>
            </SocketProvider>
        </AuthProvider>
    );
}

export default App;

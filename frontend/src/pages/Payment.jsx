import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Payment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [booking, setBooking] = useState(null);
    const [clientId, setClientId] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                // 1. Fetch PayPal Client ID
                const { data: config } = await axios.get('/api/payment/config/paypal');
                setClientId(config.clientId);

                // 2. Fetch Booking Data
                const configHeaders = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data: bookingData } = await axios.get(`/api/bookings/${id}`, configHeaders);

                // If already paid, or not the owner (and not admin), redirect
                if (bookingData.isPaid) {
                    navigate('/my-bookings');
                    return;
                }

                setBooking(bookingData);
            } catch (err) {
                setError('Failed to load payment details.');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchDetails();
        } else {
            navigate('/login');
        }
    }, [id, user, navigate]);

    const handleApprove = async (data, actions) => {
        try {
            const order = await actions.order.capture();

            // Mark as paid on backend
            const configHeaders = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
            };

            await axios.put(`/api/bookings/${id}/pay`, { id: order.id }, configHeaders);

            alert('Payment successful!');
            navigate('/my-bookings');

        } catch (err) {
            console.error(err);
            alert('Payment capture failed. Please contact support.');
        }
    };

    if (loading) return <div className="p-8 text-center text-xl font-bold">Loading Payment Gateway...</div>;
    if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;
    if (!clientId) return <div className="p-8 text-center">Missing PayPal Configuration</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-blue-600 p-6 text-white text-center">
                    <h1 className="text-3xl font-extrabold mb-2">Complete Your Booking</h1>
                    <p className="opacity-90">Review your details and pay securely via PayPal.</p>
                </div>

                <div className="p-8 flex flex-col md:flex-row gap-8">
                    {/* Booking Summary */}
                    <div className="flex-1 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Summary</h2>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Location</span>
                            <span className="font-bold text-gray-800">{booking.car_park?.name}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Slot</span>
                            <span className="font-bold text-gray-800">{booking.slot?.slot_number}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Arrival</span>
                            <span className="font-medium text-gray-800">{new Date(booking.start_time).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500">Departure</span>
                            <span className="font-medium text-gray-800">{new Date(booking.end_time).toLocaleString()}</span>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center text-xl">
                                <span className="font-bold text-gray-800">Total</span>
                                <span className="font-extrabold text-blue-600">Rs. {booking.total_amount}</span>
                            </div>
                        </div>
                    </div>

                    {/* PayPal Container */}
                    <div className="flex-1 bg-gray-50 p-6 rounded-xl flex items-center justify-center border border-gray-100">
                        <div className="w-full relative z-0">
                            <PayPalScriptProvider options={{ "client-id": clientId, currency: "USD" }}>
                                <PayPalButtons
                                    style={{ layout: "vertical", shape: "rect", color: "blue" }}
                                    createOrder={(data, actions) => {
                                        // Using USD for sandbox, normally we'd convert Rs to USD or use appropriate currency
                                        // For demo, divide Rs by 300 to get rough USD estimate, or just pass total_amount if supported.
                                        // PayPal might not support LKR directly in all accounts, using USD conversion is common for demos
                                        const usdAmount = (booking.total_amount / 300).toFixed(2);
                                        return actions.order.create({
                                            purchase_units: [
                                                {
                                                    amount: {
                                                        value: usdAmount > 0 ? usdAmount : '1.00',
                                                    },
                                                    description: `ParkingLK Booking - ${booking.car_park?.name}`
                                                },
                                            ],
                                        });
                                    }}
                                    onApprove={handleApprove}
                                />
                            </PayPalScriptProvider>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;

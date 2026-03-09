import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';

const AttendantView = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [manualCode, setManualCode] = useState('');
    const scannerRef = useRef(null);

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

    const handleScanSuccess = async (decodedText) => {
        if (scannerRef.current) {
            try { scannerRef.current.pause(true); } catch (e) { } // Pause if scanning
        }
        setIsLoading(true);
        try {
            const parsed = JSON.parse(decodedText);
            const bookingId = parsed.bookingId;

            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`, config);

            if (data.booking_status === 'upcoming') {
                setScanResult({
                    status: 'success',
                    data: data,
                    message: 'Ready to Activate'
                });
            } else {
                setScanResult({
                    status: 'success',
                    data: data
                });
            }

        } catch (error) {
            console.error(error);
            setScanResult({
                status: 'error',
                message: error.response?.data?.message || 'Invalid QR Code format or Booking not found'
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        scannerRef.current = new Html5QrcodeScanner('reader', {
            qrbox: { width: 250, height: 250 },
            fps: 5,
        }, false); // verbose = false

        scannerRef.current.render(handleScanSuccess, () => { });

        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear();
                } catch (e) {
                    console.error("Scanner clear error", e);
                }
            }
        };
        // eslint-disable-next-line
    }, [user?.token]);

    const handleManualFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsLoading(true);
        try {
            const html5QrCode = new Html5Qrcode("hidden-reader");
            const decodedText = await html5QrCode.scanFile(file, false);
            await handleScanSuccess(decodedText);
            html5QrCode.clear();
        } catch (err) {
            console.error("File scan error", err);
            setScanResult({
                status: 'error',
                message: 'Could not find a valid QR Code in the uploaded image.'
            });
        } finally {
            setIsLoading(false);
            // reset file input
            e.target.value = null;
        }
    };

    const handleManualSubmit = async () => {
        if (!manualCode.trim()) return;

        if (scannerRef.current) {
            scannerRef.current.pause(true);
        }
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`http://localhost:5000/api/bookings/${manualCode.trim()}`, config);

            if (data.booking_status === 'upcoming') {
                setScanResult({
                    status: 'success',
                    data: data,
                    message: 'Ready to Activate'
                });
            } else {
                setScanResult({
                    status: 'success',
                    data: data
                });
            }
        } catch (error) {
            setScanResult({
                status: 'error',
                message: error.response?.data?.message || 'Booking not found'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextScan = () => {
        setScanResult(null);
        if (scannerRef.current) {
            try {
                scannerRef.current.resume();
            } catch (e) {
                // If resume fails, we can clear and re-render or just reload
                window.location.reload();
            }
        }
    };

    const handleAction = async (actionType, autoScanData = null) => {
        const targetData = autoScanData || scanResult?.data;
        if (!targetData) return;

        setActionLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const endpoint = `http://localhost:5000/api/bookings/${targetData._id}/${actionType}`;

            const { data } = await axios.put(endpoint, {}, config);

            // Re-fetch booking data to show updated status
            const updatedBooking = await axios.get(`http://localhost:5000/api/bookings/${targetData._id}`, config);

            setScanResult({
                status: 'success',
                message: actionType === 'checkin' ? 'Booking Activated Successfully' : `Check-Out Successful${data.extra_charges > 0 ? ` (Overstay: ${data.extra_charges_time ? formatDuration(data.extra_charges_time) + ', ' : ''}Rs. ${data.extra_charges})` : ''}`,
                data: updatedBooking.data
            });
        } catch (error) {
            setScanResult({
                status: 'error',
                message: error.response?.data?.message || `Failed to ${actionType}`
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Basic protection (moved after hooks)
    if (!user) {
        return null;
    }

    return (
        <AdminLayout title="Attendant Scanner" role={user.role}>
            <div className="max-w-md mx-auto bg-gray-900 rounded-xl shadow-2xl text-white flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-800 bg-[#1A222C]">
                    <h1 className="text-2xl font-bold">QR Scanner Base</h1>
                    <p className="text-gray-400 text-sm">Scan incoming/outgoing vehicles</p>
                </div>

                <div className="flex-grow flex flex-col items-center p-6 w-full">
                    {isLoading && <div className="text-blue-400 my-4 font-bold animate-pulse">Processing Scan...</div>}

                    {/* HTML5 QR Scanner Target */}
                    <div
                        id="reader"
                        className={`w-full bg-black rounded-lg overflow-hidden border-2 border-gray-700 ${scanResult ? 'hidden' : 'block'}`}
                        style={{ minHeight: '300px' }}
                    ></div>
                    <div id="hidden-reader" style={{ display: 'none' }}></div>

                    {!scanResult && !isLoading && (
                        <div className="w-full mt-4">
                            <p className="text-gray-400 text-center text-sm mb-4">
                                Point camera at the driver's QR code on their "My Bookings" page.
                            </p>

                            <div className="flex flex-col gap-3">
                                <p className="text-gray-400 text-sm font-bold text-center mt-2 border-b border-gray-800 pb-2">Or Direct Upload Image</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleManualFileUpload}
                                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500 bg-gray-800 rounded-lg cursor-pointer"
                                />

                                <p className="text-gray-400 text-sm font-bold text-center mt-2 border-b border-gray-800 pb-2">Or Manual Check</p>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={manualCode}
                                        onChange={(e) => setManualCode(e.target.value)}
                                        placeholder="Manual Booking ID"
                                        className="flex-grow p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                        onClick={handleManualSubmit}
                                        disabled={isLoading || !manualCode.trim()}
                                        className="bg-blue-600 px-6 rounded-lg font-bold hover:bg-blue-500 disabled:opacity-50"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Result Modal Overlay */}
                {scanResult && (
                    <div className={`fixed inset-0 z-50 flex flex-col justify-end ${scanResult.status === 'success' ? 'bg-green-900/90' : 'bg-red-900/90'}`}>
                        <div className="bg-white text-gray-900 p-6 pt-8 rounded-t-3xl min-h-[60vh] shadow-[0_-10px_40px_rgba(0,0,0,0.3)] flex flex-col relative">

                            {/* Close Icon Button */}
                            <button
                                onClick={() => navigate(`/booking/${scanResult.data._id}`)}
                                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition-colors"
                                aria-label="Close"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            <div className="text-center mb-6">
                                {scanResult.status === 'success' ? (
                                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </div>
                                )}
                                <h2 className={`text-xl font-bold ${scanResult.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {scanResult.message || (scanResult.data?.booking_status === 'active' ? 'Ready for Check-Out' : 'Action Required')}
                                </h2>
                            </div>

                            {scanResult.status === 'success' && scanResult.data && (
                                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 font-medium text-sm flex-grow">
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Driver</span>
                                        <span>{scanResult.data.user?.name || 'Unknown'}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Facility</span>
                                        <span>{scanResult.data.car_park?.name}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Assigned Slot</span>
                                        <span className="text-blue-600 font-bold text-lg">{scanResult.data.slot?.slot_number}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">Status</span>
                                        <span className="uppercase font-bold text-gray-700">{scanResult.data.booking_status}</span>
                                    </div>
                                    <div className="flex justify-between border-b pb-2">
                                        <span className="text-gray-500">End Time</span>
                                        <span>{new Date(scanResult.data.end_time).toLocaleString()}</span>
                                    </div>
                                    {scanResult.data.extra_charges > 0 ? (
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-orange-500 font-bold">Overstay Charges</span>
                                            <span className="text-orange-600 font-bold">Rs. {scanResult.data.extra_charges} {scanResult.data.extra_charges_time ? `(${formatDuration(scanResult.data.extra_charges_time)})` : ''}</span>
                                        </div>
                                    ) : (
                                        scanResult.data.pending_extra_charges > 0 && (
                                            <div className="flex justify-between border-b pb-2">
                                                <span className="text-orange-500 font-bold text-sm">Pending Overstay</span>
                                                <span className="text-orange-600 font-bold animate-pulse">Rs. {scanResult.data.pending_extra_charges} {scanResult.data.pending_extra_charges_time ? `(${formatDuration(scanResult.data.pending_extra_charges_time)})` : ''}</span>
                                            </div>
                                        )
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Charged</span>
                                        <span className="text-green-600 font-bold">Rs. {scanResult.data.total_amount}</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3 mt-auto">
                                {scanResult.status === 'success' && scanResult.data?.booking_status === 'upcoming' && (
                                    <button
                                        onClick={() => handleAction('checkin')}
                                        disabled={actionLoading}
                                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Processing...' : 'Activate Booking'}
                                    </button>
                                )}

                                {scanResult.status === 'success' && scanResult.data?.booking_status === 'active' && (
                                    <button
                                        onClick={() => handleAction('checkout')}
                                        disabled={actionLoading}
                                        className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-orange-500 transition-colors disabled:opacity-50"
                                    >
                                        {actionLoading ? 'Processing...' : 'Confirm Check-Out'}
                                    </button>
                                )}

                                <button
                                    onClick={handleNextScan}
                                    disabled={actionLoading}
                                    className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    Next Scan
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                 /* Overriding HTML5-QRCode default nasty styles */
                #reader { border: none !important; }
                #reader__scan_region { background: black; min-height: 200px; display: flex; justify-content: center; align-items: center; }
                #reader * { color: white; }
                #reader span, #reader a { color: white !important; }
                #reader__dashboard_section_csr button, #reader__dashboard_section_fsr button { background: #3b82f6 !important; color: white !important; padding: 8px 16px !important; border-radius: 8px !important; font-weight: bold !important; border: none !important; margin-top: 10px !important; margin-right: 5px !important; cursor: pointer !important; opacity: 1 !important;  }
                #reader button:disabled { background: #4b5563 !important; cursor: not-allowed !important; opacity: 0.7 !important; }
                #reader a { color: #60a5fa !important; text-decoration: underline; }
                /* Fix for file scan input */
                #reader__filescan_input { color: white !important; margin-top: 10px; padding: 10px; border-radius: 8px; width: 100%; box-sizing: border-box; }
            `}</style>
            </div>
        </AdminLayout>
    );
};

export default AttendantView;

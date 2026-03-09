import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import socket from '../utils/socket';
import { useAuth } from '../context/AuthContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom User Location Icon
const userIcon = new L.DivIcon({
    className: 'bg-blue-600 border-2 border-white rounded-full w-5 h-5 shadow-lg drop-shadow-md',
    iconSize: [20, 20]
});

// Helper component to center map on search
const ChangeMapView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.flyTo(center, 14);
    }, [center, map]);
    return null;
};

// Routing Component
const RoutingMachine = ({ start, end }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
        if (!map) return;

        // Initialize only once
        routingControlRef.current = L.Routing.control({
            waypoints: [
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ],
            routeWhileDragging: true,
            lineOptions: {
                styles: [{ color: '#2563EB', weight: 6, opacity: 0.8 }]
            },
            show: true,
            addWaypoints: false,
            fitSelectedRoutes: true,
            createMarker: () => null // Optionally hide default waypoints
        }).addTo(map);

        return () => {
            if (routingControlRef.current && map) {
                try {
                    map.removeControl(routingControlRef.current);
                } catch (e) {
                    console.error("Error removing routing control", e);
                }
                routingControlRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map]); // intentionally run once per map mount

    // Update waypoints dynamically when start/end changes
    useEffect(() => {
        if (routingControlRef.current && start && end) {
            routingControlRef.current.setWaypoints([
                L.latLng(start[0], start[1]),
                L.latLng(end[0], end[1])
            ]);
        }
    }, [start, end]);

    return null;
};

const Home = () => {
    const [center, setCenter] = useState([6.9271, 79.8612]); // Default: Colombo
    const navigate = useNavigate();
    const { user } = useAuth();

    // Data State
    const [carParks, setCarParks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchRadius, setSearchRadius] = useState(5); // 5km default

    // Routing State
    const [userLocation, setUserLocation] = useState(null);
    const [destination, setDestination] = useState(null);

    // Filter State
    const [filters, setFilters] = useState({
        has_ev_charging: false,
        is_covered: false,
        has_security: false
    });

    useEffect(() => {
        // Redirect admins/owners away from the map
        if (user) {
            if (user.role === 'super_admin') {
                navigate('/admin');
                return;
            } else if (user.role === 'car_owner') {
                navigate('/owner');
                return;
            }
        }

        // Initial load (fetching all active)
        const fetchCarParks = async () => {
            try {
                const { data } = await axios.get('/api/carparks');
                setCarParks(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching car parks", error);
                setLoading(false);
            }
        };

        fetchCarParks();

        // Listen for real-time updates
        socket.on('carParkUpdated', (updatedPark) => {
            setCarParks((prevParks) =>
                prevParks.map(park => park._id === updatedPark._id ? updatedPark : park)
            );
        });

        // Get User Location for Routing (Live Tracking)
        let watchId;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    setUserLocation([position.coords.latitude, position.coords.longitude]);
                },
                (err) => console.log('Geolocation not allowed/failed:', err),
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );
        }

        return () => {
            socket.off('carParkUpdated');
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [user, navigate]);

    const handleSearch = async (e) => {
        e?.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            // 1. Geocode the query using OpenStreetMap Nominatim
            const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' Sri Lanka')}`);

            if (geoRes.data && geoRes.data.length > 0) {
                const { lat, lon } = geoRes.data[0];
                const newCenter = [parseFloat(lat), parseFloat(lon)];
                setCenter(newCenter);

                // 2. Fetch car parks using backend geospatial search
                const { data } = await axios.get(`/api/carparks/search?lat=${lat}&lng=${lon}&radius=${searchRadius}`);
                setCarParks(data);
            } else {
                alert('Location not found. Try a different search term.');
            }
        } catch (error) {
            console.error("Search failed", error);
            alert('Failed to search area.');
        } finally {
            setLoading(false);
        }
    };

    const toggleFilter = (key) => {
        setFilters(prev => ({ ...prev, [key]: !prev[key] }));
    };

    // Apply Client-Side Filters
    const filteredCarParks = carParks.filter(park => {
        if (filters.has_ev_charging && !park.amenities?.has_ev_charging) return false;
        if (filters.is_covered && !park.amenities?.is_covered) return false;
        if (filters.has_security && !park.amenities?.has_security) return false;
        return true;
    });

    const handleDirections = (parkLocation) => {
        if (!userLocation) {
            alert('Please allow location access to get directions.');
            return;
        }
        setDestination([parkLocation.coordinates[1], parkLocation.coordinates[0]]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] relative w-full overflow-hidden">

            {/* Floating Search Interface */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-full max-w-2xl px-4 flex flex-col items-center">

                <form onSubmit={handleSearch} className="w-full bg-white/90 backdrop-blur-md rounded-full shadow-2xl p-2 flex items-center overflow-hidden border border-white/40">
                    <div className="px-4 text-gray-400">📍</div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Where do you want to park? (e.g. Colombo 03, Kandy)"
                        className="w-full px-2 outline-none text-gray-800 font-medium bg-transparent"
                    />
                    <div className="px-4 border-l border-gray-200">
                        <select
                            value={searchRadius}
                            onChange={(e) => setSearchRadius(Number(e.target.value))}
                            className="bg-transparent text-sm text-gray-600 outline-none cursor-pointer"
                        >
                            <option value={2}>2 km</option>
                            <option value={5}>5 km</option>
                            <option value={10}>10 km</option>
                            <option value={25}>25 km</option>
                        </select>
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-8 py-2.5 rounded-full font-bold shadow-md ml-2 whitespace-nowrap">
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                {/* Filter Pills */}
                <div className="flex justify-center mt-3 space-x-2">
                    <button
                        onClick={() => toggleFilter('has_ev_charging')}
                        className={`text-xs font-bold px-4 py-1.5 rounded-full shadow-md border transition-all ${filters.has_ev_charging ? 'bg-green-500 text-white border-green-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                        ⚡ EV Charging
                    </button>
                    <button
                        onClick={() => toggleFilter('is_covered')}
                        className={`text-xs font-bold px-4 py-1.5 rounded-full shadow-md border transition-all ${filters.is_covered ? 'bg-indigo-500 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                        🏠 Covered
                    </button>
                    <button
                        onClick={() => toggleFilter('has_security')}
                        className={`text-xs font-bold px-4 py-1.5 rounded-full shadow-md border transition-all ${filters.has_security ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                    >
                        👮 24/7 Security
                    </button>
                </div>
            </div>

            {/* Cancel Route Floating Button */}
            {destination && (
                <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-[1000]">
                    <button
                        onClick={() => setDestination(null)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        <span>Clear Route</span>
                    </button>
                </div>
            )}


            {/* Interactive Map */}
            <div className="flex-grow w-full z-0 h-full relative">
                <MapContainer center={center} zoom={13} scrollWheelZoom={true} className="h-full w-full" zoomControl={false}>
                    <ChangeMapView center={center} />
                    {userLocation && destination && <RoutingMachine start={userLocation} end={destination} />}

                    {/* Dark/Modern Tile Layer Theme Option */}
                    <TileLayer
                        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    />

                    {/* User Location Marker */}
                    {userLocation && (
                        <Marker position={userLocation} icon={userIcon}>
                            <Popup className="font-bold text-center">You are here</Popup>
                        </Marker>
                    )}

                    {!loading && filteredCarParks.map(park => (
                        <Marker key={park._id} position={[park.location.coordinates[1], park.location.coordinates[0]]}>
                            <Popup className="custom-popup">
                                <div className="text-center min-w-[200px]">
                                    <h3 className="font-bold text-lg mb-1 text-gray-900">{park.name}</h3>
                                    <p className="text-blue-600 font-bold mb-2">Rs. {park.price_per_hour} / hr</p>

                                    <div className="flex gap-2 mt-4">
                                        <button
                                            onClick={() => navigate(`/carpark/${park._id}`)}
                                            className="bg-gray-900 text-white text-xs font-bold px-3 py-2 rounded-lg flex-1 hover:bg-gray-800 transition-all shadow-md active:scale-95"
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={() => handleDirections(park.location)}
                                            className="bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg flex-1 hover:bg-blue-700 transition-all shadow-md flex items-center justify-center active:scale-95"
                                        >
                                            Show Route
                                        </button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Empty State Fallbacks */}
                    {!loading && filteredCarParks.length === 0 && carParks.length > 0 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white/90 backdrop-blur rounded-xl p-6 shadow-xl text-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No Match</h3>
                            <p className="text-gray-600">No car parks match your selected filters in this area.</p>
                        </div>
                    )}

                    {!loading && carParks.length === 0 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] bg-white/90 backdrop-blur rounded-xl p-6 shadow-xl text-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No Parking Found</h3>
                            <p className="text-gray-600">We couldn't find any parking facilities near your search.</p>
                        </div>
                    )}

                </MapContainer>

                {/* Zoom Controls Overlay (Positioned properly) */}
                <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100 flex flex-col">
                        <button className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold text-xl border-b border-gray-100" onClick={() => document.querySelector('.leaflet-control-zoom-in')?.click()}>+</button>
                        <button className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 font-bold text-xl" onClick={() => document.querySelector('.leaflet-control-zoom-out')?.click()}>-</button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Home;

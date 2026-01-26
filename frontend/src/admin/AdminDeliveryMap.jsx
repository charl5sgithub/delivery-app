import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons with reliable URLs
const hubIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/isometric/512/warehouse.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

const deliveryIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/color/512/marker.png',
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

const driverIcon = new L.Icon({
    iconUrl: 'https://img.icons8.com/color/512/car--v1.png', // Clear car icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const API_URL = import.meta.env.VITE_API_URL;

// Component to handle map center updates
function MapRefresher({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

// Component to fit map to markers
function BoundsFitter({ points }) {
    const map = useMap();
    useEffect(() => {
        if (points && points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [points, map]);
    return null;
}

export default function AdminDeliveryMap() {
    const [routeData, setRouteData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [driverPos, setDriverPos] = useState(null);
    const [simulating, setSimulating] = useState(false);
    const [progress, setProgress] = useState(0);
    const location = useLocation();

    const fetchRoute = useCallback(async () => {
        try {
            const params = new URLSearchParams(location.search);
            const orderIds = params.get('orderIds');
            const url = orderIds
                ? `${API_URL}/api/delivery/route?orderIds=${orderIds}`
                : `${API_URL}/api/delivery/route`;

            const res = await fetch(url);
            const data = await res.json();
            setRouteData(data);
            if (data.hub) {
                setDriverPos([data.hub.latitude, data.hub.longitude]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Error fetching route:", error);
            setLoading(false);
        }
    }, [location.search]);

    useEffect(() => {
        fetchRoute();
    }, [fetchRoute]);

    // Simulation logic
    useEffect(() => {
        let interval;
        if (simulating && routeData?.route.length > 0) {
            interval = setInterval(() => {
                setProgress(prev => {
                    const next = prev + 1;
                    if (next >= 100) {
                        setSimulating(false);
                        return 100;
                    }
                    // Update driver position along the route
                    updateDriverVisualPosition(next);
                    return next;
                });
            }, 500);
        }
        return () => clearInterval(interval);
    }, [simulating, routeData]);

    const updateDriverVisualPosition = (percent) => {
        if (!routeData) return;
        const totalPoints = routeData.route.length;
        const stopIndex = Math.floor((percent / 100) * totalPoints);
        if (stopIndex < totalPoints) {
            const stop = routeData.route[stopIndex];
            setDriverPos([stop.addresses.latitude, stop.addresses.longitude]);
        }
    };

    const toggleSimulation = () => {
        if (!simulating) setProgress(0);
        setSimulating(!simulating);
    };

    if (loading) return <div className="admin-page">Loading Map...</div>;

    if (routeData?.error) {
        return (
            <div className="admin-page">
                <div className="empty-cart" style={{ color: '#ef4444' }}>
                    <h3>Database Schema Error</h3>
                    <p>{routeData.error}</p>
                    <p>Please ensure you have run the SQL script to add latitude/longitude columns to your addresses table.</p>
                    <button className="cta-button" onClick={fetchRoute}>Retry</button>
                </div>
            </div>
        );
    }

    const polyline = (routeData?.route && routeData?.hub) ? [
        [routeData.hub.latitude, routeData.hub.longitude],
        ...routeData.route.map(r => [r.addresses?.latitude, r.addresses?.longitude]).filter(p => p[0] && p[1])
    ] : [];

    const isBatchMode = new URLSearchParams(location.search).has('orderIds');

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div>
                    <h2>{isBatchMode ? 'Custom Delivery Batch' : 'Overall Delivery Tracking'}</h2>
                    {isBatchMode && <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Optimizing route for {routeData?.stats?.stopCount} selected orders</p>}
                </div>
                <div className="admin-actions">
                    {isBatchMode && (
                        <button className="btn-secondary" onClick={() => navigate('/admin/delivery')}>View All Orders</button>
                    )}
                    <button className="btn-secondary" onClick={fetchRoute}>Recalculate Route</button>
                    <button
                        className={`cta-button ${simulating ? 'active' : ''}`}
                        onClick={toggleSimulation}
                        style={{ marginTop: 0, width: 'auto' }}
                    >
                        {simulating ? 'Stop Simulation' : 'Start Delivery Simulation'}
                    </button>
                </div>
            </div>

            <div className="delivery-dashboard">
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">Total Distance</span>
                        <span className="stat-value">{routeData?.stats?.totalDistance} km</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Estimated Time</span>
                        <span className="stat-value">{routeData?.stats?.estimatedTime} mins</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Stops Remaining</span>
                        <span className="stat-value">{routeData?.stats?.stopCount}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Current Area</span>
                        <span className="stat-value">Edinburgh / Glasgow</span>
                    </div>
                </div>

                <div className="map-container-wrapper">
                    <MapContainer
                        center={[55.9533, -3.5]}
                        zoom={9}
                        style={{ height: '600px', width: '100%', borderRadius: '12px' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        <BoundsFitter points={polyline} />
                        <MapRefresher center={driverPos} />

                        {/* Hub Marker */}
                        {routeData?.hub && (
                            <Marker position={[routeData.hub.latitude, routeData.hub.longitude]} icon={hubIcon}>
                                <Popup>Distribution Hub (Edinburgh Warehouse)</Popup>
                            </Marker>
                        )}

                        {/* Delivery Stops */}
                        {routeData?.route.map((stop, idx) => (
                            <Marker
                                key={stop.order_id}
                                position={[stop.addresses.latitude, stop.addresses.longitude]}
                                icon={deliveryIcon}
                            >
                                <Popup>
                                    <strong>Stop #{idx + 1}</strong><br />
                                    Order: #{stop.order_id}<br />
                                    Customer: {stop.customers?.name}<br />
                                    Address: {stop.addresses?.address_line1}
                                </Popup>
                            </Marker>
                        ))}

                        {/* Driver Marker */}
                        {driverPos && (
                            <Marker position={driverPos} icon={driverIcon} zIndexOffset={1000}>
                                <Popup>Driver Current Location</Popup>
                            </Marker>
                        )}

                        {/* Route Line */}
                        <Polyline positions={polyline} color="blue" weight={3} opacity={0.6} dashArray="10, 10" />

                        <MapRefresher center={driverPos} />
                    </MapContainer>
                </div>

                <div className="route-list-container">
                    <h3>Optimal Sequence</h3>
                    <div className="route-steps">
                        {routeData?.route.map((stop, idx) => (
                            <div className={`route-step ${progress > (idx / routeData.route.length) * 100 ? 'completed' : ''}`} key={stop.order_id}>
                                <div className="step-number">{idx + 1}</div>
                                <div className="step-info">
                                    <div className="step-title">{stop.addresses?.address_line1}</div>
                                    <div className="step-subtitle">{stop.customers?.name} • Order #{stop.order_id}</div>
                                </div>
                                <div className="step-status">
                                    {progress > (idx / routeData.route.length) * 100 ? '✅' : '⏳'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

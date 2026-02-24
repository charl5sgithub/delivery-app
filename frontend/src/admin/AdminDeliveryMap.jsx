import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmationDialog from '../components/ConfirmationDialog';
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
    const navigate = useNavigate();

    // Modal State
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [dialogConfig, setDialogConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: () => { } });

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

    const handleDeleteStep = (e, orderId) => {
        e.stopPropagation();

        setDialogConfig({
            isOpen: true,
            title: "Remove Order",
            message: "Are you sure you want to remove this order from the route?",
            isAlert: false,
            onConfirm: () => {
                setDialogConfig(prev => ({ ...prev, isOpen: false }));

                // Calculate new list of IDs
                const currentIds = routeData.route.map(r => r.order_id);
                const newIds = currentIds.filter(id => id !== orderId);

                if (newIds.length === 0) {
                    // Show error dialog after a short delay to allow the first dialog to close smoothly ?? 
                    // Or just update the config. React state updates are batched so setting it again works.
                    setTimeout(() => {
                        setDialogConfig({
                            isOpen: true,
                            title: "Cannot Remove",
                            message: "Cannot remove the last order. The route must have at least one stop.",
                            isAlert: true,
                            onConfirm: () => setDialogConfig(prev => ({ ...prev, isOpen: false }))
                        });
                    }, 100);
                    return;
                }

                navigate(`/admin/delivery?orderIds=${newIds.join(',')}`);
            }
        });
    };

    const handleStepClick = async (orderId) => {
        setModalOpen(true);
        setDetailsLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}`);
            const data = await res.json();
            setSelectedOrder(data);
            setDetailsLoading(false);
        } catch (error) {
            console.error("Error fetching details:", error);
            setDetailsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await fetch(`${API_URL}/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            // If order is being marked as DELIVERED or COMPLETED, remove it from the route
            if (newStatus === 'DELIVERED' || newStatus === 'COMPLETED') {
                // Close the modal
                setModalOpen(false);
                setSelectedOrder(null);

                // Check if we're in batch mode (specific orderIds in URL)
                const params = new URLSearchParams(location.search);
                const currentOrderIds = params.get('orderIds');

                if (currentOrderIds) {
                    // Batch mode: Remove the delivered order from the URL
                    const remainingIds = currentOrderIds.split(',').filter(id => String(id) !== String(orderId));

                    if (remainingIds.length === 0) {
                        // No more orders in batch, go to view-all
                        navigate('/admin/delivery');
                    } else {
                        // Update URL with remaining order IDs
                        navigate(`/admin/delivery?orderIds=${remainingIds.join(',')}`);
                    }
                } else {
                    // Default mode: Just refresh route (delivered orders auto-excluded by backend)
                    fetchRoute();
                }
            } else {
                // Status change that keeps order in route (e.g., PAID → DELIVERING)
                setSelectedOrder(prev => ({ ...prev, order_status: newStatus }));
                fetchRoute();
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedOrder(null);
    };

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
                    <style>{`
                        .cod-switch-container {
                            display: flex;
                            align-items: center;
                            padding: 4px 8px;
                            background: #fffbeb;
                            border-radius: 6px;
                            border: 1px solid #fde68a;
                        }
                        .cod-switch { 
                            position: relative; 
                            display: inline-block; 
                            width: 32px; 
                            height: 18px; 
                        }
                        .cod-switch input { opacity: 0; width: 0; height: 0; }
                        .cod-slider {
                            position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                            backgroundColor: #cbd5e1; transition: .4s; border-radius: 34px;
                        }
                        .cod-knob {
                            position: absolute; content: ""; height: 14px; width: 14px;
                            left: 2px; bottom: 2px; background-color: white; transition: .4s; border-radius: 50%;
                        }
                        .cod-switch input:checked + .cod-slider { background-color: #10b981; }
                        .cod-switch input:checked + .cod-slider + .cod-knob { transform: translateX(14px); }
                        
                        .route-step.pending-cod-item {
                            border-left-color: #f59e0b;
                        }
                        .route-step.pending-cod-item .step-number {
                            background-color: #f59e0b;
                        }
                    `}</style>
                    <h3>Optimal Sequence</h3>
                    <div className="route-steps">
                        {routeData?.route.map((stop, idx) => (
                            <div
                                className={`route-step ${progress > (idx / routeData.route.length) * 100 ? 'completed' : ''} ${stop.order_status === 'PENDING' ? 'pending-cod-item' : ''}`}
                                key={stop.order_id}
                                onClick={() => handleStepClick(stop.order_id)}
                                style={{ cursor: 'pointer', position: 'relative' }}
                            >
                                <div className="step-number" style={{ flexShrink: 0 }}>{idx + 1}</div>
                                <div className="step-info" style={{ minWidth: 0 }}>
                                    <div className="step-title" style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}>{stop.addresses?.address_line1}</div>
                                    <div className="step-subtitle">{stop.customers?.name} • Order #{stop.order_id}</div>
                                </div>
                                <div className="step-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', flexShrink: 0 }}>
                                    {/* COD Switch or Paid Badge */}
                                    {stop.order_status === 'PENDING' ? (
                                        <div
                                            className="cod-switch-container"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Mark COD as Paid"
                                        >
                                            <span style={{ fontSize: '0.65rem', marginRight: '6px', fontWeight: 'bold', color: '#b45309', textTransform: 'uppercase' }}>COD</span>
                                            <label className="cod-switch">
                                                <input
                                                    type="checkbox"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setDialogConfig({
                                                            isOpen: true,
                                                            title: "Confirm Payment",
                                                            message: `Confirm collection of payment for Order #${stop.order_id}?`,
                                                            isAlert: false,
                                                            onConfirm: () => {
                                                                handleUpdateStatus(stop.order_id, 'PAID');
                                                                setDialogConfig(prev => ({ ...prev, isOpen: false }));
                                                            }
                                                        });
                                                    }}
                                                />
                                                <span className="cod-slider"></span>
                                                <span className="cod-knob"></span>
                                            </label>
                                        </div>
                                    ) : (
                                        <div style={{
                                            backgroundColor: '#dcfce7',
                                            color: '#166534',
                                            padding: '2px 8px',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}>
                                            Paid
                                        </div>
                                    )}

                                    <div className="step-status">
                                        {progress > (idx / routeData.route.length) * 100 ? '✅' : '⏳'}
                                    </div>
                                    <button
                                        className="delete-step-btn"
                                        onClick={(e) => handleDeleteStep(e, stop.order_id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            fontSize: '1.1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Remove from route"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Order Details Modal */}
            <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} onClick={(e) => { if (e.target.className.includes('modal-overlay')) closeModal(); }}>
                <div className="modal-content">
                    <button className="close-modal" onClick={closeModal}>×</button>

                    {detailsLoading ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading Details...</div>
                    ) : !selectedOrder ? (
                        <div style={{ textAlign: 'center', padding: '2rem' }}>Select an order to view details.</div>
                    ) : selectedOrder.error ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
                            Error loading details: {selectedOrder.error}
                        </div>
                    ) : (
                        <>
                            <div className="modal-header">
                                <h3>Order #{selectedOrder.order_id}</h3>
                                <p>Placed on {new Date(selectedOrder.created_at).toLocaleString()}</p>
                            </div>

                            <div className="detail-section">
                                <h4>Customer Details</h4>
                                <div className="detail-row">
                                    <span className="detail-label">Name</span>
                                    <span className="detail-value">{selectedOrder.customers?.name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Email</span>
                                    <span className="detail-value">{selectedOrder.customers?.email}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Phone</span>
                                    <span className="detail-value">{selectedOrder.customers?.phone}</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Delivery Address</h4>
                                <div style={{ color: '#1f2937', fontWeight: 500 }}>
                                    {selectedOrder.addresses?.address_line1}<br />
                                    {selectedOrder.addresses?.city}, {selectedOrder.addresses?.country}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Items Ordered</h4>
                                <div className="items-list">
                                    {selectedOrder.order_items?.map((item, idx) => (
                                        <div className="item-row" key={idx}>
                                            <div className="item-name" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {item.items?.image && (
                                                    <img src={item.items.image} alt={item.items.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                )}
                                                <div>
                                                    {item.items?.name || 'Unknown Item'}
                                                    <span>Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="item-price">
                                                £{item.price * item.quantity}
                                            </div>
                                        </div>
                                    ))}
                                    <div className="item-row" style={{ borderTop: '2px solid #e5e7eb', marginTop: '0.5rem', paddingTop: '0.5rem', fontWeight: 700 }}>
                                        <span>Total Amount</span>
                                        <span>£{selectedOrder.total_amount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Payment Status</h4>
                                <div className="detail-row">
                                    <span className="detail-label">Status</span>
                                    <span className={`status-badge status-${selectedOrder.order_status?.toLowerCase()}`}>
                                        {selectedOrder.order_status}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section" style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1.5rem' }}>
                                <h4>Update Status</h4>
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                    {(selectedOrder.order_status === 'PAID' || selectedOrder.order_status === 'PENDING') && (
                                        <button
                                            className="cta-button"
                                            style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto', backgroundColor: '#3b82f6' }}
                                            onClick={() => handleUpdateStatus(selectedOrder.order_id, 'DELIVERING')}
                                        >
                                            🚚 Mark as Delivering
                                        </button>
                                    )}
                                    {selectedOrder.order_status === 'DELIVERING' && (
                                        <button
                                            className="cta-button"
                                            style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto', backgroundColor: '#f59e0b' }}
                                            onClick={() => handleUpdateStatus(selectedOrder.order_id, 'DELIVERED')}
                                        >
                                            📦 Mark as Delivered
                                        </button>
                                    )}
                                    {(selectedOrder.order_status === 'DELIVERING' || selectedOrder.order_status === 'DELIVERED') && (
                                        <button
                                            className="cta-button"
                                            style={{ marginTop: 0, padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto', backgroundColor: '#10b981' }}
                                            onClick={() => handleUpdateStatus(selectedOrder.order_id, 'COMPLETED')}
                                        >
                                            ✅ Mark as Completed
                                        </button>
                                    )}
                                    {selectedOrder.order_status === 'COMPLETED' && (
                                        <div style={{ padding: '0.5rem 1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontWeight: 600 }}>
                                            ✅ This order has been completed
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ConfirmationDialog
                isOpen={dialogConfig.isOpen}
                title={dialogConfig.title}
                message={dialogConfig.message}
                onConfirm={dialogConfig.onConfirm}
                onCancel={() => setDialogConfig(prev => ({ ...prev, isOpen: false }))}
                isAlert={dialogConfig.isAlert}
                confirmText={dialogConfig.isAlert ? "OK" : "Confirm"}
            />
        </div >
    );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PersonalInfoForm from '../components/profile/PersonalInfoForm';
import AddressList from '../components/profile/AddressList';
import AddressForm from '../components/profile/AddressForm';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export default function ProfilePage({ onAddToCart }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [addresses, setAddresses] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchAddresses();
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        setOrdersLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get(`${API_URL}/api/orders/mine`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(res.data);
        } catch (err) {
            console.error('Fetch Orders Error:', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const res = await axios.get(`${API_URL}/api/address`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAddresses(res.data);
        } catch (err) {
            console.error('Fetch Addresses Error:', err);
        }
    };

    const handleAddressSubmit = async (data) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            if (editingAddress) {
                await axios.put(`${API_URL}/api/address/${editingAddress.address_id}`, data, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                await axios.post(`${API_URL}/api/address`, data, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
            setIsAddressFormOpen(false);
            setEditingAddress(null);
            fetchAddresses();
        } catch (err) {
            console.error('Save Address Error:', err);
            alert(err.response?.data?.error || 'Failed to save address');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;
        try {
            const token = localStorage.getItem('auth_token');
            await axios.delete(`${API_URL}/api/address/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAddresses();
        } catch (err) {
            console.error('Delete Address Error:', err);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const token = localStorage.getItem('auth_token');
            await axios.patch(`${API_URL}/api/address/${id}/default`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            fetchAddresses();
        } catch (err) {
            console.error('Set Default Error:', err);
        }
    };

    const handleRepeatOrder = (order) => {
        if (!order.order_items || order.order_items.length === 0) return;
        
        order.order_items.forEach(oi => {
            if (oi.items) {
                // Construct item object expected by handleAddToCart
                const itemToAdd = {
                    id: oi.items.id || oi.item_id,
                    name: oi.items.name,
                    price: oi.items.price,
                    image: oi.items.image,
                };
                onAddToCart(itemToAdd);
            }
        });

        // Optional: show a small toast or redirect to cart
        alert('Items from previous order added to cart!');
        navigate('/cart');
    };

    return (
        <div className="profile-page-container">
            <button className="back-nav-btn" onClick={() => navigate('/')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Store
            </button>

            <header className="profile-header">
                <h2>Account Settings</h2>
                <p>Manage your identity and delivery preferences</p>
            </header>

            <div className="profile-content-layout">
                <PersonalInfoForm 
                    userEmail={user?.email} 
                    onSuccess={() => {}} 
                />

                <div className="profile-section-card">
                    <div className="section-header-row">
                        <h3 className="section-title">Delivery Addresses</h3>
                        {!isAddressFormOpen && (
                            <button 
                                className="btn-primary" 
                                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                                onClick={() => { setEditingAddress(null); setIsAddressFormOpen(true); }}
                            >
                                + Add New Address
                            </button>
                        )}
                    </div>

                    {isAddressFormOpen && (
                        <AddressForm 
                            initialData={editingAddress}
                            onSubmit={handleAddressSubmit}
                            onCancel={() => { setIsAddressFormOpen(false); setEditingAddress(null); }}
                            loading={loading}
                        />
                    )}

                    <AddressList 
                        addresses={addresses} 
                        onEdit={(addr) => { setEditingAddress(addr); setIsAddressFormOpen(true); }}
                        onDelete={handleDeleteAddress}
                        onSetDefault={handleSetDefault}
                    />
                </div>

                <div className="profile-section-card">
                    <h3 className="section-title">Previous Orders</h3>
                    {ordersLoading ? (
                        <div className="orders-loading">Loading your order history...</div>
                    ) : orders.length === 0 ? (
                        <div className="no-orders">
                            <p>You haven't placed any orders yet.</p>
                            <button className="btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
                        </div>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.order_id} className="order-history-card">
                                    <div className="order-main-info">
                                        <div className="order-meta">
                                            <span className="order-number">Order #{order.order_id.toString().slice(-6)}</span>
                                            <span className="order-date">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="order-status-badge" data-status={order.order_status}>
                                            {order.order_status}
                                        </div>
                                    </div>
                                    
                                    <div className="order-items-preview">
                                        {order.order_items?.map((oi, idx) => (
                                            <span key={idx} className="item-mini-tag">
                                                {oi.items?.name} x{oi.quantity}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="order-footer">
                                        <div className="order-total">
                                            Total: <strong>£{order.total_amount}</strong>
                                        </div>
                                        <button 
                                            className="btn-repeat"
                                            onClick={() => handleRepeatOrder(order)}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="23 4 23 10 17 10" />
                                                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                                            </svg>
                                            Repeat Order
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .profile-page-container {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 60px 24px;
                    font-family: 'Inter', sans-serif;
                    background: #f7f3e9;
                    min-height: 100vh;
                }
                .back-nav-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: none;
                    border: none;
                    color: #6F8E52;
                    font-weight: 700;
                    cursor: pointer;
                    margin-bottom: 24px;
                    padding: 8px 0;
                    font-size: 1rem;
                    transition: all 0.2s ease;
                }
                .back-nav-btn:hover {
                    color: #5a7442;
                    transform: translateX(-4px);
                }
                .profile-header {
                    margin-bottom: 48px;
                    text-align: left;
                    border-left: 5px solid #6F8E52;
                    padding-left: 20px;
                }
                .profile-header h2 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #4b4a45;
                    margin-bottom: 8px;
                    letter-spacing: -1px;
                }
                .profile-header p {
                    color: #8a867a;
                    font-size: 1.1rem;
                }
                .profile-content-layout {
                    display: grid;
                    gap: 32px;
                }
                .profile-section-card {
                    background: #e9e4d1;
                    border: none;
                    border-radius: 20px;
                    padding: 32px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
                }
                .section-title {
                    font-size: 1.5rem;
                    color: #4b4a45;
                    margin-top: 0;
                    margin-bottom: 24px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }
                .section-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                .form-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                }
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .form-group.full-width {
                    grid-column: span 2;
                }
                .form-group label {
                    font-size: 0.9rem;
                    color: #8a867a;
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                .form-group input, .form-group select {
                    background: #fdfcf0;
                    border: 1px solid rgba(0,0,0,0.05);
                    border-radius: 12px;
                    padding: 12px 16px;
                    color: #4b4a45;
                    font-size: 1rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .form-group input:focus {
                    border-color: #6F8E52;
                }
                .input-readonly {
                    background: rgba(255, 255, 255, 0.05) !important;
                    color: #6b7280 !important;
                }
                .checkbox-group {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                }
                .checkbox-group label {
                    color: #4b4a45;
                    font-weight: 600;
                    margin: 0;
                }
                .btn-primary {
                    background: #6F8E52;
                    color: #fff;
                    border: none;
                    border-radius: 12px;
                    padding: 14px 28px;
                    font-weight: 700;
                    font-size: 0.95rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 6px rgba(111, 142, 82, 0.2);
                }
                .btn-primary:hover {
                    background: #5a7442;
                    transform: translateY(-2px);
                }
                .btn-outline {
                    background: transparent;
                    border: 1.5px solid #6F8E52;
                    color: #6F8E52;
                    border-radius: 10px;
                    padding: 10px 20px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .btn-secondary {
                    background: #fdfcf0;
                    color: #4b4a45;
                    border: 1px solid rgba(0,0,0,0.05);
                    border-radius: 12px;
                    padding: 14px 28px;
                    font-weight: 700;
                    cursor: pointer;
                }
                .address-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }
                .address-card {
                    background: #fdfcf0;
                    border: 1px solid rgba(0,0,0,0.05);
                    border-radius: 16px;
                    padding: 24px;
                    position: relative;
                    transition: transform 0.2s;
                }
                .address-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 30px rgba(0,0,0,0.05);
                }
                .address-card.default {
                    border-color: #6F8E52;
                    background: #f1f8eb;
                }
                .default-badge {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: #6F8E52;
                    color: #fff;
                    font-size: 0.7rem;
                    font-weight: 800;
                    padding: 4px 10px;
                    border-radius: 6px;
                    letter-spacing: 0.5px;
                }
                .address-content h4 {
                    margin: 0 0 8px;
                    color: #fff;
                }
                .address-content p {
                    margin: 0;
                    color: #9ca3af;
                    font-size: 0.9rem;
                }
                .slot-info {
                    margin-top: 12px !important;
                    color: #6F8E52 !important;
                    font-weight: 500;
                }
                .address-actions {
                    margin-top: 16px;
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }
                .btn-text {
                    background: none;
                    border: none;
                    color: #6F8E52;
                    padding: 0;
                    cursor: pointer;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                .btn-icon {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 6px;
                    padding: 4px 8px;
                    cursor: pointer;
                }
                .btn-icon.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: #ef4444;
                }
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    backdrop-filter: blur(4px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                }
                .modal-content {
                    background: #f7f3e9;
                    border-radius: 24px;
                    padding: 40px;
                    width: 90%;
                    max-width: 500px;
                    border: none;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.2);
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
                }

                /* ── Order History Styles ── */
                .orders-list {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                .order-history-card {
                    background: #fdfcf0;
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(0,0,0,0.05);
                }
                .order-main-info {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                .order-meta {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .order-number {
                    font-weight: 800;
                    color: #2E4236;
                    font-size: 1rem;
                }
                .order-date {
                    font-size: 0.85rem;
                    color: #8a867a;
                }
                .order-status-badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                .order-status-badge[data-status="PAID"],
                .order-status-badge[data-status="DELIVERED"] {
                    background: #e1fbd1;
                    color: #438e1a;
                }
                .order-status-badge[data-status="PENDING"] {
                    background: #fef3c7;
                    color: #92400e;
                }
                .order-items-preview {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 16px;
                    padding-bottom: 16px;
                    border-bottom: 1px dashed rgba(0,0,0,0.1);
                }
                .item-mini-tag {
                    background: #f1f8eb;
                    color: #6F8E52;
                    font-size: 0.8rem;
                    font-weight: 600;
                    padding: 2px 8px;
                    border-radius: 4px;
                }
                .order-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .order-total {
                    color: #4b4a45;
                    font-size: 0.95rem;
                }
                .order-total strong {
                    font-size: 1.1rem;
                    color: #2E4236;
                }
                .btn-repeat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: #6F8E52;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 8px 16px;
                    font-size: 0.85rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .btn-repeat:hover {
                    background: #5a7442;
                    transform: scale(1.05);
                }
                .no-orders {
                    text-align: center;
                    padding: 40px 0;
                    color: #8a867a;
                }
                .orders-loading {
                    text-align: center;
                    padding: 20px 0;
                    color: #6F8E52;
                    font-style: italic;
                }

                @media (max-width: 640px) {
                    .form-grid { grid-template-columns: 1fr; }
                    .form-group.full-width { grid-column: span 1; }
                    .profile-section-card { padding: 20px; }
                }
            `}</style>
        </div>
    );
}

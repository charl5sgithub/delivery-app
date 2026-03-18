import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PersonalInfoForm from '../components/profile/PersonalInfoForm';
import AddressList from '../components/profile/AddressList';
import AddressForm from '../components/profile/AddressForm';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export default function ProfilePage() {
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) fetchAddresses();
    }, [user]);

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

    return (
        <div className="profile-page-container">
            <header className="profile-header">
                <h2>My Profile</h2>
                <p>Manage your personal information and delivery addresses</p>
            </header>

            <div className="profile-content-layout">
                <PersonalInfoForm 
                    userEmail={user?.email} 
                    onSuccess={() => {}} 
                />

                <div className="profile-section-card">
                    <div className="section-header-row">
                        <h3 className="section-title">Delivery Addresses</h3>
                        <button 
                            className="btn-outline" 
                            onClick={() => { setEditingAddress(null); setIsAddressFormOpen(true); }}
                        >
                            + Add New
                        </button>
                    </div>

                    <AddressList 
                        addresses={addresses} 
                        onEdit={(addr) => { setEditingAddress(addr); setIsAddressFormOpen(true); }}
                        onDelete={handleDeleteAddress}
                        onSetDefault={handleSetDefault}
                    />
                </div>
            </div>

            {isAddressFormOpen && (
                <AddressForm 
                    initialData={editingAddress}
                    onSubmit={handleAddressSubmit}
                    onCancel={() => setIsAddressFormOpen(false)}
                    loading={loading}
                />
            )}

            <style>{`
                .profile-page-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    font-family: 'Inter', sans-serif;
                }
                .profile-header {
                    margin-bottom: 32px;
                    text-align: center;
                }
                .profile-header h2 {
                    font-size: 2rem;
                    color: #fff;
                    margin-bottom: 8px;
                }
                .profile-header p {
                    color: #9ca3af;
                }
                .profile-content-layout {
                    display: grid;
                    gap: 32px;
                }
                .profile-section-card {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    padding: 24px;
                }
                .section-title {
                    font-size: 1.25rem;
                    color: #fff;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                .section-header-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
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
                    font-size: 0.875rem;
                    color: #9ca3af;
                    font-weight: 500;
                }
                .form-group input, .form-group select {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    padding: 10px 14px;
                    color: #fff;
                    font-size: 1rem;
                    outline: none;
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
                    color: #fff;
                    margin: 0;
                }
                .btn-primary {
                    background: #6F8E52;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 24px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 20px;
                    width: fit-content;
                }
                .btn-outline {
                    background: transparent;
                    border: 1px solid #6F8E52;
                    color: #6F8E52;
                    border-radius: 8px;
                    padding: 8px 16px;
                    font-weight: 500;
                    cursor: pointer;
                }
                .btn-secondary {
                    background: #374151;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 20px;
                    cursor: pointer;
                }
                .address-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }
                .address-card {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 20px;
                    position: relative;
                }
                .address-card.default {
                    border-color: #6F8E52;
                    background: rgba(111, 142, 82, 0.05);
                }
                .default-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: #6F8E52;
                    color: #fff;
                    font-size: 0.65rem;
                    font-weight: 800;
                    padding: 2px 8px;
                    border-radius: 4px;
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
                    background: #1f2937;
                    border-radius: 16px;
                    padding: 32px;
                    width: 100%;
                    max-width: 450px;
                    border: 1px solid rgba(255,255,255,0.1);
                }
                .modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 12px;
                    margin-top: 24px;
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

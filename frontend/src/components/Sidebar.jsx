import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ onLogout }) {
    const navigate = useNavigate();

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>Admin Panel</h3>
            </div>
            <ul className="sidebar-menu">
                <li onClick={() => navigate('/admin/orders')}>Orders</li>
                <li onClick={() => navigate('/admin/customers')}>Customers</li>
                <li onClick={() => navigate('/admin/delivery')}>Delivery Tracking</li>
                <li onClick={() => navigate('/')}>Store Front</li>
                <li onClick={onLogout} className="logout-item">Logout</li>
            </ul>
        </div>
    );
}

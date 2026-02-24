import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>Admin Panel</h3>
            </div>
            <ul className="sidebar-menu">
                <li
                    className={isActive('/admin/orders') ? 'active' : ''}
                    onClick={() => navigate('/admin/orders')}
                >
                    Orders
                </li>
                <li
                    className={isActive('/admin/products') ? 'active' : ''}
                    onClick={() => navigate('/admin/products')}
                >
                    Products
                </li>
                <li
                    className={isActive('/admin/customers') ? 'active' : ''}
                    onClick={() => navigate('/admin/customers')}
                >
                    Customers
                </li>
                <li
                    className={isActive('/admin/delivery') ? 'active' : ''}
                    onClick={() => navigate('/admin/delivery')}
                >
                    Delivery Tracking
                </li>
                <li onClick={() => navigate('/')}>Store Front</li>
                <li onClick={onLogout} className="logout-item">Logout</li>
            </ul>
        </div>
    );
}

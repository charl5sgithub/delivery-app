import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ user }) {
    const { userRole, logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    const roleColour = {
        SuperUser: '#7c3aed',
        Admin: '#0284c7',
        User: '#6b7280'
    }[userRole] ?? '#6b7280';

    return (
        <div className="admin-layout">
            <Sidebar onLogout={handleLogout} />
            <div className="admin-content">
                <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Welcome, {user?.name || user?.email}</h2>
                    <span style={{
                        padding: '4px 14px',
                        borderRadius: '99px',
                        background: roleColour,
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        letterSpacing: '0.05em'
                    }}>
                        {userRole ?? 'Admin'}
                    </span>
                </header>
                <Outlet />
            </div>
        </div>
    );
}

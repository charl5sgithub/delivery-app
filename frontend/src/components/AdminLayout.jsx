import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";

// For demo purposes, we treat everyone as authorized or check email
// const isAdmin = user.email === "admin@example.com";

export default function AdminLayout({ user }) {
    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = "/";
    };

    return (
        <div className="admin-layout">
            <Sidebar onLogout={handleLogout} />
            <div className="admin-content">
                <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
                    <h2>Welcome, {user?.displayName} (Admin)</h2>
                </header>
                <Outlet />
            </div>
        </div>
    );
}

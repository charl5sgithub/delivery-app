/**
 * ProtectedAdminRoute
 *
 * Wraps any route that requires SuperUser or Admin access.
 * If the user does not have a qualifying role they see an
 * "Access Denied" page instead of the requested content.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedAdminRoute({ children }) {
    const { isAdmin, authLoading } = useAuth();

    if (authLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                fontSize: '1.2rem',
                color: '#6b7280'
            }}>
                Checking permissions…
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                gap: '16px',
                background: '#0f1117',
                color: '#f9fafb'
            }}>
                <span style={{ fontSize: '4rem' }}>🚫</span>
                <h1 style={{ margin: 0, fontSize: '1.8rem', color: '#ef4444' }}>Access Denied</h1>
                <p style={{ color: '#9ca3af', textAlign: 'center', maxWidth: 380 }}>
                    You don't have permission to view the Admin Panel.<br />
                    Please contact a SuperUser or Admin to request access.
                </p>
                <a href="/" style={{
                    padding: '10px 24px',
                    background: '#10b981',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600
                }}>
                    ← Back to Home
                </a>
            </div>
        );
    }

    return children;
}

/**
 * AuthContext.jsx
 *
 * JWT-based authentication context.
 * Replaces Firebase — reads a JWT from localStorage, decodes it,
 * and exposes user info + logout to the entire component tree.
 *
 * Token shape: { email, role, name, iat, exp }
 * Stored in: localStorage key "auth_token"
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

/** Decode JWT payload without verifying signature (verification happens server-side). */
function decodeJwt(token) {
    try {
        const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

/** Check if a decoded JWT payload is expired. */
function isExpired(payload) {
    if (!payload?.exp) return true;
    return Date.now() / 1000 > payload.exp;
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);        // { email, role, name }
    const [userRole, setUserRole] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            const payload = decodeJwt(token);
            if (payload && !isExpired(payload)) {
                setUser({ email: payload.email, name: payload.name, role: payload.role });
                setUserRole(payload.role || 'User');
            } else {
                // Token expired — clear it
                localStorage.removeItem('auth_token');
            }
        }
        setAuthLoading(false);
    }, []);

    /**
     * Call after a successful OTP verification.
     * Stores the token and updates auth state immediately.
     */
    function login(token) {
        localStorage.setItem('auth_token', token);
        const payload = decodeJwt(token);
        if (payload) {
            setUser({ email: payload.email, name: payload.name, role: payload.role });
            setUserRole(payload.role || 'User');
        }
    }

    /** Clear token and reset state. */
    function logout() {
        localStorage.removeItem('auth_token');
        setUser(null);
        setUserRole(null);
    }

    const isAdmin = userRole === 'SuperUser' || userRole === 'Admin';

    return (
        <AuthContext.Provider value={{ user, userRole, isAdmin, authLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

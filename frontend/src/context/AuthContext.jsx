/**
 * AuthContext — provides the Firebase user AND their database role
 * to the entire component tree.
 *
 * Role is fetched from our backend (/api/customers/role-by-email?email=...)
 * every time the user changes.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);   // 'SuperUser' | 'Admin' | 'User' | null
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser?.email) {
                // Fetch the role stored in our DB for this Google-authenticated user
                try {
                    const res = await fetch(
                        `${API_URL}/api/customers/role-by-email?email=${encodeURIComponent(currentUser.email)}`
                    );
                    if (res.ok) {
                        const { role } = await res.json();
                        setUserRole(role || 'User');
                    } else {
                        // Unknown user (e.g. first login) → treat as User
                        setUserRole('User');
                    }
                } catch {
                    setUserRole('User');
                }
            } else {
                setUserRole(null);
            }

            setAuthLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const isAdmin = userRole === 'SuperUser' || userRole === 'Admin';

    return (
        <AuthContext.Provider value={{ user, userRole, isAdmin, authLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

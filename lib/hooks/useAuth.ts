'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { getCurrentUser, onAuthStateChange } from '@/lib/supabase/auth';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get initial session
        getCurrentUser().then((user) => {
            setUser(user);
            setLoading(false);
        });

        // Listen for auth changes
        const subscription = onAuthStateChange((user) => {
            setUser(user);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return {
        user,
        loading,
        isAuthenticated: !!user,
    };
}

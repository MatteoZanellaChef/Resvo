import { supabase } from './client';
import type { User } from '@supabase/supabase-js';

export interface AuthError {
    message: string;
    status?: number;
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string): Promise<{ user: User | null; error: AuthError | null }> {
    console.log('🔐 Attempting login with email:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        console.error('❌ Supabase Auth Error:', error);
        console.error('Error details:', {
            message: error.message,
            status: error.status,
            name: error.name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            code: (error as any).code,
        });

        return {
            user: null,
            error: {
                message: error.message,
                status: error.status,
            },
        };
    }

    return {
        user: data.user,
        error: null,
    };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();

    if (error) {
        return {
            error: {
                message: error.message,
            },
        };
    }

    return { error: null };
}

/**
 * Get the current session
 */
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error('Error getting session:', error);
        return null;
    }

    return session;
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
        console.error('Error getting user:', error);
        return null;
    }

    return user;
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
            callback(session?.user ?? null);
        }
    );

    return subscription;
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
        return {
            error: {
                message: error.message,
            },
        };
    }

    return { error: null };
}

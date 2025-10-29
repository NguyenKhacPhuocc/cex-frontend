'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

interface User {
    id: number;
    email: string;
    username: string;
    role: 'user' | 'admin';
}

interface AuthResponse {
    isAuthenticated: boolean;
    user: User | null;
}

// API function để verify token (token trong httpOnly cookie - tự động gửi)
const fetchAuthStatus = async (): Promise<AuthResponse> => {
    try {
        const response = await api.get<{ isAuthenticated: boolean; user: User }>('/api/auth/verify');
        console.log('✅ Auth verified:', response.data);
        return {
            isAuthenticated: response.data.isAuthenticated,
            user: response.data.user,
        };
    } catch (error) {
        console.log('ℹ️ Not authenticated:', error instanceof Error ? error.message : 'Unknown error');
        return { isAuthenticated: false, user: null };
    }
};

export const useAuth = () => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['auth'],
        queryFn: fetchAuthStatus,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: false,
    });

    return {
        user: data?.user || null,
        role: data?.user?.role || null,
        isLogin: data?.isAuthenticated || false,
        isLoading,
        error,
        refetch,
    };
};


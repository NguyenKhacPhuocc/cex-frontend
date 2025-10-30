'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HeaderSub from '@/components/HeaderSub';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/lib/axios';

export default function LoginPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/api/auth/login', {
                email,
                password,
            });

            // ✅ Tokens đã được set trong httpOnly cookies - KHÔNG cần localStorage!
            // Backend tự động set cookies: accessToken & refreshToken

            // Show success toast
            toast.success('Login successful!');
            // console.log('✅ Login successful:', data);

            // Refetch auth query và ĐỢI hoàn thành trước khi redirect
            await queryClient.refetchQueries({ queryKey: ['auth'] });

            // Redirect to home AFTER auth status is updated
            router.push('/');
        } catch (err: unknown) {
            console.error('❌ Login error:', err);

            // Extract error message from backend
            let errorMessage = 'Đã xảy ra lỗi khi đăng nhập';
            if (err && typeof err === 'object' && 'response' in err) {
                const error = err as { response?: { data?: { message?: string } } };
                if (error.response?.data?.message) {
                    errorMessage = error.response.data.message;
                }
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HeaderSub />
            <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-[480px]">
                    {/* Login Card */}
                    <div className="bg-[#1C1F26] rounded-2xl p-8 shadow-2xl">
                        <h1 className="text-white text-2xl font-bold mb-6">Log In</h1>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Input */}
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-[#0B0E11] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F0B90B] transition-colors"
                                    required
                                />
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full bg-[#0B0E11] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F0B90B] transition-colors pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showPassword ? (
                                            <HiOutlineEyeOff className="w-5 h-5" />
                                        ) : (
                                            <HiOutlineEye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password */}
                            <div className="flex items-center justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-[#F0B90B] text-sm hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#F0B90B] hover:bg-[#D9A908] text-black font-bold py-3.5 rounded-lg transition-colors mt-2 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Logging in...' : 'Log In'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mt-6 mb-4">
                            <div className="flex-1 h-px bg-gray-700"></div>
                            <span className="text-gray-500 text-sm">Or continue with</span>
                            <div className="flex-1 h-px bg-gray-700"></div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 bg-[#0B0E11] border border-gray-700 hover:border-gray-600 rounded-lg py-3 transition-colors"
                            >
                                <FcGoogle className=' text-[24px]' />
                                <span className="text-white text-sm font-medium">Google</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 bg-[#0B0E11] border border-gray-700 hover:border-gray-600 rounded-lg py-3 transition-colors"
                            >
                                <FaApple className='text-[24px] text-white' />
                                <span className="text-white text-sm font-medium">Apple</span>
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <div className="text-center mt-6">
                            <span className="text-gray-400 text-sm">
                                Don&apos;t have an account?{' '}
                            </span>
                            <Link
                                href="/register"
                                className="text-[#F0B90B] text-sm font-medium hover:underline"
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6 text-gray-500 text-xs">
                        By logging in, you agree to Binance&apos;s{' '}
                        <Link href="/terms" className="text-[#F0B90B] hover:underline">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-[#F0B90B] hover:underline">
                            Privacy Policy
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

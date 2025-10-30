'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HeaderSub from '@/components/HeaderSub';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp!');
            return;
        }

        if (!agreeTerms) {
            toast.error('Vui lòng đồng ý với Điều khoản dịch vụ');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/api/auth/register', {
                email,
                password,
            });

            toast.success('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
            // console.log('✅ Register successful:', response.data);

            // Redirect to login page after 1.5s
            setTimeout(() => {
                router.push('/login');
            }, 1500);
        } catch (err: unknown) {
            console.error('❌ Register error:', err);
            const error = err as { response?: { data?: { message?: string | string[] } }; message?: string };
            const errorMessage = error.response?.data?.message || error.message || 'Đã xảy ra lỗi khi đăng ký';

            // Handle validation errors (array of messages)
            if (Array.isArray(errorMessage)) {
                errorMessage.forEach((msg: string) => toast.error(msg));
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <HeaderSub />
            <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center px-4 py-8 text-[14px]">
                <div className="w-full max-w-[480px]">
                    {/* Register Card */}
                    <div className="bg-[#1C1F26] rounded-2xl p-8 shadow-2xl">
                        <h1 className="text-white text-2xl font-bold mb-6">Sign Up</h1>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Email Input */}
                            <div>
                                <label className="block text-gray-400 text-[14px] mb-2">
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
                                <label className="block text-gray-400 text-[14px] mb-2">
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
                                        minLength={8}
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
                                {/* Password Strength Indicator */}
                                <PasswordStrengthIndicator password={password} />
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-gray-400 text-[14px] mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm your password"
                                        className="w-full bg-[#0B0E11] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F0B90B] transition-colors pr-12"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                                    >
                                        {showConfirmPassword ? (
                                            <HiOutlineEyeOff className="w-5 h-5" />
                                        ) : (
                                            <HiOutlineEye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Terms & Conditions */}
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                    className="w-4 h-4 mt-0.5 rounded border-gray-700 bg-[#0B0E11] text-[#F0B90B] focus:ring-[#F0B90B] focus:ring-offset-0"
                                    required
                                />
                                <span className="text-gray-400 text-[14px]">
                                    I have read and agree to Binance&apos;s{' '}
                                    <Link href="/terms" className="text-[#F0B90B] hover:underline">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-[#F0B90B] hover:underline">
                                        Privacy Policy
                                    </Link>
                                </span>
                            </label>

                            {/* Register Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#F0B90B] hover:bg-[#D9A908] text-black font-bold py-3.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Đang đăng ký...' : 'Sign Up'}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-4 mt-6 mb-3">
                            <div className="flex-1 h-px bg-gray-700"></div>
                            <span className="text-gray-500 text-[14px]">Or sign up with</span>
                            <div className="flex-1 h-px bg-gray-700"></div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 bg-[#0B0E11] border border-gray-700 hover:border-gray-600 rounded-lg py-3 transition-colors"
                            >
                                <FcGoogle className=' text-[24px]' />
                                <span className="text-white text-[14px] font-medium">Google</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center justify-center gap-2 bg-[#0B0E11] border border-gray-700 hover:border-gray-600 rounded-lg py-3 transition-colors"
                            >
                                <FaApple className='text-[24px] text-white' />
                                <span className="text-white text-[14px] font-medium">Apple</span>
                            </button>
                        </div>

                        {/* Login Link */}
                        <div className="text-center mt-5">
                            <span className="text-gray-400 text-[14px]">
                                Already have an account?{' '}
                            </span>
                            <Link
                                href="/login"
                                className="text-[#F0B90B] text-[14px] font-medium hover:underline"
                            >
                                Log In
                            </Link>
                        </div>
                    </div>

                    {/* Footer Security Notice */}
                    <div className="bg-[#1C1F26] rounded-lg p-4 mt-4 flex items-start gap-3">
                        <svg className="w-5 h-5 text-[#F0B90B] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <div>
                            <h3 className="text-white text-[14px] font-medium mb-1">Security First</h3>
                            <p className="text-gray-400 text-[12px]">
                                Your account security is our top priority. Enable 2FA after registration for enhanced protection.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

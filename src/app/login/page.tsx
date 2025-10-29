'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import HeaderSub from '@/components/HeaderSub';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+84');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { activeTab, email, phone, password });
  };

  return (
    <>
      <HeaderSub />
      <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[480px]">
          {/* Login Card */}
          <div className="bg-[#1C1F26] rounded-2xl p-8 shadow-2xl">
            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-[#0B0E11] p-1 rounded-lg ">
              <button
                onClick={() => setActiveTab('email')}
                className={`flex-1 hover:cursor-pointer py-2.5 rounded-lg font-medium transition-all ${activeTab === 'email'
                  ? 'bg-[#F0B90B] text-black'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                Email
              </button>
              <button
                onClick={() => setActiveTab('phone')}
                className={`flex-1 hover:cursor-pointer py-2.5 rounded-lg font-medium transition-all ${activeTab === 'phone'
                  ? 'bg-[#F0B90B] text-black'
                  : 'text-gray-400 hover:text-white'
                  }`}
              >
                Phone
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email/Phone Input */}
              {activeTab === 'email' ? (
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
              ) : (
                <div>
                  <label className="block text-gray-400 text-sm mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="bg-[#0B0E11] border border-gray-700 rounded-lg px-3 py-3 text-white focus:outline-none focus:border-[#F0B90B] transition-colors"
                    >
                      <option value="+84">+84</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+86">+86</option>
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter phone number"
                      className="flex-1 bg-[#0B0E11] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#F0B90B] transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

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

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-700 bg-[#0B0E11] text-[#F0B90B] focus:ring-[#F0B90B] focus:ring-offset-0"
                  />
                  <span className="text-gray-400 text-sm">Remember me</span>
                </label>
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
                className="w-full bg-[#F0B90B] hover:bg-[#D9A908] text-black font-bold py-3.5 rounded-lg transition-colors mt-2 hover:cursor-pointer"
              >
                Log In
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

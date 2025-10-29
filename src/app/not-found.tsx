"use client"

import Link from 'next/link';
import { FaArrowLeft, FaArrowLeftLong } from 'react-icons/fa6';
import { HiOutlineEmojiSad } from 'react-icons/hi';
import { IoHomeOutline } from 'react-icons/io5';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center px-4">
      <div className="text-center">
        {/* 404 Animation */}
        <div className="mb-6">
          <h1 className="text-[160px] md:text-[200px] font-bold text-[#F0B90B] leading-none animate-pulse">
            404
          </h1>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#1C1F26] rounded-full p-6">
            <HiOutlineEmojiSad className="w-12 h-12 text-[#F0B90B]" />
          </div>
        </div>

        {/* Text */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-400 text-[14px] mb-8 max-w-md mx-auto">
          Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been moved or deleted.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="bg-[#F0B90B] hover:bg-[#D9A908] text-black font-bold px-8 py-3.5 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <IoHomeOutline className="w-5 h-5" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="bg-[#1C1F26] hover:bg-[#252830] text-white font-medium px-8 py-3.5 rounded-lg transition-colors border border-gray-700 inline-flex items-center gap-2"
          >
            <FaArrowLeftLong className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-8 pt-8 border-t border-gray-800 max-w-md mx-auto">
          <p className="text-gray-500 text-sm mb-4">Quick Links:</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/login" className="text-[#F0B90B] hover:underline">
              Login
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/register" className="text-[#F0B90B] hover:underline">
              Register
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/spot/BTCUSDT" className="text-[#F0B90B] hover:underline">
              Trading
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/terms" className="text-[#F0B90B] hover:underline">
              Terms
            </Link>
            <span className="text-gray-700">•</span>
            <Link href="/privacy" className="text-[#F0B90B] hover:underline">
              Privacy
            </Link>
          </div>
        </div>

        {/* Support */}
        <div className="mt-8">
          <p className="text-gray-500 text-sm">
            Need help?{' '}
            <a href="mailto:support@binance.com" className="text-[#F0B90B] hover:underline">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

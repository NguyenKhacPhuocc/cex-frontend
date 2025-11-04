'use client';

import Image from "next/image";
import Link from "next/link";
import { AiOutlineGlobal } from "react-icons/ai";
import { FaRegCircleUser } from "react-icons/fa6";
import { GiSpellBook } from "react-icons/gi";
import { IoIosArrowDown } from "react-icons/io";
import { IoMoonOutline, IoWalletOutline } from "react-icons/io5";
import { LuSearch } from "react-icons/lu";
import { MdOutlineChat, MdLogout } from "react-icons/md";
import { RiSettingsLine } from "react-icons/ri";
import { RxSun } from "react-icons/rx";
import { VscDesktopDownload } from "react-icons/vsc";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { useEffect, useState } from "react";
import { TbArrowBarToDown } from "react-icons/tb";

export default function Header() {
    const { user, isLogin, isLoading, refetch } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [mounted, setMounted] = useState(false);

    const handleLogout = async () => {
        try {
            // Call logout API - Backend sẽ clear httpOnly cookies
            await api.post('/api/auth/logout');

            // ✅ Cookies đã được clear bởi backend - KHÔNG cần localStorage!

            // Refresh auth state
            await refetch();

            toast.success('Đăng xuất thành công!');
            // ✅ KHÔNG redirect - User ở lại trang hiện tại
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Đăng xuất thất bại!');
        }
    };
    // console.log("isLogin: " + isLogin)

    useEffect(() => {
        setMounted(true);
        const isDark =
            document.documentElement.classList.contains("dark") ||
            localStorage.theme === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches);

        if (isDark) {
            document.documentElement.classList.add("dark");
            setDarkMode(true);
        } else {
            document.documentElement.classList.remove("dark");
            setDarkMode(false);
        }
    }, []);

    const toggleDarkMode = () => {
        // setOverlay(true);
        // setTimeout(() => {
        const html = document.documentElement;
        if (html.classList.contains("dark")) {
            html.classList.remove("dark");
            localStorage.setItem("theme", "light");
            setDarkMode(false);
        } else {
            html.classList.add("dark");
            localStorage.setItem("theme", "dark");
            setDarkMode(true);
        }
        // setOverlay(false);
        // }, 300);
    };

    if (!mounted) return null;

    return (
        <>
            <div className="h-[64px] bg-[#ffffff] dark:bg-transparent flex justify-between items-center px-[24px] text-black dark:text-[#eaecef] z-999">
                <div className="flex flex-row">
                    <Link href={'/'} className="pr-[12px] h-[64px] flex justify-center items-center">
                        <Image src="/binance-h.png" alt="" width={120} height={64} />
                    </Link>
                    <ul className="flex text-[14px] font-[500]">
                        <li className="flex justify-center items-center px-[12px] h-[64px] hover:text-[#F0B90B] hover:cursor-pointer">
                            Mua Crypto
                        </li>
                        <li className="flex justify-center items-center px-[12px] h-[64px] hover:text-[#F0B90B] hover:cursor-pointer ">
                            Thị trường
                        </li>
                        {/* thị trường */}
                        <li className="group flex justify-center items-center px-[12px] h-[64px] hover:text-[#F0B90B] hover:cursor-pointer relative">
                            Giao dịch
                            <span className="w-[6px] h-[6px] bg-[#FCD535] rounded-full absolute right-[22%] top-[30%]"></span>
                            <span className="ml-[2px] transition-transform duration-200 group-hover:rotate-180">
                                <IoIosArrowDown />
                            </span>
                            <div className="absolute top-full left-[-50%] hidden group-hover:block bg-white shadow-lg rounded-lg w-96 z-999 text-[14px] dark:bg-[#202630] dark:backdrop-blur-md">
                                <Link href="/spot/BTC_USDT" className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262e3c]">
                                    <p className=" text-gray-900 dark:text-white/90 mb-[5px]">Giao dịch Spot</p>
                                    <p className="text-[12px] text-gray-500">Mua và bán trên thị trường giao ngay với các công cụ tiên tiến.</p>
                                </Link>
                                <Link href="#" className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262e3c]">
                                    <p className=" text-gray-900 dark:text-white/90 mb-[5px]">Giao dịch P2P</p>
                                    <p className="text-[12px] text-gray-500">Mua và bán tiền điện tử trực tiếp với người dùng khác.</p>
                                </Link>
                                <Link href="#" className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262e3c]">
                                    <p className=" text-gray-900 dark:text-white/90 mb-[5px]">Bot Giao Dịch</p>
                                    <p className="text-[12px] text-gray-500">Tự động hóa chiến lược giao dịch của bạn 24/7.</p>
                                </Link>
                            </div>
                        </li>
                        {/* futures */}
                        <li className="flex justify-center items-center px-[12px] h-[64px] hover:text-[#F0B90B] hover:cursor-pointer group">
                            Futures
                            <span className="ml-[2px] transition-transform duration-200 group-hover:rotate-180">
                                <IoIosArrowDown />
                            </span>
                        </li>
                        {/* earn */}
                        <li className="flex justify-center items-center px-[12px] h-[64px] hover:text-[#F0B90B] hover:cursor-pointer group">
                            Earn
                            <span className="ml-[2px] transition-transform duration-200 group-hover:rotate-180">
                                <IoIosArrowDown />
                            </span>
                        </li>
                        {/* square */}
                        <li className="flex justify-center items-center px-[12px] h-[64px] hover:text-[#F0B90B] hover:cursor-pointer group">
                            Square
                            <span className="ml-[2px] transition-transform duration-200 group-hover:rotate-180">
                                <IoIosArrowDown />
                            </span>
                        </li>
                        {/* more */}
                        <li className="group flex justify-center items-center h-[64px] hover:text-[#F0B90B] relative hover:cursor-pointer group pl-[12px]">
                            Nhiều hơn
                            <span className="ml-[2px] transition-transform duration-200 group-hover:rotate-180">
                                <IoIosArrowDown />
                            </span>
                            <div className="absolute top-full left-[-50%] hidden group-hover:block bg-white shadow-md rounded-md  w-96 z-999 text-[14px] dark:bg-[#202630] dark:backdrop-blur-md">
                                <Link href="/terms" className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262e3c]">
                                    <p className=" text-gray-900 dark:text-white/90 mb-[5px]">Terms</p>
                                    <p className="text-[12px] text-gray-500">Xem các điều khoản và điều kiện sử dụng dịch vụ của chúng tôi.</p>
                                </Link>
                                <Link href="/privacy" className="block p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-[#262e3c]">
                                    <p className=" text-gray-900 dark:text-white/90 mb-[5px]">Privacy</p>
                                    <p className="text-[12px] text-gray-500">Tìm hiểu cách chúng tôi thu thập và bảo vệ dữ liệu cá nhân của bạn.</p>
                                </Link>
                            </div>
                        </li>
                    </ul>
                </div>
                <div className="flex  justify-center items-center text-[14px]">
                    <div className="text-[22px] hover:text-[#F0B90B] px-[8px] py-[20px] hover:cursor-pointer">
                        <LuSearch />
                    </div>

                    {/* Chưa đăng nhập: hiện buttons */}
                    {!isLogin && !isLoading && (
                        <>
                            <Link href={'/login'} className="px-[10px] my-[20px] mx-[8px] bg-[#EDEDED] hover:bg-[#F1F1F1] dark:text-black rounded-[5px] h-[32px] font-medium hover:cursor-pointer flex justify-center items-center">
                                Đăng nhập
                            </Link>
                            <Link href={'/register'} className="px-[10px] my-[20px] mr-[8px] bg-[#FCD535] hover:bg-[#FDDD5D] rounded-[5px] h-[32px] font-medium hover:cursor-pointer flex justify-center items-center dark:text-black">
                                Đăng ký
                            </Link>
                        </>
                    )}

                    {/* Đã đăng nhập: hiện icons + email */}
                    {isLogin && (
                        <>
                            <button className="mx-[6px] hover:cursor-pointer flex items-center gap-[2px] bg-[#fcd535] text-black px-[10px] h-[32px] rounded-[4px]">
                                <TbArrowBarToDown className="text-[22px]" />
                                Nạp
                            </button>

                            {/* User Icon với Dropdown */}
                            <div className="group relative flex items-center py-[20px] px-[8px] hover:text-[#F0B90B] hover:cursor-pointer">
                                <div className="flex items-center gap-[8px]">
                                    <FaRegCircleUser className="text-[22px]" />
                                </div>

                                {/* Dropdown on hover login*/}
                                <div className="absolute top-full right-0 hidden group-hover:block bg-white dark:bg-black/80 dark:backdrop-blur-md shadow-lg rounded-lg w-64 z-[999] py-2 border border-gray-200 dark:border-gray-800">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-900">
                                        <p className="text-[12px] text-gray-500 dark:text-gray-200">Email</p>
                                        <p className="text-[14px] font-medium text-gray-900 dark:text-white/90">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-100 text-red-600 transition-colors hover:cursor-pointer"
                                    >
                                        <MdLogout className="text-[18px]" />
                                        <span className="text-[14px] font-medium">Đăng xuất</span>
                                    </button>
                                </div>


                            </div>



                            {/* Wallet Icon */}
                            <div className="text-[22px] py-[20px] px-[8px] hover:text-[#F0B90B] hover:cursor-pointer">
                                <IoWalletOutline />
                            </div>

                            {/* Chat Icon */}
                            <div className="text-[22px] py-[20px] px-[8px] hover:text-[#F0B90B] hover:cursor-pointer">
                                <MdOutlineChat />
                            </div>
                        </>
                    )}

                    {/* Các icon luôn hiển thị */}
                    <div className="text-[22px] py-[20px] px-[8px] hover:text-[#F0B90B] hover:cursor-pointer">
                        <VscDesktopDownload />
                    </div>
                    <div className="text-[22px] py-[20px] px-[8px] hover:text-[#F0B90B] hover:cursor-pointer">
                        <AiOutlineGlobal />
                    </div>
                    <div className="text-[22px] py-[20px] px-[8px] hover:text-[#F0B90B] hover:cursor-pointer">
                        <GiSpellBook />
                    </div>
                    <div className="text-[22px] py-[20px] px-[8px] hover:text-[#F0B90B] hover:cursor-pointer">
                        <RiSettingsLine />
                    </div>
                    <button
                        onClick={toggleDarkMode}
                        className="text-[22px] py-[20px] pl-[8px] hover:text-[#F0B90B] hover:cursor-pointer"
                    >
                        {darkMode ? (
                            <IoMoonOutline />
                        ) : (
                            <RxSun />
                        )}
                    </button>
                </div>
            </div>
        </>
    );
}
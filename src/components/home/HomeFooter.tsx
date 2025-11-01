import Link from 'next/link';
import { FaTwitter, FaFacebook, FaTelegram, FaInstagram, FaYoutube, FaLinkedin } from 'react-icons/fa';
import { IoIosArrowDown } from 'react-icons/io';

export default function HomeFooter() {
    return (
        <footer className="bg-gray-50 dark:bg-transparent border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 text-gray-400 dark:text-gray-200">
                    <div className="col-span-2 md:col-span-4 lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">C-LABS</h2>
                        <p className="mt-4 text-gray-500 text-base">
                            Nền tảng giao dịch tiền điện tử hàng đầu thế giới.
                        </p>
                        <div className="mt-6">
                            <button className="flex items-center gap-x-2 text-gray-500 hover:text-[#F0B90B] ">
                                <span>Tiếng Việt</span>
                                <IoIosArrowDown />
                            </button>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold  tracking-wider uppercase">Về chúng tôi</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Giới thiệu</Link></li>
                            <li><Link href="#" className="text-base hover:text-[#F0B90B] ">Tuyển dụng</Link></li>
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Blog</Link></li>
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Tin tức</Link></li>
                            <li><Link href="#" className="text-base hover:text-[#F0B90B] ">Pháp lý</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold  tracking-wider uppercase">Sản phẩm</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Giao dịch Spot</Link></li>
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Giao dịch Futures</Link></li>
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Earn</Link></li>
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Launchpad</Link></li>
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Thẻ Visa</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase">Hỗ trợ</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Trung tâm hỗ trợ</Link></li>
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Phí</Link></li>
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Tài liệu API</Link></li>
                            <li><Link href="#" className="text-base  hover:text-[#F0B90B] ">Yêu cầu tính năng</Link></li>
                            <li><Link href="#" className="text-base hover:text-[#F0B90B] ">Cảnh báo lừa đảo</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold tracking-wider uppercase">Cộng đồng</h3>
                        <div className="mt-4 flex space-x-4">
                            <a href="#" className=" hover:text-[#F0B90B] "><FaTwitter className="h-6 w-6" /></a>
                            <a href="#" className=" hover:text-[#F0B90B] "><FaFacebook className="h-6 w-6" /></a>
                            <a href="#" className="hover:text-[#F0B90B] "><FaTelegram className="h-6 w-6" /></a>
                            <a href="#" className=" hover:text-[#F0B90B] "><FaInstagram className="h-6 w-6" /></a>
                            <a href="#" className=" hover:text-[#F0B90B] "><FaYoutube className="h-6 w-6" /></a>
                            <a href="#" className=" hover:text-[#F0B90B] "><FaLinkedin className="h-6 w-6" /></a>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
                    <p className="text-base text-gray-400 dark:text-white xl:text-center">&copy; {new Date().getFullYear()} C-LABS. All rights reserved.</p>
                    <p className="mt-4 text-xs text-gray-500 text-center">
                        Cảnh báo rủi ro: Giao dịch tiền điện tử có rủi ro cao. Vui lòng giao dịch một cách thận trọng. C-LABS không chịu trách nhiệm cho các khoản thua lỗ của bạn.
                    </p>
                </div>
            </div>
        </footer>
    );
}
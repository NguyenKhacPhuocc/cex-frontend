import Image from "next/image";
import Link from "next/link";
import { AiOutlineGlobal } from "react-icons/ai";
import { GiSpellBook } from "react-icons/gi";
import { IoIosArrowDown } from "react-icons/io";
import { LuSearch } from "react-icons/lu";
import { RiSettingsLine } from "react-icons/ri";
import { RxSun } from "react-icons/rx";
import { VscDesktopDownload } from "react-icons/vsc";

export default function Header() {

  return (
    <>
      <div className="h-[64px] bg-[#ffffff] flex justify-between items-center px-[24px] text-black z-999">
        <div className="flex flex-row">
          <Link href={'/'} className="pr-[12px] h-[64px] flex justify-center items-center">
            <Image src="/binance-h.png" alt="" width={120} height={64} />
          </Link>
          <ul className="flex text-[14px] font-[500] text-black">
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
              <div className="absolute top-full left-[-50%] hidden group-hover:block bg-white shadow-lg rounded-lg w-96 z-999 text-[14px]">
                <Link href="/spot/BTC_USDT" className="block p-4 rounded-lg hover:bg-gray-100">
                  <p className=" text-gray-900">Giao dịch Spot</p>
                  <p className="text-[12px] text-gray-500">Mua và bán trên thị trường giao ngay với các công cụ tiên tiến.</p>
                </Link>
                <Link href="#" className="block p-4 rounded-lg hover:bg-gray-100">
                  <p className=" text-gray-900">Giao dịch Futures</p>
                  <p className="text-[12px] text-gray-500">Giao dịch hợp đồng tương lai với đòn bẩy cao và phí thấp.</p>
                </Link>
                <Link href="#" className="block p-4 rounded-lg hover:bg-gray-100">
                  <p className=" text-gray-900">Giao dịch P2P</p>
                  <p className="text-[12px] text-gray-500">Mua và bán tiền điện tử trực tiếp với người dùng khác.</p>
                </Link>
                <Link href="#" className="block p-4 rounded-lg hover:bg-gray-100">
                  <p className=" text-gray-900">Bot Giao Dịch</p>
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
            <li className="group flex justify-center items-center h-[64px] hover:text-[#F0B90B] relative hover:cursor-pointer group">
              Nhiều hơn
              <span className="ml-[2px] transition-transform duration-200 group-hover:rotate-180">
                <IoIosArrowDown />
              </span>
              <div className="absolute top-full left-[-50%] hidden group-hover:block bg-white shadow-md rounded-md  w-96 z-999 text-[14px]">
                <Link href="/terms" className="block p-4 rounded-lg hover:bg-gray-100">
                  <p className=" text-gray-900">Terms</p>
                  <p className="text-[12px] text-gray-500">Xem các điều khoản và điều kiện sử dụng dịch vụ của chúng tôi.</p>
                </Link>
                <Link href="/privacy" className="block p-4 rounded-lg hover:bg-gray-100">
                  <p className=" text-gray-900">Privacy</p>
                  <p className="text-[12px] text-gray-500">Tìm hiểu cách chúng tôi thu thập và bảo vệ dữ liệu cá nhân của bạn.</p>
                </Link>
              </div>
            </li>
          </ul>
        </div>
        <div className="flex text-black justify-center items-center text-[14px]">
          <div className="text-[22px] hover:text-[#F0B90B] px-[8px] py-[20px]">
            <LuSearch />
          </div>
          <Link href={'/login'} className="px-[10px] my-[20px] mx-[8px] bg-[#EDEDED] hover:bg-[#F1F1F1] rounded-[5px] h-[32px] font-[500] hover:cursor-pointer  flex justify-center items-center">
            Đăng nhập
          </Link>
          <Link href={'/register'} className="px-[10px] my-[20px] mr-[8px] bg-[#FCD535] hover:bg-[#FDDD5D] rounded-[5px] h-[32px] font-[500] hover:cursor-pointer flex justify-center items-center">
            Đăng ký
          </Link>
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
          <div className="text-[22px] py-[20px] pl-[8px] hover:text-[#F0B90B] hover:cursor-pointer">
            <RxSun />
          </div>
          {/* <div className="text-[24px] py-[20px] pl-[8px]">
            <IoMoonOutline />
          </div> */}
        </div>
      </div>
    </>
  );
}
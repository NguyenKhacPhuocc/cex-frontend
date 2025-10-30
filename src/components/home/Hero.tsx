import Link from 'next/link';

export default function Hero() {
    return (
        <div className="bg-white dark:bg-transparent min-h-screen flex items-center">
          <div className="max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Nền tảng giao dịch tiền điện tử thế hệ mới
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600">
                Mua, bán và lưu trữ hàng trăm loại tiền điện tử một cách an toàn và dễ dàng. Được tin cậy bởi hàng triệu người dùng trên toàn thế giới.
              </p>
              <div className="mt-8 flex justify-center gap-x-4">
                <Link href="/register" className="inline-block bg-[#FCD535] text-black font-bold py-3 px-8 rounded-lg hover:bg-[#F0B90B] transition duration-300">
                    Bắt đầu ngay
                </Link>
                <Link href="/markets" className="inline-block bg-gray-200 text-gray-800 font-bold py-3 px-8 rounded-lg hover:bg-gray-300 transition duration-300">
                    Xem thị trường
                </Link>
              </div>
              <p className="mt-8 text-sm text-gray-500">
                Đã có tài khoản? <Link href="/login" className="font-medium text-[#F0B90B] hover:underline">Đăng nhập</Link>
              </p>
            </div>
          </div>
        </div>
    );
}
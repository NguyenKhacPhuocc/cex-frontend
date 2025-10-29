import Link from 'next/link';

const steps = [
  {
    name: 'Tạo tài khoản',
    description: 'Đăng ký tài khoản chỉ với email và mật khẩu. Hoàn tất xác minh danh tính để mở khóa toàn bộ tính năng.',
  },
  {
    name: 'Nạp tiền & Mua Crypto',
    description: 'Nạp tiền hoặc mua tiền điện tử qua nhiều phương thức thanh toán an toàn như thẻ tín dụng, chuyển khoản ngân hàng.',
  },
  {
    name: 'Bắt đầu giao dịch',
    description: 'Khám phá hàng trăm thị trường và bắt đầu giao dịch với các công cụ phân tích chuyên nghiệp của chúng tôi.',
  },
];

export default function GetStarted() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Bắt đầu chỉ trong 3 bước
          </h2>
        </div>
        <div className="mt-20">
          <div className="relative">
            <div className="grid md:grid-cols-3 gap-10">
              {steps.map((step, index) => (
                <div key={step.name} className="relative text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-[#FCD535] rounded-full text-2xl font-bold text-black">
                    {index + 1}
                  </div>
                  <div className="mt-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {step.name}
                    </h3>
                    <p className="mt-2 text-base text-gray-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-20 text-center">
          <Link href="/register" className="inline-block bg-[#FCD535] text-black font-bold py-3 px-8 rounded-lg hover:bg-[#F0B90B] transition duration-300">
            Tham gia ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
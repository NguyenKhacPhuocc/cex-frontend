import { FaShieldAlt, FaHeadset, FaRocket, FaWallet } from 'react-icons/fa';

const features = [
    {
        name: 'Bảo mật hàng đầu',
        description: 'Tài sản của bạn được bảo vệ bởi các biện pháp bảo mật tiên tiến nhất, bao gồm ví lạnh và xác thực đa yếu tố.',
        icon: FaShieldAlt,
    },
    {
        name: 'Hỗ trợ 24/7',
        description: 'Đội ngũ hỗ trợ chuyên nghiệp của chúng tôi luôn sẵn sàng giải đáp mọi thắc mắc của bạn bất cứ lúc nào.',
        icon: FaHeadset,
    },
    {
        name: 'Hiệu suất cao',
        description: 'Trải nghiệm giao dịch nhanh chóng và mượt mà với công cụ khớp lệnh hàng đầu, xử lý hàng triệu giao dịch mỗi giây.',
        icon: FaRocket,
    },
    {
        name: 'Ví đa năng',
        description: 'Quản lý tất cả tài sản kỹ thuật số của bạn một cách an toàn và tiện lợi với ví tích hợp của chúng tôi.',
        icon: FaWallet,
    },
];

export default function Features() {
    return (
        <div className="bg-white dark:bg-transparent min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-[#f0b90b]">
                        Xây dựng cho tương lai
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-[#eaecef]">
                        Chúng tôi không ngừng đổi mới để mang đến cho bạn một nền tảng mạnh mẽ, an toàn và dễ sử dụng.
                    </p>
                </div>
                <div className="mt-20">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {features.map((feature) => (
                            <div key={feature.name} className="bg-gray-50 dark:bg-black/50 dark:backdrop-blur-md p-8 rounded-lg shadow-md border border-gray-800">
                                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#FCD535] text-black mx-auto">
                                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                                </div>
                                <div className="mt-5 text-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                                        {feature.name}
                                    </h3>
                                    <p className="mt-2 text-base text-gray-600 dark:text-[#cacaca]">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
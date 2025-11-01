"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const stats = [
    { name: 'Khối lượng giao dịch 24h', value: '$5.2 Tỷ' },
    { name: 'Tiền điện tử được hỗ trợ', value: '350+' },
    { name: 'Người dùng đã đăng ký', value: '120 Triệu' },
    { name: 'Phí giao dịch thấp', value: '<0.1%' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.5,
        },
    },
};

export default function Stats() {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.1,
    });

    return (
        <div className="bg-gray-50 dark:bg-transparent min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl dark:text-[#eaecef]">
                        Hệ sinh thái giao dịch lớn nhất thế giới
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-[#cacaca]">
                        Một nền tảng đáng tin cậy với quy mô và tính thanh khoản hàng đầu.
                    </p>
                </div>
                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? 'visible' : 'hidden'}
                    className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {stats.map((stat) => (
                        <motion.div
                            key={stat.name}
                            variants={itemVariants}
                            className="text-center"
                        >
                            <p className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-[#f0b90b]">
                                {stat.value}
                            </p>
                            <p className="mt-3 text-base text-gray-500 dark:text-[#eaecef]">{stat.name}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
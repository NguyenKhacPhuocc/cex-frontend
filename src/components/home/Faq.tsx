/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowDown } from 'react-icons/io';

const faqs = [
    {
        question: 'Làm thế nào để bắt đầu?',
        answer: 'Chỉ cần tạo một tài khoản, xác minh danh tính của bạn, nạp tiền và bạn đã sẵn sàng để giao dịch.',
    },
    {
        question: 'Các phương thức thanh toán được chấp nhận là gì?',
        answer: 'Chúng tôi chấp nhận nhiều phương thức thanh toán, bao gồm chuyển khoản ngân hàng, thẻ tín dụng/thẻ ghi nợ và các loại tiền điện tử khác.',
    },
    {
        question: 'Phí giao dịch là bao nhiêu?',
        answer: 'Chúng tôi cung cấp một trong những mức phí giao dịch thấp nhất trong ngành, bắt đầu từ 0.1% cho mỗi giao dịch. Phí có thể thay đổi tùy thuộc vào cấp độ VIP của bạn.',
    },
    {
        question: 'Tài sản của tôi có an toàn không?',
        answer: 'Bảo mật là ưu tiên hàng đầu của chúng tôi. Chúng tôi sử dụng các biện pháp bảo mật hàng đầu trong ngành để bảo vệ tài sản của bạn, bao gồm lưu trữ lạnh, xác thực hai yếu tố và giám sát an ninh 24/7.',
    },
    {
        question: 'Làm thế nào để liên hệ hỗ trợ?',
        answer: 'Bạn có thể liên hệ với đội ngũ hỗ trợ của chúng tôi 24/7 qua live chat trên trang web hoặc ứng dụng di động, hoặc gửi email cho chúng tôi tại support@example.com.',
    },
    {
        question: 'Tôi có thể giao dịch những loại tiền điện tử nào?',
        answer: 'Chúng tôi hỗ trợ hàng trăm loại tiền điện tử, bao gồm Bitcoin (BTC), Ethereum (ETH), và nhiều altcoin phổ biến khác. Danh sách này được cập nhật liên tục.',
    },
];

const FaqItem = ({ faq }: any) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-200 min-w-[800px] ">
            <button
                className="flex justify-between items-center w-full text-lg font-medium text-left text-gray-900 hover:text-[#FCD535] py-6 "
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{faq.question}</span>
                <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <IoIosArrowDown />
                </motion.span>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="mb-4 text-gray-600"
                    >
                        {faq.answer}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Faq() {
    return (
        <div className="bg-gray-50 min-h-screen flex items-center">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                        Câu hỏi thường gặp
                    </h2>
                </div>
                <div className="mt-12">
                    {faqs.map((faq, index) => (
                        <FaqItem key={index} faq={faq} />
                    ))}
                </div>
            </div>
        </div>
    );
}
"use client";

import { motion, Variants } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { FaApple, FaGooglePlay } from 'react-icons/fa';

const textVariants: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const imageVariants: Variants = {
  hidden: { x: 50, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

export default function DownloadApp() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  return (
    <div ref={ref} className="bg-white min-h-screen flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <motion.div
            variants={textVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
          >
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Giao dịch mọi lúc, mọi nơi.
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Luôn kết nối với thị trường với ứng dụng di động của chúng tôi. Tải xuống ngay hôm nay để không bỏ lỡ bất kỳ cơ hội nào.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="#" className="flex items-center justify-center gap-x-3 bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition duration-300">
                    <FaApple className="h-7 w-7" />
                    <span>App Store</span>
                </Link>
                <Link href="#" className="flex items-center justify-center gap-x-3 bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition duration-300">
                    <FaGooglePlay className="h-6 w-6" />
                    <span>Google Play</span>
                </Link>
            </div>
            <div className="mt-8">
                <p className="text-gray-600">Hoặc quét mã QR để tải:</p>
                {/* Replace with a real QR code image */}
                <Image src="/vercel.svg" alt="QR Code" width={150} height={150} className="mt-2" />
            </div>
          </motion.div>
          <motion.div
            variants={imageVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-center"
          >
            {/* Replace with a real phone mockup image */}
            <Image src="/globe.svg" alt="Mobile App" width={400} height={600} className="inline-block" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
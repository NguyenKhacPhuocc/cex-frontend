import Image from "next/image";
import Link from "next/link";

export default function HeaderSub() {

  return (
    <>
      <header className="bg-[#1C1F26] border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-[#F0B90B] text-2xl font-bold">
            <Image src="/binance-h.png" alt="" width={120} height={64} />
          </Link>
        </div>
      </header>
    </>
  );
}
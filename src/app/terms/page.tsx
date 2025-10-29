import HeaderSub from '@/components/HeaderSub';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0B0E11]">
      {/* Header */}
      <HeaderSub />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-[#1C1F26] rounded-2xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-400 mb-8">Last updated: October 26, 2025</p>

          <div className="space-y-8 text-gray-300">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                Welcome to Binance. By accessing or using our cryptocurrency trading platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
              <p>
                These terms constitute a legally binding agreement between you and Binance. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes acceptance of any changes.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
              <p className="mb-4">
                To use Binance, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Be at least 18 years of age or the legal age in your jurisdiction</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be prohibited from using our services under applicable laws</li>
                <li>Not be located in a restricted jurisdiction</li>
                <li>Comply with all applicable local, state, national, and international laws</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. Account Registration</h2>
              <p className="mb-4">
                To access certain features, you must register for an account. When registering, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Trading Services</h2>
              <p className="mb-4">
                Binance provides a platform for cryptocurrency trading. You acknowledge that:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Cryptocurrency trading involves substantial risk</li>
                <li>You may lose your entire investment</li>
                <li>Past performance does not guarantee future results</li>
                <li>Binance does not provide investment advice</li>
                <li>You are responsible for your own trading decisions</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Fees and Charges</h2>
              <p className="mb-4">
                Binance charges fees for certain services, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Trading fees on executed orders</li>
                <li>Withdrawal fees for cryptocurrency transfers</li>
                <li>Deposit fees (if applicable)</li>
                <li>Other service fees as disclosed on our platform</li>
              </ul>
              <p className="mt-4">
                All fees are clearly displayed before you complete a transaction. We reserve the right to change our fee structure with prior notice.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Prohibited Activities</h2>
              <p className="mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the platform for any illegal purposes</li>
                <li>Engage in market manipulation or fraudulent trading</li>
                <li>Use automated trading systems without authorization</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Create multiple accounts to circumvent restrictions</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
              <p>
                All content on the Binance platform, including but not limited to text, graphics, logos, and software, is the property of Binance and protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
              <p className="mb-4">
                To the maximum extent permitted by law, Binance shall not be liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Any direct, indirect, incidental, or consequential damages</li>
                <li>Loss of profits, revenue, or data</li>
                <li>Service interruptions or technical issues</li>
                <li>Third-party actions or content</li>
                <li>Market volatility or trading losses</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at any time, with or without notice, for violation of these terms or any other reason we deem appropriate. Upon termination, you must cease all use of the platform and withdraw any remaining funds according to our procedures.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-[#0B0E11] rounded-lg p-6">
                <p className="mb-2"><strong className="text-white">Email:</strong> support@binance.com</p>
                <p className="mb-2"><strong className="text-white">Website:</strong> www.binance.com</p>
                <p><strong className="text-white">Address:</strong> Binance Support Center</p>
              </div>
            </section>
          </div>

          {/* Back Button */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#F0B90B] hover:underline"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import HeaderSub from '@/components/HeaderSub';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0B0E11]">
      {/* Header */}
      <HeaderSub />

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-[#1C1F26] rounded-2xl p-8 md:p-12">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last updated: October 26, 2025</p>

          <div className="space-y-8 text-gray-300">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
              <p className="mb-4">
                At Binance, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our cryptocurrency trading platform.
              </p>
              <p>
                By using Binance, you consent to the data practices described in this policy. Please read this policy carefully to understand our views and practices regarding your personal data.
              </p>
            </section>

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
              <p className="mb-4">We collect several types of information to provide and improve our services:</p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Personal Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and phone number</li>
                <li>Government-issued identification documents</li>
                <li>Date of birth and nationality</li>
                <li>Residential address</li>
                <li>Photograph or selfie for verification</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Financial Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Bank account details</li>
                <li>Payment card information</li>
                <li>Cryptocurrency wallet addresses</li>
                <li>Transaction history</li>
              </ul>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Technical Information</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Operating system</li>
                <li>Login data and timestamps</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
              <p className="mb-4">We use your information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>To create and manage your account</li>
                <li>To verify your identity (KYC/AML compliance)</li>
                <li>To process your transactions and orders</li>
                <li>To provide customer support</li>
                <li>To detect and prevent fraud</li>
                <li>To comply with legal and regulatory requirements</li>
                <li>To send you service updates and notifications</li>
                <li>To improve our platform and services</li>
                <li>To conduct analytics and research</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">3. How We Share Your Information</h2>
              <p className="mb-4">We may share your information with:</p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Service Providers</h3>
              <p className="mb-4">
                Third-party vendors who help us operate our platform, including payment processors, identity verification services, and cloud storage providers.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Legal Authorities</h3>
              <p className="mb-4">
                Government agencies, regulators, and law enforcement when required by law or to protect our legal rights.
              </p>

              <h3 className="text-xl font-semibold text-white mb-3 mt-6">Business Transfers</h3>
              <p className="mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>

              <p className="mt-6">
                We do not sell your personal information to third parties for marketing purposes.
              </p>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
              <p className="mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>SSL/TLS encryption for data transmission</li>
                <li>Encryption of sensitive data at rest</li>
                <li>Multi-factor authentication (2FA)</li>
                <li>Regular security audits and penetration testing</li>
                <li>Secure data centers with restricted access</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">5. Your Privacy Rights</h2>
              <p className="mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-white">Access:</strong> Request a copy of your personal data</li>
                <li><strong className="text-white">Correction:</strong> Update or correct inaccurate information</li>
                <li><strong className="text-white">Deletion:</strong> Request deletion of your data (subject to legal obligations)</li>
                <li><strong className="text-white">Portability:</strong> Receive your data in a portable format</li>
                <li><strong className="text-white">Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong className="text-white">Object:</strong> Object to certain data processing activities</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at privacy@binance.com.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">6. Cookies and Tracking</h2>
              <p className="mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze platform usage and performance</li>
                <li>Provide personalized content</li>
                <li>Enhance security and fraud detection</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. However, disabling cookies may affect your ability to use certain features of our platform.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. After account closure, we may retain certain information for compliance, fraud prevention, and record-keeping purposes.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">8. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We ensure that appropriate safeguards are in place to protect your information in accordance with this policy.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">9. Children&apos;s Privacy</h2>
              <p>
                Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on our platform and updating the &quot;Last updated&quot; date. Your continued use of Binance after changes become effective constitutes acceptance of the revised policy.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
              <p className="mb-4">
                If you have questions or concerns about this Privacy Policy, please contact us:
              </p>
              <div className="bg-[#0B0E11] rounded-lg p-6">
                <p className="mb-2"><strong className="text-white">Email:</strong> privacy@binance.com</p>
                <p className="mb-2"><strong className="text-white">Support:</strong> support@binance.com</p>
                <p className="mb-2"><strong className="text-white">Website:</strong> www.binance.com</p>
                <p><strong className="text-white">Data Protection Officer:</strong> dpo@binance.com</p>
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

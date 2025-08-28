import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center text-yellow-600 hover:text-yellow-700 mb-6 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-fredoka">Privacy Policy</h1>
          
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">Information We Collect</h2>
              <p className="text-gray-600 leading-relaxed">
                Funny Yellow is committed to protecting your privacy. We collect minimal information to provide our sticker services:
              </p>
              <ul className="mt-4 text-gray-600 space-y-2">
                <li>• Usage data to improve our sticker gallery experience</li>
                <li>• Analytics data to understand how users interact with our platform</li>
                <li>• Device information for optimal sticker display</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">How We Use Your Information</h2>
              <p className="text-gray-600 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="mt-4 text-gray-600 space-y-2">
                <li>• Provide and maintain our sticker services</li>
                <li>• Improve user experience and platform functionality</li>
                <li>• Generate analytics to enhance our content curation</li>
                <li>• Ensure platform security and prevent misuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">Data Storage</h2>
              <p className="text-gray-600 leading-relaxed">
                Your preferences and favorites are stored locally on your device. We do not store personal information on our servers unless necessary for service functionality.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">Third-Party Services</h2>
              <p className="text-gray-600 leading-relaxed">
                We use Microsoft Clarity for analytics to understand user behavior and improve our services. This helps us make data-driven decisions about content and features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">Contact Us</h2>
              <p className="text-gray-600 leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us through our Contact page.
              </p>
            </section>

            <div className="text-sm text-gray-500 pt-8 border-t">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
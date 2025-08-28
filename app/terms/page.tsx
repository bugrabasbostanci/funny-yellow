import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-yellow-100 to-orange-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-yellow-600 hover:text-yellow-700 mb-6 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-fredoka">
            Terms of Service
          </h1>

          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">
                Welcome to Funny Yellow
              </h2>
              <p className="text-gray-600 leading-relaxed">
                By using Funny Yellow, you agree to these terms of service. Our
                platform provides free stickers for WhatsApp and other messaging
                applications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">
                Free Service
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Funny Yellow is completely free to use. All stickers in our
                gallery are available for download and use without any cost or
                registration requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">
                Acceptable Use
              </h2>
              <p className="text-gray-600 leading-relaxed">
                When using our service, you agree to:
              </p>
              <ul className="mt-4 text-gray-600 space-y-2">
                <li>• Use stickers for personal, non-commercial purposes</li>
                <li>• Respect intellectual property rights</li>
                <li>
                  • Not attempt to reverse engineer or misuse our platform
                </li>
                <li>
                  • Use stickers in accordance with the messaging
                  platform&apos;s terms
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">
                Sticker Content
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our stickers are curated by our team to ensure quality and
                appropriateness. We strive to provide fun, family-friendly
                content suitable for all users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">
                Service Availability
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We aim to keep Funny Yellow available at all times, but we
                cannot guarantee uninterrupted service. We may update or modify
                our service as needed to improve user experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">
                Limitation of Liability
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Funny Yellow is provided &quot;as is&quot; without any
                warranties. We are not liable for any damages arising from the
                use of our service or stickers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">
                Changes to Terms
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We may update these terms from time to time. Continued use of
                our service constitutes acceptance of any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">
                Contact
              </h2>
              <p className="text-gray-600 leading-relaxed">
                If you have questions about these terms, please reach out
                through our Contact page.
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

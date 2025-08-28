import Link from "next/link";

export default function ContactPage() {
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
            Contact Us
          </h1>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-12">
              <div className="text-6xl mb-6">🤝</div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-fredoka">
                Get in Touch
              </h2>
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                We&apos;d love to hear from you! Whether you have questions,
                feedback, or suggestions for new stickers, we&apos;re here to
                help make your messaging experience more fun.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 font-fredoka">
                    💌 General Inquiries
                  </h3>
                  <p className="text-gray-600">
                    For general questions about Funny Yellow, our sticker
                    collection, or how to use our platform.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 font-fredoka">
                    🎨 Sticker Suggestions
                  </h3>
                  <p className="text-gray-600">
                    Have an idea for new sticker themes or categories?
                    We&apos;re always looking to expand our collection with fun
                    and creative content.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 font-fredoka">
                    🐛 Technical Issues
                  </h3>
                  <p className="text-gray-600">
                    Experiencing problems with downloads or WhatsApp
                    integration? Let us know and we&apos;ll help resolve any
                    technical difficulties.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 font-fredoka">
                  📧 Email Us
                </h3>
                <p className="text-gray-600 mb-4">
                  Ready to reach out? Send us an email and we&apos;ll get back
                  to you as soon as possible.
                </p>
                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <code className="text-yellow-600 font-mono text-lg">
                    hello@funnyyellow.com
                  </code>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 font-fredoka">
                  🌟 Thank You!
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Your feedback helps us improve Funny Yellow and create better
                  sticker experiences for everyone. We appreciate you being part
                  of our community!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

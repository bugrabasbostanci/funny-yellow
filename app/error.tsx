'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Page Could Not Load</h2>
          <p className="text-gray-600 mb-6">
            An error occurred while loading this page. Please try again.
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
          
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Home
          </button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Error Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs text-gray-700 overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
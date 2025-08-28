export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-yellow-600/60 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-yellow-600/60 rounded-full animate-pulse delay-100"></div>
            <div className="w-2 h-2 bg-yellow-600/60 rounded-full animate-pulse delay-200"></div>
          </div>
        </div>
        <p className="text-gray-600 mt-4">Admin panel yükleniyor...</p>
      </div>
    </div>
  );
}
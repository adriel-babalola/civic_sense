export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">

      {/* Main Content */}
      <main className="flex-1 px-8 py-4">
        <h1 className="text-xl font-semibold mb-6">Welcome Tife</h1>
        
        {/* Trending News Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          {/* Image Placeholder */}
          <div className="h-48 bg-gray-200 w-full relative flex items-center justify-center text-gray-400">
             <div className="absolute top-4 left-4 w-10 h-10 rounded-full border-2 border-gray-300"></div>
             <span>News Thumbnail</span>
          </div>
          {/* Card Content */}
          <div className="p-5">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Trending News</h2>
            <p className="text-gray-500 text-sm">
              Description that provides the required context for the news item shown above.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

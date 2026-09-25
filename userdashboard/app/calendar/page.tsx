export default function CalendarPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="flex justify-center items-center px-8 py-4 bg-gray-300">
        <h1 className="text-lg font-bold text-gray-700">Monitor Events</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden relative shadow-sm flex flex-col h-full">
              {/* Add to Calendar Button */}
              <button className="absolute top-2 right-2 bg-gray-200 text-xs px-3 py-1 rounded-full font-semibold text-gray-600 flex items-center gap-1 z-10 hover:bg-gray-300 transition-colors">
                Add to calendar <span>+</span>
              </button>
              
              {/* Image Placeholder */}
              <div className="h-40 bg-gray-50 border-b-2 border-gray-300 w-full relative flex flex-col items-center justify-center text-gray-400">
                 <div className="absolute top-4 left-4 w-8 h-8 rounded-full border-2 border-gray-300"></div>
                 <div className="text-center text-sm">
                   <div>Event</div>
                   <div>Thumbnail</div>
                 </div>
                 <svg className="absolute w-full h-full text-gray-300 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <path d="M0 100 L50 20 L100 100 Z" fill="none" stroke="currentColor" strokeWidth="1"></path>
                 </svg>
              </div>
              
              {/* Card Details */}
              <div className="p-4 space-y-2 flex-1 flex flex-col">
                <div className="bg-gray-200 p-2 text-sm font-semibold text-gray-700 w-2/3">Event</div>
                <div className="bg-gray-200 p-2 text-sm text-gray-600 w-full flex-1 min-h-[3rem]">Supporting Details</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

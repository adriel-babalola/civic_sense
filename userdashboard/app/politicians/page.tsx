export default function PoliticiansPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Header Search */}
      <header className="px-8 py-4">
        <div className="flex bg-gray-300 rounded-lg p-3 items-center justify-between text-gray-600 font-semibold">
          <span>Search Politician</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-8 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
              {/* Image Placeholder */}
              <div className="h-40 bg-gray-50 border-b-2 border-gray-300 w-full relative flex flex-col items-center justify-center text-gray-400">
                 <div className="absolute top-4 left-4 w-8 h-8 rounded-full border-2 border-gray-300"></div>
                 <div className="text-center text-sm">
                   <div>Politician</div>
                   <div>Thumbnail</div>
                 </div>
                 <svg className="absolute w-full h-full text-gray-300 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <path d="M0 100 L50 20 L100 100 Z" fill="none" stroke="currentColor" strokeWidth="1"></path>
                 </svg>
              </div>
              
              {/* Card Details */}
              <div className="p-4 space-y-2 flex-1 flex flex-col">
                <div className="bg-gray-200 p-2 text-sm font-semibold text-gray-700 w-3/4">Politician</div>
                <div className="bg-gray-200 p-2 text-sm text-gray-600 w-full flex-1 min-h-[3rem]">Background Info</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

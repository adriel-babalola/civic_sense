import Link from "next/link";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-50">
      <div className="flex justify-between items-center px-6 py-4">
        <Link href="/report" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <div className="w-6 h-6 border-2 border-current rounded-full mb-1"></div>
          <span className="text-xs">Report</span>
        </Link>
        
        <Link href="/politicians" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <div className="w-6 h-6 border-2 border-current rounded-full mb-1"></div>
          <span className="text-xs">Politicians</span>
        </Link>
        
        <Link href="/calendar" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <div className="w-6 h-6 border-2 border-current rounded-full mb-1"></div>
          <span className="text-xs">Calendar</span>
        </Link>
        
        <Link href="/bot" className="flex flex-col items-center text-gray-500 hover:text-blue-600">
          <div className="w-6 h-6 border-2 border-current rounded-full mb-1"></div>
          <span className="text-xs">Bot</span>
        </Link>
      </div>
    </nav>
  );
}

"use client";
import { useState } from "react";

export default function ReportPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-24 relative">
      {/* Header Create Report */}
      <header className="px-8 py-4">
        {/* We changed this from a div to a button to make it clickable */}
        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-full flex bg-gray-300 hover:bg-gray-400 transition-colors rounded-lg p-4 items-center justify-between text-gray-700 font-semibold text-lg cursor-pointer shadow-sm"
        >
          <span>Create New Report</span>
          <span className="text-2xl font-bold">+</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-8 py-4">
        <h2 className="text-sm font-semibold bg-gray-200 inline-block px-2 py-1 text-gray-600 mb-4 rounded">Recent Reports</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
              {/* Image Placeholder */}
              <div className="h-40 bg-gray-50 border-b-2 border-gray-300 w-full relative flex flex-col items-center justify-center text-gray-400">
                 <div className="absolute top-3 left-3 w-6 h-6 rounded-full border-2 border-gray-300"></div>
                 <div className="text-center text-sm">
                   <div>Report</div>
                   <div>Thumbnail</div>
                 </div>
                 {/* X lines background */}
                 <svg className="absolute w-full h-full text-gray-300 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <path d="M0 100 L50 20 L100 100 Z" fill="none" stroke="currentColor" strokeWidth="1"></path>
                 </svg>
              </div>
              
              {/* Card Details */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 text-lg mb-1">Report</h3>
                <p className="text-gray-500 text-sm flex-1">Supporting details</p>
                
                {/* 3 Icons Bottom Right */}
                <div className="flex justify-end gap-1.5 mt-4">
                  {[1, 2, 3].map((icon) => (
                    <div key={icon} className="w-5 h-5 rounded-full border-2 border-gray-700 relative">
                      <div className="absolute w-full h-[2px] bg-gray-700 top-1/2 left-0 -translate-y-1/2 rotate-45"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 
        This is the Modal Form. 
        It only shows up if isFormOpen is true 
      */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          
          {/* Form Container */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-lg text-gray-800">New Report</h2>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setIsFormOpen(false); }}>
              
              {/* Image Input */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-600">Report Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {/* Title Input */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-600">Title</label>
                <input 
                  type="text" 
                  placeholder="Enter report title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description Input */}
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-semibold text-gray-600">Description</label>
                <textarea 
                  placeholder="Enter supporting details..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  required
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md"
                >
                  Submit Report
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

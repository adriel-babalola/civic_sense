export default function BotPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 relative pb-24">
      {/* Header */}
      <header className="flex justify-center items-center px-8 py-4 bg-gray-200">
        <div className="font-bold text-gray-700 bg-gray-300 px-8 py-1 rounded-full">Kratos</div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 px-8 py-4 overflow-y-auto space-y-6 flex flex-col">
        {/* User Message */}
        <div className="self-end bg-gray-300 text-gray-800 px-4 py-2 rounded-lg max-w-[80%]">
          User message
        </div>
        
        {/* Bot Message */}
        <div className="self-start bg-gray-300 text-gray-800 px-4 py-2 rounded-lg max-w-[80%]">
          Bot Response
        </div>

        {/* User Message */}
        <div className="self-end bg-gray-300 text-gray-800 px-4 py-2 rounded-lg max-w-[80%]">
          User message
        </div>

        {/* Bot Message */}
        <div className="self-start bg-gray-300 text-gray-800 px-4 py-2 rounded-lg max-w-[80%]">
          Bot Response
        </div>
      </main>

      {/* Input Area (Sits above BottomNav) */}
      <div className="absolute bottom-[76px] w-full px-8 py-4 bg-white border-t border-gray-200">
        <div className="flex bg-gray-200 rounded-lg p-3 items-center justify-between text-gray-500">
          <span>Input message</span>
          <span className="font-bold text-xl">+</span>
        </div>
      </div>
    </div>
  );
}

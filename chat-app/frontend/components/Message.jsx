// Message-responsive.jsx
export default function Message({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-2 sm:gap-3 px-2 sm:px-0 ${isUser ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
      {/* Avatar - Responsive size */}
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br">
        {isUser 
          ? <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">Toi</div>
          : <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">IA</div>
        }
      </div>

      {/* Bulle de message - Responsive */}
      <div className={`
        max-w-[85%] sm:max-w-[75%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm
        ${isUser 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-gray-100 text-gray-900 rounded-bl-none'}
      `}>
        <p className="whitespace-pre-wrap break-words leading-relaxed text-sm sm:text-base">
          {message.content}
        </p>
        
        <div className="text-[10px] sm:text-xs mt-1 opacity-70 text-right">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
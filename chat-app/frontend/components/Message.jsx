export default function Message({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden bg-gradient-to-br">
        {isUser 
          ? <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">Toi</div>
          : <div className="w-full h-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold">IA</div>
        }
      </div>

      {/* Bulle de message */}
      <div className={`
        max-w-[75%] px-4 py-3 rounded-2xl shadow-sm
        ${isUser 
          ? 'bg-blue-600 text-white rounded-br-none' 
          : 'bg-gray-100 text-gray-900 rounded-bl-none'}
      `}>
        <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
        
        <div className="text-xs mt-1 opacity-70 text-right">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
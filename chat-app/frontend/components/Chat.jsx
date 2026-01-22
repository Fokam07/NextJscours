'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import Message from './Message';
import { Trash2 } from 'lucide-react';

export default function Chat() {
    const { messages, sendMessage, isLoading, error } = useChat();

    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!inputValue.trim()) return;
        sendMessage(inputValue.trim());
        setInputValue('');
    }; 

    const handleClearChat = async () => {
        if (!confirm("Vraiment effacer toute la conversation ?")) return;

        try {
            const res = await fetch('/api/chat', { method: 'DELETE' });
            if (!res.ok) throw new Error('Erreur suppression');
            
            setMessages([]); // ou appelle fetchMessages() si tu préfères recharger
        } catch (err) {
            console.error(err);
            alert("Impossible d'effacer la conversation");
        }
        };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);
    
    return (
        <div className="flex flex-col h-full max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-lg font-medium">Chat avec Groq</h2>
                <button
                    onClick={handleClearChat}
                    disabled={messages.length === 0 || isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Trash2 size={16} />
                    Effacer
                </button>
            </div>
            {/* Zone messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 bg-gray-50">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 py-10">
                        Commence à discuter…
                    </div>
                )}

                {messages.map((msg) => (
                    <Message key={msg.id} message={msg} />
                ))}

                {isLoading && (
                    <div className="flex justify-start mb-4">
                        <div className="bg-gray-200 text-gray-600 px-5 py-3 rounded-2xl rounded-bl-none flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-red-600 text-center py-2">{error}</div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Zone saisie */}
            <div className="border-t bg-white p-4">
                <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Écris ton message..."
                        disabled={isLoading}
                        className="
                            flex-1 px-5 py-3 border border-gray-300 rounded-full 
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            disabled:bg-gray-100 disabled:cursor-not-allowed
                        "
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="
                            px-6 py-3 bg-blue-600 text-white font-medium rounded-full
                            hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                            disabled:bg-gray-400 disabled:cursor-not-allowed
                            transition-colors
                        "
                    >
                        Envoyer
                    </button>
                </form>
            </div>
        </div>
    );
}
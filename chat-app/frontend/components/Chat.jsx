'use client';

import { useRef, useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import Message from './Message';
import { Trash2 } from 'lucide-react';
import '../styles/chat.css'; // Importez votre fichier de styles ici

export default function Chat() {
    const { messages, sendMessage, isLoading, error } = useChat();
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        sendMessage(inputValue.trim());
        setInputValue('');
    }; 

    const handleClearChat = async () => {
        if (!confirm("Vraiment effacer toute la conversation ?")) return;

        try {
            const res = await fetch('/api/chat', { method: 'DELETE' });
            if (!res.ok) throw new Error('Erreur suppression');
            // setMessages([]); // Uncomment if necessary to reset messages     
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
        <div className="chat-container">
            <div className="chat-header">
                <h2>Chat avec Groq</h2>
                <button onClick={handleClearChat} disabled={messages.length === 0 || isLoading} className="clear-chat-button">
                    <Trash2 size={16} />
                    Effacer
                </button>
            </div>
            <div className="messages">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-gray-500 py-10">Commence à discuter…</div>
                )}
                {messages.map((msg) => (
                    <div key={msg.id} className={msg.role === 'user' ? 'message-user' : 'message-assistant'}>
                        <Message message={msg} />
                    </div>
                ))}
                {isLoading && <div>Chargement...</div>}
                {error && <div className="text-red-600 text-center py-2">{error}</div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="input-zone">
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Écris ton message..."
                        disabled={isLoading}
                        className="input-message"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="send-button"
                    >
                        Envoyer
                    </button>
                </form>
            </div>
        </div>
    );
}
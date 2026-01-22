// app/page.js
import Chat from '@/frontend/components/Chat';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow p-4">
        <h1 className="text-2xl font-bold text-center">Chat Privé – Groq</h1>
      </header>

      <Chat />
    </main>
  );
}
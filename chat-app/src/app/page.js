import Chat from '../../frontend/components/Chat';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-center">
          Chat simple avec IA
        </h1>
      </header>

      <div className="flex-1">
        <Chat />
      </div>
    </main>
  );
}
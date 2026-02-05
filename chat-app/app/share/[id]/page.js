import { prisma } from '@/backend/lib/prisma';
import { notFound } from 'next/navigation';

export default async function SharePage({ params }) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      shareId: params.shareId,
      isPublic: true,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">{conversation.title}</h1>
        <p className="text-gray-500 mb-8">
          Conversation partagée publiquement
        </p>

        <div className="space-y-6">
          {conversation.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white shadow border'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {/* Ajoute ici le rendu des attachments si besoin */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
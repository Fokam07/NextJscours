import { NextResponse } from 'next/server';
import { messageService } from '@/backend/services/messagerie.service';

// /**
//  * GET /api/messages/[id]
//  * Récupérer un message spécifique
//  */
// export async function GET(request, { params }) {
//   try {
//     const userId = request.headers.get('x-user-id');
    
//     if (!userId) {
//       return NextResponse.json(
//         { error: 'Non authentifié' },
//         { status: 401 }
//       );
//     }

//     const message = await messageService.getMessageById(
//       params.id,
//       userId
//     );

//     return NextResponse.json(message);
//   } catch (error) {
//     console.error('Erreur GET /api/messages/[id]:', error);
//     return NextResponse.json(
//       { error: error.message },
//       { status: error.message === 'Message non trouvé' ? 404 : 500 }
//     );
//   }
// }

// /**
//  * PATCH /api/messages/[id]
//  * Mettre à jour un message
//  */
// export async function PATCH(request, { params }) {
//   try {
//     const userId = request.headers.get('x-user-id');
    
//     if (!userId) {
//       return NextResponse.json(
//         { error: 'Non authentifié' },
//         { status: 401 }
//       );
//     }

//     const { content } = await request.json();

//     const message = await messageService.updateMessage(
//       params.id,
//       userId,
//       content
//     );

//     return NextResponse.json(message);
//   } catch (error) {
//     console.error('Erreur PATCH /api/messages/[id]:', error);
//     return NextResponse.json(
//       { error: error.message },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * DELETE /api/messages/[id]
//  * Supprimer un message
//  */
// export async function DELETE(request, { params }) {
//   try {
//     const userId = request.headers.get('x-user-id');
    
//     if (!userId) {
//       return NextResponse.json(
//         { error: 'Non authentifié' },
//         { status: 401 }
//       );
//     }

//     await conversationService.deleteConversation(params.id, userId);
    
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error('Erreur DELETE /api/conversations/[id]:', error);
//     return NextResponse.json(
//       { error: error.message },
//       { status: 500 }
//     );
//   }
// }

export async function POST(request, { params }) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { content } = await request.json();

    const message = await messageService.sendMessage({
      conversationId: params.id,
      userId,
      content
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Erreur POST /api/messages:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
// app/api/roles/[id]/share/route.js
import { NextResponse } from 'next/server';
import { roleService } from '@/backend/services/role.service.js';

function getUserId(request) {
  return request.headers.get('x-user-id');
}

export async function POST(request, { params }) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const { targetUserId, canEdit = false } = await request.json();

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId requis' }, { status: 400 });
    }
    if (targetUserId === userId) {
      return NextResponse.json({ error: 'Impossible de partager avec soi-même' }, { status: 400 });
    }

    await roleService.shareRole(params.id, userId, targetUserId, canEdit);

    return NextResponse.json({ message: 'Rôle partagé avec succès' });
  } catch (error) {
    console.error('[API POST /roles/:id/share] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors du partage' },
      { status: error.message?.includes('propriétaire') ? 403 : 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const { targetUserId } = await request.json(); // ou via params si tu préfères

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId requis' }, { status: 400 });
    }

    await roleService.revokeShare(params.id, userId, targetUserId);

    return NextResponse.json({ message: 'Partage révoqué avec succès' });
  } catch (error) {
    console.error('[API DELETE /roles/:id/share] Erreur:', error);
    return NextResponse.json({ error: 'Erreur révocation' }, { status: 500 });
  }
}
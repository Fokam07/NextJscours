// app/api/roles/[id]/shares/route.js
import { NextResponse } from 'next/server';
import { roleService } from '@/backend/services/role.service.js';

function getUserId(request) {
  return request.headers.get('x-user-id');
}

export async function GET(request, { params }) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const shares = await roleService.getRoleShares(params.id, userId);
    return NextResponse.json({ shares });
  } catch (error) {
    console.error('[API GET /roles/:id/shares] Erreur:', error);
    const status = error.message?.includes('autorisé') ? 403 : 500;
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status });
  }
}
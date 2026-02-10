// app/api/roles/[id]/route.js
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
    const role = await roleService.getRoleById(params.id, userId);
    if (!role) {
      return NextResponse.json({ error: 'Rôle non trouvé ou accès non autorisé' }, { status: 404 });
    }
    return NextResponse.json({ role });
  } catch (error) {
    console.error('[API GET /roles/:id] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updatedRole = await roleService.updateRole(params.id, userId, body);

    return NextResponse.json({
      role: updatedRole,
      message: 'Rôle mis à jour avec succès'
    });
  } catch (error) {
    console.error('[API PUT /roles/:id] Erreur:', error);

    if (error.message?.includes('non trouvé') || error.message?.includes('propriétaire')) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    await roleService.deleteRole(params.id, userId);
    return NextResponse.json({ message: 'Rôle supprimé avec succès' });
  } catch (error) {
    console.error('[API DELETE /roles/:id] Erreur:', error);
    return NextResponse.json({ error: error.message || 'Erreur suppression' }, { status: 500 });
  }
}
// app/api/roles/route.js
import { NextResponse } from 'next/server';
import { roleService } from '@/backend/services/role.service.js';

function getUserId(request) {
  return request.headers.get('x-user-id');
}

export async function GET(request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const roles = await roleService.getRolesByUser(userId);
    return NextResponse.json({ roles }, { status: 200 });
  } catch (error) {
    console.error('[API GET /roles] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des rôles' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const userId = getUserId(request);
  if (!userId) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      name,
      system_prompt,
      description = '',
      icon = '🤖',
      category = 'custom',
      visibility = 'private'
    } = body;

    // Validation stricte
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });
    }
    if (!system_prompt?.trim()) {
      return NextResponse.json({ error: 'Le prompt système est requis' }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ error: 'Nom trop long (max 100 caractères)' }, { status: 400 });
    }
    if (system_prompt.length < 10) {
      return NextResponse.json({ error: 'Prompt trop court (min 10 caractères)' }, { status: 400 });
    }

    const newRole = await roleService.createRole(userId, {
      name: name.trim(),
      system_prompt: system_prompt.trim(),
      description: description.trim(),
      icon,
      category,
      visibility
    });

    return NextResponse.json(
      {
        role: newRole,
        message: 'Rôle créé avec succès'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[API POST /roles] Erreur:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du rôle' },
      { status: 500 }
    );
  }
}
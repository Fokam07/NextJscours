// app/api/roles/system/route.js
import { NextResponse } from 'next/server';
import { roleService } from '@/backend/services/role.service.js';

export async function GET() {
  try {
    const systemRoles = await roleService.getSystemRoles();
    return NextResponse.json({ roles: systemRoles });
  } catch (error) {
    console.error('[API GET /roles/system] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
import { userService } from "@/backend/services/user.service";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const id = req.headers.get('x-user-id') ;
    const {email} = await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID utilisateur manquant',
      }, { status: 401 });
    }

    const user = await userService.findOrCreateIfNotExist({email, id});
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur non trouvé',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 501 });
  }
}

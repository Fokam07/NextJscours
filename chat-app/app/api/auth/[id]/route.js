import { userService } from "@/backend/services/user.service";
import { NextResponse } from "next/server";

export async function GET(req,{ params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID utilisateur manquant',
      }, { status: 401 });
    }

    const user = await userService.findById(id);
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

import { userService } from "@/backend/services/user.service";
import { NextResponse } from "next/server";

export async function DELETE(req) {
  try {
    const id = req.headers.get('x-user-id');
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'ID utilisateur manquant',
      },
      { status: 401 });
    }

    // SUPPRESSION
    const user = await userService.deleteUser(id);
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    },
    { status: 501 });
  }
}

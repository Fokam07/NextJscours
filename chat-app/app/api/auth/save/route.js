import { NextResponse } from "next/server";
import { userService } from "@/backend/services/user.service.js";


export async function POST(req) {
 try {
    const { id, email, username } = await req.json();

    // INSCRIPTION
    const user = await userService.createUser({id, email, username });
    return NextResponse.json({
      success: true,
      user,
    },
    { status: 201 });
    
 } catch (error) {
  return NextResponse.json({
    success: false,
    message: error.message,
  },
  { status: 401 });
 }
}

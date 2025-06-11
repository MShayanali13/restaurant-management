// fetch-menu item API route
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MenuItem } from "@/models/MenuItem";

export async function GET() {
 try {
  
   await connectDB();
   const Menu = await MenuItem.find();
   return NextResponse.json({Menu,ok:true}, { status: 200 });
 } catch (error) {
    console.error('[MENU_FETCH_ERROR]', error);
    return NextResponse.json({ ok: false, error: 'Something went wrong' }, { status: 500 });
  
 }
}

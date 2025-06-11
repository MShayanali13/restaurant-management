// fetch-menu item API route
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import TempOrder from "@/models/TempOrder";

export async function GET() {
 try {
  
   await connectDB();
   const Temp_Order = await TempOrder.find();
   return NextResponse.json({message:Temp_Order,ok:true}, { status: 200 });
 } catch (error) {
    console.error('[Temp_Order_FETCH_ERROR]', error);
    return NextResponse.json({ ok: false, error: 'Something went wrong' }, { status: 500 });
  
 }
}

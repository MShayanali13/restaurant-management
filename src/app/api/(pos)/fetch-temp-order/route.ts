// fetch-menu item API route
import { NextResponse,NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import TempOrder from "@/models/TempOrder";

export async function POST(
  req: NextRequest,
) {
  try {
    await connectDB();
      const body = await req.json();
    const { tableNumber } = body;

   const Temp_Order = await TempOrder.findOne({tableNumber:parseInt(tableNumber)});
   return NextResponse.json({message:Temp_Order,ok:true}, { status: 200 });
 } catch (error) {
    console.error('[Temp_Order_FETCH_ERROR]', error);
    return NextResponse.json({ ok: false, message:{items:[]}, error: 'Something went wrong' }, { status: 500 });
  
 }
}

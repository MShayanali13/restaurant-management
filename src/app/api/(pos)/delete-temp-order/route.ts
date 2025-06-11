// /app/api/tempOrders/[tableNumber]/route.ts
import { connectDB } from "@/lib/db";
import TempOrder from "@/models/TempOrder";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
) {
  try {
    await connectDB();
      const body = await req.json();
    const { tableNumber } = body;

    await TempOrder.deleteOne({ tableNumber: parseInt(tableNumber) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

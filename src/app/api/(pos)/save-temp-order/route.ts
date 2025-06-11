// app/api/(pos)/save-temp-order/route.ts
import { connectDB } from "@/lib/db";
import TempOrder from "@/models/TempOrder";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const { tableNumber, items } = body;

    if (!tableNumber || !items) {
      return NextResponse.json({ ok: false, error: "Missing data" });
    }

    // Upsert logic: update if exists, otherwise create
    const order = await TempOrder.findOneAndUpdate(
      { tableNumber },
      { $set: { items, createdAt: new Date() } },
      { upsert: true, new: true }
    );
    
  // await TempOrder.findOneAndUpdate(
  //   { tableNumber },
  //   { items },
  //   { upsert: true, new: true }
  // );

    return NextResponse.json({ ok: true, order });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" });
  }
}


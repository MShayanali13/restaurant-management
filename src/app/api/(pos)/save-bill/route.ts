
import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import {Bill} from "@/models/Bill";

export async function POST(req: Request) {
  try {
    const { items, tableNumber } = await req.json();

    if (!Array.isArray(items) || !tableNumber) {
      return NextResponse.json({ success: false, error: "Invalid items or table number" });
    }

    await connectDB();

    // Save to MongoDB
    await Bill.create({
      tableNumber,
      items: items,
      total: items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0),
    });


    return NextResponse.json({ ok: true, message:"Saved SUccessfully" });
  } catch (error) {
    console.error("PDF Error:", error);
    return NextResponse.json({ ok: false, error: "PDF generation failed" });
  }
}

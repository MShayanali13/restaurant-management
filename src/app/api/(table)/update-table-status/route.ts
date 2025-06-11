// /app/api/update-table-status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Table } from "@/models/Table";

export async function POST(req: NextRequest) {
  const { tableNumber, status } = await req.json();
  try {
    await connectDB();
    await Table.findOneAndUpdate({ tableNumber }, { status });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error });
  }
}

// /api/(menu)/import-menu-items.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MenuItem } from "@/models/MenuItem";


export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { items } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: 'No valid items to import' }, { status: 400 });
    }

    const savedItems = await MenuItem.insertMany(items);
  
    // return NextResponse.json({ ok: true, items: items }, { status: 200 });
    return NextResponse.json({ ok: true, items: savedItems }, { status: 200 });
  } catch (err) {
    console.error('Import error:', err);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
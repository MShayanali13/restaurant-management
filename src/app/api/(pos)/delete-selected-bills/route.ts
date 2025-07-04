import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import {Bill} from '@/models/Bill';

export async function DELETE(req: NextRequest) {
  await connectDB();
 try {
    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ ok: false, error: "No IDs provided" }, { status: 400 });
    }

    const result = await Bill.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({ ok: true, message:'deleted items successfully!',deletedCount: result.deletedCount,result });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }}

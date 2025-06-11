import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import {MenuItem} from '@/models/MenuItem';

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

    await MenuItem.findByIdAndDelete(id);

    return NextResponse.json({ ok: true, message: 'Item deleted successfully' });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error }, { status: 500 });
  }
}

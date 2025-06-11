import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import {MenuItem} from '@/models/MenuItem';

export async function PUT(req: NextRequest) {
  await connectDB();

  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedItem) {
      return NextResponse.json({ ok: false, error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, item: updatedItem });
  } catch (error) {
    console.error('Update failed:', error);
    return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
  }
}
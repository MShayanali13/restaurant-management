import { NextRequest, NextResponse } from 'next/server';
import {connectDB} from '@/lib/db';
import { Bill } from '@/models/Bill';

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
const bill=await Bill.findById(id)
   const delBill= await Bill.findByIdAndDelete(id);

    return NextResponse.json({ ok: true, message: 'Item deleted successfully',delBill,bill });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error }, { status: 500 });
  }
}

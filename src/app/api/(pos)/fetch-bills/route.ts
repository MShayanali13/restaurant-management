// /app/api/orders/route.ts
import { NextResponse } from "next/server";
import {Bill} from "@/models/Bill";
import {connectDB} from "@/lib/db";

export async function GET() {
  await connectDB();
  const count = await Bill.countDocuments();
  const bills= await Bill.find()
  return NextResponse.json({ count,bills ,ok:true});
}

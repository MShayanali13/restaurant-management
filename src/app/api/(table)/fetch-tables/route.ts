// fetch-tables API route
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Table } from "@/models/Table";

export async function GET() {
  await connectDB();
  const tables = await Table.find().sort({ tableNumber: 1 });
  return NextResponse.json(tables);
}

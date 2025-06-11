// delete-table API route
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db"; // Your dbConnect file
import { Table } from "@/models/Table"; // Your Mongoose model


export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    await connectDB();

    const table = await Table.findById(id);
    if (!table) {
      return NextResponse.json({ message: "Table not found" }, { status: 404 });
    }else{
      if (table.status === "running") {
        return NextResponse.json({ message: "Cannot delete a table that is currently in use" }, { status: 500 });
      } else if (table.status === "available") {
        await Table.findByIdAndDelete(id);
        return NextResponse.json({ message: "Table deleted successfully" ,ok:true}, { status: 200 });
      }
    }
  } catch (error) {
    console.error("Error deleting table:", error);
    return NextResponse.json({ error: "Failed to delete table" }, { status: 500 });
  }
}

// add-table API route to add a new table with the smallest available table number
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Table } from "@/models/Table";

export async function POST() {
  try {
    await connectDB();
    const tables = await Table.find({}, { tableNumber: 1 }).sort({ tableNumber: 1 });

  const usedNumbers = tables.map((t) => t.tableNumber);

  // Find the smallest missing table number
  let newTableNumber = 1;
  for (let i = 0; i < usedNumbers.length; i++) {
    if (usedNumbers[i] !== i + 1) {
      newTableNumber = i + 1;
      break;
    }
    newTableNumber = usedNumbers.length + 1;
  }

  const newTable = new Table({
    tableNumber: newTableNumber,
    status: "available",
  });

  await newTable.save();

  return NextResponse.json({newTable,ok:true}, { status: 200 });
    
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    
  }
}

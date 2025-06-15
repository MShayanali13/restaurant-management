import { NextResponse } from "next/server";
import {connectDB} from "@/lib/db";
import { Bill } from "@/models/Bill";

export async function GET() {
  try {
    await connectDB();

    const bills = await Bill.find();

    const totalRevenue = bills.reduce(
      (sum, bill) => sum + (bill.total || 0),
      0
    );

    const totalBills = bills.length;

    const itemCount: Record<string, number> = {};
    

    for (const bill of bills) {
      for (const item of bill.items) {
        if (!item.name) continue;
        itemCount[item.name] = (itemCount[item.name] || 0) + (item.quantity || 1);
      }
    }

    const bestItems = Object.entries(itemCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return NextResponse.json({ totalRevenue, totalBills, bestItems });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// /api/(menu)/add-menu-itwm.ts
import {  NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MenuItem } from "@/models/MenuItem";

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const { name, category, isVeg, price } = body;
const Mname = name.trim(" ");

    const existing = await MenuItem.find({
      
      name:Mname, 
      category,
      isVeg,
    });
    console.log("Existing item check:", existing);

    if (existing.length > 0) {
      return NextResponse.json({
        ok: false,
        error: "This item name is already used in this category and type (Veg/Non-Veg). Please use a different name.",
      }, { status: 400 });
    }
    
    // ✅ Save new item
    const newItem = await MenuItem.create({  name, category, isVeg, price });
    
    return NextResponse.json({ ok: true, item: newItem ,message:"Item added"}, { status: 201 });

}



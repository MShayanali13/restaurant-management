// models/MenuItem.ts
import mongoose from "mongoose";

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true   },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  isVeg: { type: Boolean, default: true },
  available: { type: Boolean, default: true },
  
});

export const MenuItem = mongoose.models.MenuItem || mongoose.model("MenuItem", MenuItemSchema);

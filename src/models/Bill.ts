// /models/Bill.ts
import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
   _id: String,
  items: [
    {
      _id: String,
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  total: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  customerName:String,
  customerPhone:String,
  includeGST:Boolean
});

export const Bill = mongoose.models.Bill || mongoose.model("Bill", BillSchema);

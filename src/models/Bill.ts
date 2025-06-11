// /models/Bill.ts
import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
  orderId: String,
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
});

export const Bill = mongoose.models.Bill || mongoose.model("Bill", BillSchema);

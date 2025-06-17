// /models/Bill.ts
import mongoose from "mongoose";

const BillSchema = new mongoose.Schema({
 items: [
    {
      _id: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  total: { type: Number, required: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  customerName: { type: String },
  customerPhone: { type: String },
  includeGST: { type: Boolean, required: true },
});

export const Bill = mongoose.models.Bill || mongoose.model("Bill", BillSchema);

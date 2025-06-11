// models/Table.ts
import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ["available", "running"],
    default: "available",
  },
});

export const Table = mongoose.models.Table || mongoose.model("Table", tableSchema);

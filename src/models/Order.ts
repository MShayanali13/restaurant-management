// // models/TempOrder.ts
// import mongoose from "mongoose";

// const Order = new mongoose.Schema({
//   tableNumber: { type:String, required: true,  },
//   items: [
//     {
//       _id: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
//       name: String,
//       price: Number,
//       quantity: Number,
//       category: String,
//       isVeg: Boolean,
//     },
//   ],
//   createdAt: { type: Date, default: Date.now }, // Auto-delete after 1 hour
// });

// export default mongoose.models.TempOrder ||
//   mongoose.model("Orders", Order);

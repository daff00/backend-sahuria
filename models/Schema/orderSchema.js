import mongoose from "mongoose";
import moment from "moment-timezone";

const { Schema } = mongoose;

const orderSchema = new Schema(
  {
    nama: { type: String, required: true },
    jumlah: { type: Number, required: true },
    kamar: { type: Number, required: true },
    keterangan: { type: String, default: "" },
    expiredAt: {
      type: Date,
      default: () => moment().tz("Asia/Jakarta").add(1, "day").toDate(),
      required: true,
    },
  },
  { timestamps: true }
);

// TTL Index
orderSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
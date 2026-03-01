import express from "express";
import moment from "moment-timezone";
import Order from "../models/Schema/orderSchema.js";

const router = express.Router();

// =======================
// Middleware Log
// =======================
router.use((req, res, next) => {
  console.log(`[LOG] ${new Date().toISOString()} | ${req.method} ${req.url}`);
  next();
});

// =======================
// Middleware Check Body
// =======================
const checkBody = (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Body request tidak boleh kosong" });
  }
  next();
};

// =======================
// Error Handler
// =======================
const handleError = (err, res) => {
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(v => v.message);
    return res.status(400).json({ success: false, error: messages });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, error: "Format ID Tidak valid" });
  }
  res.status(500).json({ success: false, error: "Internal Server Error" });
};

// =======================
// Cutoff Time
// =======================
const cutoffHour = 23;  // ubah sesuai kebutuhan
const cutoffMinute = 0;

const isAfterCutoff = () => {
  const now = moment().tz("Asia/Jakarta"); // WIB
  return (
    now.hour() > cutoffHour ||
    (now.hour() === cutoffHour && now.minute() >= cutoffMinute)
  );
};

// =======================
// GET Orders (Pagination)
// =======================
router.get("/orders", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // Data halaman
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Tambahkan totalHarga per order (opsional)
    const ordersWithTotal = orders.map(o => ({
      ...o,
      totalHarga: o.jumlah * 15000
    }));

    // Total seluruh order
    const allOrders = await Order.find({}).lean();
    const totalPesanan = allOrders.reduce((acc, o) => acc + o.jumlah, 0);
    const totalRp = totalPesanan * 15000;

    const total = await Order.countDocuments();

    res.json({
      success: true,
      page,
      total,           // total order count
      totalPesanan,    // jumlah paket seluruh order
      totalRp,         // total harga seluruh order
      data: ordersWithTotal
    });
  } catch (err) {
    handleError(err, res);
  }
});

// =======================
// POST Order
// =======================
router.post("/orders", checkBody, async (req, res) => {
  if (isAfterCutoff()) {
    return res.status(403).json({
      success: false,
      error: "Maaf, sudah tidak bisa pesan karena sudah lewat waktu cutoff"
    });
  }

  try {
    const jumlah = Number(req.body.jumlah);
    const kamar = Number(req.body.kamar);

    if (
      isNaN(jumlah) ||
      isNaN(kamar) ||
      jumlah <= 0 ||
      kamar <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Jumlah dan nomor kamar tidak boleh minus atau nol"
      });
    }

    const payload = {
      ...req.body,
      jumlah,
      kamar,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    const order = await Order.create(payload);

    res.status(201).json({
      success: true,
      data: order
    });

  } catch (err) {
    handleError(err, res);
  }
});

// =======================
// PUT Order
// =======================
router.put("/orders/:id", checkBody, async (req, res) => {
  if (isAfterCutoff()) {
    return res.status(403).json({
      success: false,
      error: "Maaf, sudah tidak bisa pesan karena sudah lewat waktu cutoff"
    });
  }

  try {
    const jumlah = Number(req.body.jumlah);
    const kamar = Number(req.body.kamar);

    if (
      isNaN(jumlah) ||
      isNaN(kamar) ||
      jumlah <= 0 ||
      kamar <= 0
    ) {
      return res.status(400).json({
        success: false,
        error: "Jumlah dan nomor kamar tidak boleh minus atau nol"
      });
    }

    const payload = {
      ...req.body,
      jumlah,
      kamar,
      expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      payload,
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan"
      });
    }

    res.json({
      success: true,
      data: updatedOrder
    });

  } catch (err) {
    handleError(err, res);
  }
});

// =======================
// DELETE Order
// =======================
router.delete("/orders/:id", async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "Order tidak ditemukan"
      });
    }

    res.json({ success: true });

  } catch (err) {
    handleError(err, res);
  }
});

export default router;
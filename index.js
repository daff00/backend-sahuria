import dotenv from 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoCon from './config/connection.js';
import router from './controllers/orderController.js';

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// Middleware
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// Root & Health Check
// =======================
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend Sahur App is running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// =======================
// Routes
// =======================
app.use('/', router);

// =======================
// Start Server after MongoDB connects
// =======================
mongoCon()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`App is listening on ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to start server:", err);
    process.exit(1); // hentikan proses jika MongoDB gagal connect
  });
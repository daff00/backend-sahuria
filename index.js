import dotenv from 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoCon from './config/connection.js';
import router from './controllers/orderController.js';

const app = express();
const PORT = process.env.PORT || 3000;
mongoCon();

// =======================
// Middleware
// =======================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =======================
// Health Check Endpoint
// =======================
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// =======================
// Routes
// =======================
app.use('/', router);

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
    console.log(`App is listening on ${PORT}`);
});
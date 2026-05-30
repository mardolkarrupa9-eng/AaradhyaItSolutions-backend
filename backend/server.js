import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes - Admin
import authRoutes from "./src/routes/admin/authRoutes.js";
import adminProductsRoutes from "./src/routes/admin/productsRoutes.js";
import adminInquiriesRoutes from "./src/routes/admin/inquiriesRoutes.js";
import dashboardRoutes from "./src/routes/admin/dashboardRoutes.js";

// Routes - Public
import publicProductsRoutes from "./src/routes/public/productsRoutes.js";
import publicInquiriesRoutes from "./src/routes/public/inquiriesRoutes.js";
import statsRoutes from "./src/routes/public/statsRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CHANGE 1: Secure and allow your specific GitHub Pages live link
app.use(cors({
  origin: [
    'https://rhearods.github.io',
    'http://localhost:5173' // Keeps it working for your local testing too!
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Admin Routes
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/products", adminProductsRoutes);
app.use("/api/admin/inquiries", adminInquiriesRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

// Public Routes
app.use("/api/public/products", publicProductsRoutes);
app.use("/api/public/inquiries", publicInquiriesRoutes);
app.use("/api/public/stats", statsRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Aaradhya IT Solutions Backend Running!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
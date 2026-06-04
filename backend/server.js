import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { db } from "./src/db/index.js"
import { systemConfigTable } from "./src/db/schema.js"

// Routes - Admin
import authRoutes from "./src/routes/admin/authRoutes.js";
import adminProductsRoutes from "./src/routes/admin/productsRoutes.js";
import adminInquiriesRoutes from "./src/routes/admin/inquiriesRoutes.js";
import dashboardRoutes from "./src/routes/admin/dashboardRoutes.js";
import categoriesRoutes from "./src/routes/admin/categoriesRoutes.js";
import settingsRoutes from "./src/routes/admin/settingsRoutes.js";

// Routes - Public
import publicProductsRoutes from "./src/routes/public/productsRoutes.js";
import publicInquiriesRoutes from "./src/routes/public/inquiriesRoutes.js";
import statsRoutes from "./src/routes/public/statsRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',  // ← add this
    'https://rhearods.github.io'
  ],
  credentials: true
}));

app.use(express.json());

// Admin Routes
app.use("/api/admin/auth", authRoutes);
app.use("/api/admin/products", adminProductsRoutes);
app.use("/api/admin/inquiries", adminInquiriesRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/categories", categoriesRoutes);
app.use("/api/admin/settings", settingsRoutes);

// Public Routes
app.use("/api/public/products", publicProductsRoutes);
app.use("/api/public/inquiries", publicInquiriesRoutes);
app.use("/api/public/stats", statsRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Aaradhya IT Solutions Backend Running!" });
});

// Download Catalogue Proxy
app.get("/api/download-catalogue", async (req, res) => {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'No URL provided' })
  
  try {
    const response = await fetch(url)
    const buffer = await response.arrayBuffer()
    const filename = url.split('/').pop() || 'catalogue.pdf'
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Type', 'application/pdf')
    res.send(Buffer.from(buffer))
  } catch (err) {
    res.status(500).json({ error: 'Download failed' })
  }
})

app.get("/api/public/maintenance", async (req, res) => {
  try {
    const { db } = await import("./src/db/index.js")
    const { systemConfigTable } = await import("./src/db/schema.js")
    const rows = await db.select().from(systemConfigTable).limit(1)
    res.json({ maintenanceMode: rows[0]?.maintenance_mode || false })
  } catch {
    res.json({ maintenanceMode: false })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

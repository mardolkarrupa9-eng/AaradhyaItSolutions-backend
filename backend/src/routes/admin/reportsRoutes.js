import express from "express";
import { exportInquiries, exportProducts } from "../../controllers/admin/reportsController.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get("/inquiries", auth, exportInquiries);
router.get("/products",  auth, exportProducts);

export default router;
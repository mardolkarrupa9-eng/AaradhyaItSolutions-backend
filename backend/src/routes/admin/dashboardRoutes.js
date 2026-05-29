import express from "express";
import { getDashboardData } from "../../controllers/admin/dashboardController.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getDashboardData);

export default router;
import express from "express";
import { getCompanyInfo } from "../../controllers/public/companyInfoController.js";

const router = express.Router();

router.get("/", getCompanyInfo);

export default router;
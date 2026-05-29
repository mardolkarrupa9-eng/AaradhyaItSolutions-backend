import express from "express";
import { submitInquiry } from "../../controllers/public/inquiriesController.js";

const router = express.Router();

router.post("/", submitInquiry);

export default router;
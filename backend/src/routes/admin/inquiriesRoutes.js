import express from "express";
import {
  getInquiries,
  updateInquiryStatus,
  deleteInquiry
} from "../../controllers/admin/inquiriesController.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getInquiries);
router.patch("/:id/status", auth, updateInquiryStatus);
router.delete("/:id", auth, deleteInquiry);

export default router;
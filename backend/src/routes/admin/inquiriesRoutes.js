import express from "express";
import {
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
  getNewInquiriesCount
} from "../../controllers/admin/inquiriesController.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getInquiries);
router.get("/new-count", auth, getNewInquiriesCount);
router.patch("/:id/status", auth, updateInquiryStatus);
router.delete("/:id", auth, deleteInquiry);

export default router;
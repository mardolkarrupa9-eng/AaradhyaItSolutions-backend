import express from "express";
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
  getActiveAnnouncement,
} from "../../controllers/admin/announcementsController.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

// ─── PUBLIC (no auth) ─────────────────────────────
// Customer site calls this to show the ticker
router.get("/public/active", getActiveAnnouncement);

// ─── ADMIN (auth required) ────────────────────────
router.get("/",            auth, getAnnouncements);
router.post("/",           auth, createAnnouncement);
router.put("/:id",         auth, updateAnnouncement);
router.patch("/:id/toggle", auth, toggleAnnouncement);
router.delete("/:id",      auth, deleteAnnouncement);

export default router;
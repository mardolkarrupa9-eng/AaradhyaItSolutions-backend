import express from "express";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() })
import {
  getProfile, updateProfile, updatePassword,
  getCompany, updateCompany,
  getNotifications, updateNotifications,
  getSystem, updateSystem,
  uploadLogo,
  createBackup, listBackups, downloadBackup, restoreBackup, deleteBackup, clearCache
} from "../../controllers/admin/settingsController.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

router.put("/password", auth, updatePassword);

router.get("/company", auth, getCompany);
router.put("/company", auth, updateCompany);

router.get("/notifications", auth, getNotifications);
router.put("/notifications", auth, updateNotifications);

router.get("/system", auth, getSystem);
router.put("/system", auth, updateSystem);
router.post("/upload-logo", auth, upload.single("file"), uploadLogo);
router.post("/backup", auth, createBackup);
router.get("/backups", auth, listBackups);
router.get("/backups/:id/download", auth, downloadBackup);
router.post("/backups/:id/restore", auth, restoreBackup);
router.delete("/backups/:id", auth, deleteBackup);
router.post("/clear-cache", auth, clearCache);

export default router;
import express from "express";
import multer from "multer";
const upload = multer({ storage: multer.memoryStorage() })
import {
  getProfile, updateProfile, updatePassword,
  getCompany, updateCompany,
  getNotifications, updateNotifications,
  getSystem, updateSystem,
  uploadLogo
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

export default router;
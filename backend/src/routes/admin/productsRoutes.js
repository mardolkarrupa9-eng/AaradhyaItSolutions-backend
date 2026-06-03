import express from "express";
import multer from "multer";
import {
  getProducts, getProduct, addProduct,
  updateProduct, deleteProduct, deleteProducts,
  toggleProductActive
} from "../../controllers/admin/productsController.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

// Multer — memory storage (no disk, we stream to Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max per file
});

const uploadFields = upload.fields([
  { name: "image",    maxCount: 1 },
  { name: "catalogue", maxCount: 1 },
  { name: "images",   maxCount: 10 }
]);

router.get("/",          auth, getProducts);
router.get("/:id",       auth, getProduct);
router.post("/",         auth, uploadFields, addProduct);
router.put("/:id",       auth, uploadFields, updateProduct);
router.delete("/bulk",   auth, deleteProducts);
router.delete("/:id",    auth, deleteProduct);
router.patch("/:id/toggle", auth, toggleProductActive);

export default router;
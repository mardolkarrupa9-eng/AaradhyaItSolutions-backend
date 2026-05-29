import express from "express";
import {
  getProducts,
  getProduct,
  addProduct,
  deleteProduct,
  deleteProducts
} from "../../controllers/admin/productsController.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getProducts);
router.get("/:id", auth, getProduct);
router.post("/", auth, addProduct);
router.delete("/bulk", auth, deleteProducts);
router.delete("/:id", auth, deleteProduct);

export default router;
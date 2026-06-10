import express from "express";
import {
  getProducts,
  getProduct
} from "../../controllers/public/productsController.js";
import { getCategories } from "../../controllers/public/categoriesController.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/", getProducts);
router.get("/:id", getProduct);

export default router;
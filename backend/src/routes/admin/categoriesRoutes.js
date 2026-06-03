import express from "express";
import {
  getCategories,
  addCategory,
  deleteCategory
} from "../../controllers/admin/categoriesController.js";
import auth from "../../middleware/auth.js";

const router = express.Router();

router.get("/",     auth, getCategories);
router.post("/",    auth, addCategory);
router.delete("/:id", auth, deleteCategory);

export default router;
import { db } from "../../db/index.js";
import { categoryTable, productTable } from "../../db/schema.js";
import { eq, count } from "drizzle-orm";

// GET all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await db
      .select()
      .from(categoryTable);

    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST add new category
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const [newCategory] = await db
      .insert(categoryTable)
      .values({ name })
      .returning();

    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE category (only if no products attached)
export const deleteCategory = async (req, res) => {
  try {
    const cat_id = parseInt(req.params.id);

    // check if any products use this category
    const [productCount] = await db
      .select({ count: count() })
      .from(productTable)
      .where(eq(productTable.cat_id, cat_id));

    if (Number(productCount.count) > 0) {
      return res.status(400).json({
        message: "Cannot delete — products are attached to this category"
      });
    }

    await db
      .delete(categoryTable)
      .where(eq(categoryTable.cat_id, cat_id));

    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
import { db } from "../../db/index.js";
import { categoryTable } from "../../db/schema.js";

console.log("categoriesController loaded");

export const getCategories = async (req, res) => {
  try {
    const categories = await db.select().from(categoryTable);
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
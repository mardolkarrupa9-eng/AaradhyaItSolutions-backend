import { db } from "../../db/index.js";
import { productTable } from "../../db/schema.js";
import { eq, count } from "drizzle-orm";

// GET homepage stats
export const getStats = async (req, res) => {
  try {
    const [productCount] = await db
      .select({ count: count() })
      .from(productTable)
      .where(eq(productTable.is_active, true));

    res.json({
      success: true,
      data: {
        businessesServed: 500,
        yearsExperience:  10,
        totalProducts:    Number(productCount.count),
        support:          "24/7"
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
import { products } from "../../data/products.js";
import { inquiries } from "../../data/inquiries.js";

// GET home page stats (animated counter)
export const getStats = (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        businessesServed: 500,
        yearsExperience: 10,
        totalProducts: products.length,
        support: "24/7"
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
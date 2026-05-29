import { products } from "../../data/products.js";
import { inquiries } from "../../data/inquiries.js";
import { reviews } from "../../data/reviews.js";

// GET dashboard stats + recent data
export const getDashboardData = (req, res) => {
  try {
    // Stats
    const totalProducts = products.length;
    const totalInquiries = inquiries.length;
    const avgRating = reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

    // Recent inquiries (last 3)
    const recentInquiries = inquiries.slice(0, 3).map(i => ({
      id: i.id,
      product: i.product,
      method: i.method,
      time: i.time,
      status: i.status
    }));

    // Recently added products (last 3)
    const recentProducts = products.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      type: p.type
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalInquiries,
          avgRating,
          experience: "10+"
        },
        recentInquiries,
        recentProducts
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
import { db } from "../../db/index.js";
import { productTable, inquiryTable, categoryTable } from "../../db/schema.js";
import { eq, count, desc } from "drizzle-orm";

export const getDashboardData = async (req, res) => {
  try {
    const [productCount] = await db
      .select({ count: count() })
      .from(productTable)
      .where(eq(productTable.is_active, true));

    const [inquiryCount] = await db
      .select({ count: count() })
      .from(inquiryTable);

    const rawInquiries = await db
      .select({
        inquiry_id: inquiryTable.inquiry_id,
        product:    productTable.name,
        method:     inquiryTable.method,
        inq_date:   inquiryTable.inq_date,
        status:     inquiryTable.status,
      })
      .from(inquiryTable)
      .leftJoin(productTable, eq(inquiryTable.prod_id, productTable.prod_id))
      .orderBy(desc(inquiryTable.inq_date))
      .limit(3);

    const recentInquiries = rawInquiries.map(i => ({
      id:      i.inquiry_id,
      product: i.product || "General Inquiry",
      method:  i.method,
      time:    i.inq_date
               ? new Date(i.inq_date).toLocaleDateString('en-IN', {
                   day: '2-digit', month: 'short'
                 }) + ', ' + new Date(i.inq_date).toLocaleTimeString('en-IN', {
                   hour: '2-digit', minute: '2-digit'
                 })
               : "",
      status:  i.status,
    }));

    const rawProducts = await db
  .select({
    prod_id:    productTable.prod_id,
    name:       productTable.name,
    type:       productTable.type,
    category:   categoryTable.name,
    image_path: productTable.image_path,
  })
      .from(productTable)
      .leftJoin(categoryTable, eq(productTable.cat_id, categoryTable.cat_id))
      .orderBy(desc(productTable.created_at))
      .limit(3);

    const recentProducts = rawProducts.map(p => ({
  id:         p.prod_id,
  name:       p.name,
  type:       p.type,
  category:   p.category || "",
  image_path: p.image_path || "",
}));

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts:  Number(productCount.count),
          totalInquiries: Number(inquiryCount.count),
          avgRating:      "4.9",
          experience:     "10+",
        },
        recentInquiries,
        recentProducts,
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
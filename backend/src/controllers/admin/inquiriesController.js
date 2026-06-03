import { db } from "../../db/index.js";
import { inquiryTable, productTable } from "../../db/schema.js";
import { eq, ilike, or, and, desc } from "drizzle-orm";

const formatTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short'
  }) + ', ' + new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
};

// GET all inquiries
export const getInquiries = async (req, res) => {
  try {
    const { status, search } = req.query;
    const conditions = [];

    if (status && status !== "All") {
      conditions.push(eq(inquiryTable.status, status));
    }
    if (search) {
      conditions.push(
        or(
          ilike(inquiryTable.full_name, `%${search}%`),
          ilike(inquiryTable.business_name, `%${search}%`),
          ilike(inquiryTable.phone_no, `%${search}%`)
        )
      );
    }

    let query = db
      .select({
        inquiry_id:    inquiryTable.inquiry_id,
        full_name:     inquiryTable.full_name,
        business_name: inquiryTable.business_name,
        phone_no:      inquiryTable.phone_no,
        message:       inquiryTable.message,
        status:        inquiryTable.status,
        method:        inquiryTable.method,
        inq_date:      inquiryTable.inq_date,
        product:       productTable.name,
      })
      .from(inquiryTable)
      .leftJoin(productTable, eq(inquiryTable.prod_id, productTable.prod_id))
      .orderBy(desc(inquiryTable.inq_date));

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const raw = await query;
    const inquiries = raw.map(i => ({
      id:            i.inquiry_id,
      inquiry_id:    i.inquiry_id,
      product:       i.product || "General Inquiry",
      method:        i.method || "Website",
      time:          formatTime(i.inq_date),
      status:        i.status,
      message:       i.message || "",
      full_name:     i.full_name,
      business_name: i.business_name || "",
      phone_no:      i.phone_no,
    }));

    res.json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH update status
export const updateInquiryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const inquiry_id = parseInt(req.params.id);
    const [updated] = await db
      .update(inquiryTable)
      .set({ status })
      .where(eq(inquiryTable.inquiry_id, inquiry_id))
      .returning();
    if (!updated) return res.status(404).json({ message: "Inquiry not found" });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE inquiry
export const deleteInquiry = async (req, res) => {
  try {
    const inquiry_id = parseInt(req.params.id);
    const [deleted] = await db
      .delete(inquiryTable)
      .where(eq(inquiryTable.inquiry_id, inquiry_id))
      .returning();
    if (!deleted) return res.status(404).json({ message: "Inquiry not found" });
    res.json({ success: true, message: "Inquiry deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
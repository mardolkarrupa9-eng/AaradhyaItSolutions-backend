import { db } from "../../db/index.js";
import { inquiryTable } from "../../db/schema.js";

export const submitInquiry = async (req, res) => {
  try {
    const { full_name, business_name, phone_no, message, prod_id, method } = req.body;

    if (!full_name || !phone_no) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    await db.insert(inquiryTable).values({
      full_name,
      business_name: business_name || null,
      phone_no,
      message:       message || null,
      prod_id:       prod_id || null,
      status:        "New",
      method:        method || "Website",
    });

    res.status(201).json({ success: true, message: "Inquiry submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
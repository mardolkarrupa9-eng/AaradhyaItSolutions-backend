import { inquiries } from "../../data/inquiries.js";

// POST submit contact form inquiry
export const submitInquiry = (req, res) => {
  try {
    const { name, business, phone, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    const newInquiry = {
      id: `INQ-${String(inquiries.length + 1).padStart(3, "0")}`,
      product: business || "General Inquiry",
      method: "Website",
      message: message || "",
      name,
      business: business || "",
      phone,
      time: new Date().toLocaleString("en-IN"),
      status: "New"
    };

    inquiries.unshift(newInquiry);
    res.status(201).json({ success: true, message: "Inquiry submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
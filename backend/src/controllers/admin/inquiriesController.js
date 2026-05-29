import { inquiries } from "../../data/inquiries.js";

// GET all inquiries
export const getInquiries = (req, res) => {
  try {
    res.json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE inquiry status
export const updateInquiryStatus = (req, res) => {
  try {
    const { status } = req.body;
    const index = inquiries.findIndex(i => i.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    inquiries[index].status = status;
    res.json({ success: true, data: inquiries[index] });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE inquiry
export const deleteInquiry = (req, res) => {
  try {
    const index = inquiries.findIndex(i => i.id === parseInt(req.params.id));

    if (index === -1) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    inquiries.splice(index, 1);
    res.json({ success: true, message: "Inquiry deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
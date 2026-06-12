import { db } from "../../db/index.js";
import { inquiryTable, productTable, categoryTable } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

// Helper: convert array of objects → CSV string
const toCSV = (headers, rows) => {
  const escape = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return str.includes(',') || str.includes('"') || str.includes('\n')
      ? `"${str}"`
      : str;
  };
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(h => escape(row[h])).join(','))
  ];
  return lines.join('\n');
};

// ─── GET /api/admin/reports/inquiries ─────────────
export const exportInquiries = async (req, res) => {
  try {
    const raw = await db
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

    const rows = raw.map(i => ({
      inquiry_id:    i.inquiry_id,
      full_name:     i.full_name,
      business_name: i.business_name || '',
      phone_no:      i.phone_no,
      product:       i.product || 'General Inquiry',
      method:        i.method,
      status:        i.status,
      message:       i.message || '',
      date:          i.inq_date
        ? new Date(i.inq_date).toLocaleString('en-IN')
        : '',
    }));

    const headers = [
      'inquiry_id', 'full_name', 'business_name', 'phone_no',
      'product', 'method', 'status', 'message', 'date'
    ];

    const csv = toCSV(headers, rows);
    const filename = `inquiries_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Export failed", error: error.message });
  }
};

// ─── GET /api/admin/reports/products ──────────────
export const exportProducts = async (req, res) => {
  try {
    const raw = await db
      .select({
        prod_id:    productTable.prod_id,
        name:       productTable.name,
        type:       productTable.type,
        short_desc: productTable.short_desc,
        is_active:  productTable.is_active,
        category:   categoryTable.name,
        created_at: productTable.created_at,
      })
      .from(productTable)
      .leftJoin(categoryTable, eq(productTable.cat_id, categoryTable.cat_id))
      .orderBy(desc(productTable.created_at));

    const rows = raw.map(p => ({
      prod_id:    p.prod_id,
      name:       p.name,
      type:       p.type,
      category:   p.category || '',
      short_desc: p.short_desc || '',
      status:     p.is_active ? 'Active' : 'Discontinued',
      created_at: p.created_at
        ? new Date(p.created_at).toLocaleString('en-IN')
        : '',
    }));

    const headers = [
      'prod_id', 'name', 'type', 'category',
      'short_desc', 'status', 'created_at'
    ];

    const csv = toCSV(headers, rows);
    const filename = `products_${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Export failed", error: error.message });
  }
};
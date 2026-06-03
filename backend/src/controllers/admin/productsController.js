import { db } from "../../db/index.js";
import {
  productTable,
  categoryTable,
  prodFeatureTable,
  prodSpecTable,
  productImageTable
} from "../../db/schema.js";
import { eq, ilike, or, desc, and, inArray } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Helper: upload a file buffer to Supabase Storage
const uploadToSupabase = async (file, folder = "main") => {
  if (!file) return null;
  const ext = file.originalname.split(".").pop();
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("products")
    .upload(fileName, file.buffer, { contentType: file.mimetype, upsert: false });
  if (error) throw new Error("Upload failed: " + error.message);
  const { data } = supabase.storage.from("products").getPublicUrl(fileName);
  return data.publicUrl;
};

// GET all products
export const getProducts = async (req, res) => {
  try {
    const { search, cat_id, type } = req.query;

    let query = db
      .select({
        prod_id:    productTable.prod_id,
        name:       productTable.name,
        type:       productTable.type,
        is_active:  productTable.is_active,
        image_path: productTable.image_path,
        created_at: productTable.created_at,
        category:   categoryTable.name,
        cat_id:     categoryTable.cat_id,
      })
      .from(productTable)
      .leftJoin(categoryTable, eq(productTable.cat_id, categoryTable.cat_id))
      .orderBy(desc(productTable.created_at));

    const conditions = [];
    if (search) {
      conditions.push(or(
        ilike(productTable.name, `%${search}%`),
        ilike(productTable.short_desc, `%${search}%`)
      ));
    }
    if (cat_id) conditions.push(eq(productTable.cat_id, parseInt(cat_id)));
    if (type && type !== "All") conditions.push(eq(productTable.type, type));
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const products = await query;
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET single product
export const getProduct = async (req, res) => {
  try {
    const prod_id = parseInt(req.params.id);
    const [product] = await db.select().from(productTable).where(eq(productTable.prod_id, prod_id));
    if (!product) return res.status(404).json({ message: "Product not found" });

    const features = await db.select().from(prodFeatureTable).where(eq(prodFeatureTable.prod_id, prod_id));
    const specs = await db.select().from(prodSpecTable).where(eq(prodSpecTable.prod_id, prod_id));
    const images = await db.select().from(productImageTable).where(eq(productImageTable.prod_id, prod_id));

    res.json({ success: true, data: { ...product, features, specs, images } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST add product
export const addProduct = async (req, res) => {
  try {
    const { name, cat_id, type, short_desc, full_desc, is_active, display_order, features, specs } = req.body;

    if (!name || !type) return res.status(400).json({ message: "Name and type are required" });

    // Upload main image
    const mainImageFile = req.files?.image?.[0];
    const image_path = mainImageFile ? await uploadToSupabase(mainImageFile, "main") : null;

    // Upload catalogue (optional)
    const catalogueFile = req.files?.catalogue?.[0];
    const catalogue_path = catalogueFile ? await uploadToSupabase(catalogueFile, "catalogues") : null;

    // Upload extra images (optional)
    const extraImageFiles = req.files?.images || [];

    const [newProduct] = await db.insert(productTable).values({
      name,
      cat_id: cat_id ? parseInt(cat_id) : null,
      type,
      short_desc,
      full_desc,
      image_path,
      catalogue_path,
      is_active: is_active !== undefined ? is_active === "true" : true,
      display_order: display_order ? parseInt(display_order) : 0
    }).returning();

    const prod_id = newProduct.prod_id;

    // Parse and insert features
    let featuresArr = [];
    try { featuresArr = JSON.parse(features || "[]"); } catch {}
    if (featuresArr.length > 0) {
      await db.insert(prodFeatureTable).values(
        featuresArr.filter(f => f.trim()).map(f => ({ prod_id, feature_text: f }))
      );
    }

    // Parse and insert specs
    let specsArr = [];
    try { specsArr = JSON.parse(specs || "[]"); } catch {}
    if (specsArr.length > 0) {
      await db.insert(prodSpecTable).values(
        specsArr.filter(s => s.spec_key?.trim()).map(s => ({ prod_id, spec_key: s.spec_key, spec_value: s.spec_value }))
      );
    }

    // Sync gallery images — delete removed ones, keep existing, add new
await db.delete(productImageTable).where(eq(productImageTable.prod_id, prod_id))

let existingGalleryArr = []
try { existingGalleryArr = JSON.parse(req.body.existing_gallery || '[]') } catch {}

if (existingGalleryArr.length > 0) {
  await db.insert(productImageTable).values(
    existingGalleryArr.map((url) => ({ prod_id, img_path: url }))
  )
}

// Upload and insert extra images
    if (extraImageFiles.length > 0) {
      const uploadedUrls = await Promise.all(extraImageFiles.map(f => uploadToSupabase(f, "gallery")));
      await db.insert(productImageTable).values(
        uploadedUrls.filter(Boolean).map(url => ({ prod_id, img_path: url }))
      );
    }

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PUT update product
export const updateProduct = async (req, res) => {
  try {
    const prod_id = parseInt(req.params.id);
    const { name, cat_id, type, short_desc, full_desc, is_active, display_order, features, specs, existing_image, existing_catalogue } = req.body;

    if (!name || !type) return res.status(400).json({ message: "Name and type are required" });

    // Upload new main image if provided, else keep existing
    const mainImageFile = req.files?.image?.[0];
    const image_path = mainImageFile ? await uploadToSupabase(mainImageFile, "main") : existing_image || null;

    // Upload new catalogue if provided, else keep existing
    const catalogueFile = req.files?.catalogue?.[0];
    const catalogue_path = catalogueFile ? await uploadToSupabase(catalogueFile, "catalogues") : existing_catalogue || null;

    // Extra images
    const extraImageFiles = req.files?.images || [];

    const [updatedProduct] = await db.update(productTable).set({
      name,
      cat_id: cat_id ? parseInt(cat_id) : null,
      type,
      short_desc,
      full_desc,
      image_path,
      catalogue_path,
      is_active: is_active !== undefined ? is_active === "true" : true,
      display_order: display_order ? parseInt(display_order) : 0
    }).where(eq(productTable.prod_id, prod_id)).returning();

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    // Replace features
    await db.delete(prodFeatureTable).where(eq(prodFeatureTable.prod_id, prod_id));
    let featuresArr = [];
    try { featuresArr = JSON.parse(features || "[]"); } catch {}
    if (featuresArr.length > 0) {
      await db.insert(prodFeatureTable).values(
        featuresArr.filter(f => f.trim()).map(f => ({ prod_id, feature_text: f }))
      );
    }

    // Replace specs
    await db.delete(prodSpecTable).where(eq(prodSpecTable.prod_id, prod_id));
    let specsArr = [];
    try { specsArr = JSON.parse(specs || "[]"); } catch {}
    if (specsArr.length > 0) {
      await db.insert(prodSpecTable).values(
        specsArr.filter(s => s.spec_key?.trim()).map(s => ({ prod_id, spec_key: s.spec_key, spec_value: s.spec_value }))
      );
    }

    // Sync gallery images — delete removed ones, keep existing, add new
    await db.delete(productImageTable).where(eq(productImageTable.prod_id, prod_id));

    let existingGalleryArr = [];
    try { existingGalleryArr = JSON.parse(req.body.existing_gallery || '[]'); } catch {}

    if (existingGalleryArr.length > 0) {
      await db.insert(productImageTable).values(
        existingGalleryArr.map((url) => ({ prod_id, img_path: url }))
      );
    }

    if (extraImageFiles.length > 0) {
      const uploadedUrls = await Promise.all(extraImageFiles.map(f => uploadToSupabase(f, "gallery")));
      await db.insert(productImageTable).values(
        uploadedUrls.filter(Boolean).map(url => ({ prod_id, img_path: url }))
      );
    }

    res.json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE single product
export const deleteProduct = async (req, res) => {
  try {
    const prod_id = parseInt(req.params.id);
    // Delete related records first
    await db.delete(prodFeatureTable).where(eq(prodFeatureTable.prod_id, prod_id));
    await db.delete(prodSpecTable).where(eq(prodSpecTable.prod_id, prod_id));
    await db.delete(productImageTable).where(eq(productImageTable.prod_id, prod_id));
    const [deleted] = await db.delete(productTable).where(eq(productTable.prod_id, prod_id)).returning();
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE bulk products
export const deleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) return res.status(400).json({ message: "ids array is required" });
    await db.delete(productTable).where(inArray(productTable.prod_id, ids));
    res.json({ success: true, message: "Products deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// PATCH toggle is_active
export const toggleProductActive = async (req, res) => {
  try {
    const prod_id = parseInt(req.params.id)
    const { is_active } = req.body

    const [updated] = await db
      .update(productTable)
      .set({ is_active })
      .where(eq(productTable.prod_id, prod_id))
      .returning()

    if (!updated) return res.status(404).json({ message: "Product not found" })
    res.json({ success: true, data: updated })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
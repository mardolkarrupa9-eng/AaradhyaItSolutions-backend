import { db } from "../../db/index.js";
import {
  productTable, categoryTable,
  prodFeatureTable, prodSpecTable, productImageTable
} from "../../db/schema.js";
import { eq, ilike, or, and, ne } from "drizzle-orm";

// GET all products
export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const conditions = [eq(productTable.is_active, true)];

    if (search) {
      conditions.push(
        or(
          ilike(productTable.name, `%${search}%`),
          ilike(productTable.short_desc, `%${search}%`)
        )
      );
    }

    if (category && category !== "All") {
      conditions.push(ilike(categoryTable.name, category));
    }

    const raw = await db
      .select({
        prod_id:    productTable.prod_id,
        name:       productTable.name,
        type:       productTable.type,
        short_desc: productTable.short_desc,
        image_path: productTable.image_path,
        category:   categoryTable.name,
        cat_id:     categoryTable.cat_id,
      })
      .from(productTable)
      .leftJoin(categoryTable, eq(productTable.cat_id, categoryTable.cat_id))
      .where(and(...conditions));

    const products = raw.map(p => ({
      id:               p.prod_id,
      prod_id:          p.prod_id,
      name:             p.name,
      category:         p.category || "",
      type:             p.type,
      shortDescription: p.short_desc || "",
      image_path:       p.image_path || "",
    }));

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET single product
export const getProduct = async (req, res) => {
  try {
    const prod_id = parseInt(req.params.id);

    const [p] = await db
      .select({
        prod_id:        productTable.prod_id,
        name:           productTable.name,
        type:           productTable.type,
        short_desc:     productTable.short_desc,
        full_desc:      productTable.full_desc,
        image_path:     productTable.image_path,
        catalogue_path: productTable.catalogue_path,
        cat_id:         productTable.cat_id,
        category:       categoryTable.name,
      })
      .from(productTable)
      .leftJoin(categoryTable, eq(productTable.cat_id, categoryTable.cat_id))
      .where(eq(productTable.prod_id, prod_id));

    if (!p) return res.status(404).json({ message: "Product not found" });

    // features → string array
    const rawFeatures = await db
      .select()
      .from(prodFeatureTable)
      .where(eq(prodFeatureTable.prod_id, prod_id));
    const features = rawFeatures.map(f => f.feature_text);

    // specs → object for Object.entries()
    const rawSpecs = await db
      .select()
      .from(prodSpecTable)
      .where(eq(prodSpecTable.prod_id, prod_id));
    const specs = {};
    rawSpecs.forEach(s => { specs[s.spec_key] = s.spec_value; });

    // side images
    const rawImages = await db
      .select()
      .from(productImageTable)
      .where(eq(productImageTable.prod_id, prod_id));
    const images = rawImages.map(i => i.img_path);

    // similar products → by SAME CATEGORY
    const rawSimilar = await db
      .select({
        prod_id:    productTable.prod_id,
        name:       productTable.name,
        short_desc: productTable.short_desc,
        image_path: productTable.image_path,
        category:   categoryTable.name,
        type:       productTable.type,
      })
      .from(productTable)
      .leftJoin(categoryTable, eq(productTable.cat_id, categoryTable.cat_id))
      .where(
        and(
          eq(productTable.cat_id, p.cat_id),
          eq(productTable.is_active, true),
          ne(productTable.prod_id, prod_id)
        )
      )
      .limit(3);

    const similar = rawSimilar.map(s => ({
      id:               s.prod_id,
      prod_id:          s.prod_id,
      name:             s.name,
      category:         s.category || "",
      type:             s.type,
      shortDescription: s.short_desc || "",
      image_path:       s.image_path || "",
    }));

    res.json({
      success: true,
      data: {
        id:              p.prod_id,
        prod_id:         p.prod_id,
        name:            p.name,
        category:        p.category || "",
        type:            p.type,
        fullDescription: p.full_desc || "",
        shortDescription: p.short_desc || "",
        image_path:      p.image_path || "",
        catalogue_path:  p.catalogue_path || "",
        features,
        specs,
        images,
      },
      similar,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
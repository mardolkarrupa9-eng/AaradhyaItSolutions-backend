import { products } from "../../data/products.js";

// GET all products (with search + filter)
export const getProducts = (req, res) => {
  try {
    const { search, category, type } = req.query;
    let result = [...products];

    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category && category !== "All") {
      result = result.filter(p =>
        p.category === category || p.type === category
      );
    }

    if (type && type !== "All") {
      result = result.filter(p => p.type === type);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET single product by id
export const getProduct = (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Similar products (same category or type, exclude current)
    const similar = products
      .filter(p => p.id !== product.id &&
        (p.category === product.category || p.type === product.type))
      .slice(0, 3);

    res.json({ success: true, data: product, similar });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
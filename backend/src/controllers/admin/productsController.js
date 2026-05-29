import { products } from "../../data/products.js";

// GET all products
export const getProducts = (req, res) => {
  try {
    const { search, type } = req.query;
    let result = [...products];

    if (search) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
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

// GET single product
export const getProduct = (req, res) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST add product
export const addProduct = (req, res) => {
  try {
    const { id, name, category, type, shortDescription, fullDescription, features, specs } = req.body;

    if (!name || !shortDescription) {
      return res.status(400).json({ message: "Name and short description are required" });
    }

    const newProduct = {
      id: id || `PRD-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      category,
      type,
      shortDescription,
      fullDescription: fullDescription || shortDescription,
      features: features || [],
      specs: specs || { os: "", ram: "", storage: "" },
      icon: "inventory_2"
    };

    products.unshift(newProduct);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE single product
export const deleteProduct = (req, res) => {
  try {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ message: "Product not found" });
    }
    products.splice(index, 1);
    res.json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE multiple products (bulk)
export const deleteProducts = (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ message: "ids array is required" });
    }
    ids.forEach(id => {
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) products.splice(index, 1);
    });
    res.json({ success: true, message: "Products deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET dashboard stats + recent data
export const getDashboardData = (req, res) => {
  try {
    const recentProducts = products.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      category: p.category,
      type: p.type
    }));
    res.json({ success: true, data: { totalProducts: products.length, recentProducts } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
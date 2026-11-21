const mongoose = require("mongoose");
const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

const allowedFields = ["name", "sku", "category", "price", "quantity", "reorderLevel", "supplier"];

function validateId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, message: "Product created", product });
});

// GET /api/products?page=1&limit=10&sortBy=name&order=asc&category=Stationery&search=pen
exports.getProducts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const sortBy = ["name", "sku", "category", "price", "quantity", "createdAt"].includes(req.query.sortBy)
    ? req.query.sortBy : "createdAt";
  const order = req.query.order === "asc" ? 1 : -1;
  const filter = {};

  if (req.query.category) filter.category = new RegExp(`^${escapeRegex(req.query.category)}$`, "i");
  if (req.query.minPrice !== undefined || req.query.maxPrice !== undefined) {
    filter.price = {};
    if (req.query.minPrice !== undefined) {
      const n = Number(req.query.minPrice);
      if (!Number.isFinite(n) || n < 0) return res.status(400).json({ success: false, message: "minPrice must be a non-negative number" });
      filter.price.$gte = n;
    }
    if (req.query.maxPrice !== undefined) {
      const n = Number(req.query.maxPrice);
      if (!Number.isFinite(n) || n < 0) return res.status(400).json({ success: false, message: "maxPrice must be a non-negative number" });
      filter.price.$lte = n;
    }
    if (filter.price.$gte !== undefined && filter.price.$lte !== undefined && filter.price.$gte > filter.price.$lte)
      return res.status(400).json({ success: false, message: "minPrice cannot exceed maxPrice" });
  }
  if (req.query.lowStock === "true") filter.$expr = { $lte: ["$quantity", "$reorderLevel"] };
  if (req.query.search) {
    const search = new RegExp(escapeRegex(req.query.search), "i");
    filter.$or = [{ name: search }, { sku: search }, { supplier: search }];
  }

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ [sortBy]: order }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter)
  ]);
  res.status(200).json({
    success: true, total, page, limit, totalPages: Math.ceil(total / limit),
    count: products.length, products
  });
});

// GET /api/products/:id
exports.getProductById = asyncHandler(async (req, res) => {
  if (!validateId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.status(200).json({ success: true, product });
});

// PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  if (!validateId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
  const updates = {};
  for (const field of allowedFields) if (req.body[field] !== undefined) updates[field] = req.body[field];
  if (!Object.keys(updates).length) return res.status(400).json({ success: false, message: "Provide at least one valid product field" });
  const product = await Product.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true, context: "query"
  });
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.status(200).json({ success: true, message: "Product updated", product });
});

// DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  if (!validateId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.status(200).json({ success: true, message: "Product deleted", id: product._id });
});

// GET /api/products/low-stock
exports.getLowStockProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ $expr: { $lte: ["$quantity", "$reorderLevel"] } }).sort({ quantity: 1 });
  res.status(200).json({ success: true, count: products.length, lowStockItems: products });
});

// GET /api/products/summary
exports.getCategorySummary = asyncHandler(async (req, res) => {
  const summary = await Product.aggregate([
    { $group: {
      _id: "$category",
      totalItems: { $sum: 1 },
      totalQuantity: { $sum: "$quantity" },
      totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
      avgPrice: { $avg: "$price" }
    }},
    { $sort: { _id: 1 } },
    { $project: {
      _id: 0, category: "$_id", totalItems: 1, totalQuantity: 1,
      totalStockValue: { $round: ["$totalStockValue", 2] },
      avgPrice: { $round: ["$avgPrice", 2] }
    }}
  ]);
  res.status(200).json({ success: true, categories: summary.length, summary });
});

// PATCH /api/products/:id/stock  body: { "change": 5 } or { "change": -2 }
exports.adjustStock = asyncHandler(async (req, res) => {
  if (!validateId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid product ID" });
  const change = req.body.change;
  if (!Number.isInteger(change) || change === 0)
    return res.status(400).json({ success: false, message: "change must be a non-zero integer" });

  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, quantity: { $gte: Math.max(0, -change) } },
    { $inc: { quantity: change } },
    { new: true, runValidators: true }
  );
  if (product) return res.status(200).json({ success: true, message: "Stock updated", product });

  const exists = await Product.exists({ _id: req.params.id });
  if (!exists) return res.status(404).json({ success: false, message: "Product not found" });
  return res.status(400).json({ success: false, message: "Insufficient stock: quantity cannot become negative" });
});

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

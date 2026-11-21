const express = require("express");
const productRoutes = require("./routes/productRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const app = express();
app.use(express.json({ limit: "1mb" }));
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Inventory and Data Management System API",
    endpoints: "/api/products"
  });
});
app.use("/api/products", productRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

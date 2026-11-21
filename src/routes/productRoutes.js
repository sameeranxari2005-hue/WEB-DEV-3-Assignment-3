const express = require("express");
const controller = require("../controllers/productController");

const router = express.Router();

router.route("/").post(controller.createProduct).get(controller.getProducts);
router.get("/low-stock", controller.getLowStockProducts);
router.get("/summary", controller.getCategorySummary);
router.get("/:id", controller.getProductById);
router.put("/:id", controller.updateProduct);
router.delete("/:id", controller.deleteProduct);
router.patch("/:id/stock", controller.adjustStock);

module.exports = router;

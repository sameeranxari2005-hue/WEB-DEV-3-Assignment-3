const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, "Product name is required"],
    trim: true, minlength: [2, "Name must be at least 2 characters"],
    maxlength: [100, "Name cannot exceed 100 characters"]
  },
  sku: {
    type: String, required: [true, "SKU is required"], unique: true,
    trim: true, uppercase: true, minlength: 2, maxlength: 40,
    match: [/^[A-Z0-9-]+$/, "SKU may contain only letters, numbers and hyphens"]
  },
  category: {
    type: String, required: [true, "Category is required"],
    trim: true, minlength: 2, maxlength: 60
  },
  price: {
    type: Number, required: [true, "Price is required"],
    min: [0, "Price cannot be negative"], validate: {
      validator: Number.isFinite, message: "Price must be a finite number"
    }
  },
  quantity: {
    type: Number, required: [true, "Quantity is required"],
    min: [0, "Quantity cannot be negative"],
    validate: { validator: Number.isInteger, message: "Quantity must be an integer" }
  },
  reorderLevel: {
    type: Number, required: [true, "Reorder level is required"],
    min: [0, "Reorder level cannot be negative"],
    validate: { validator: Number.isInteger, message: "Reorder level must be an integer" }
  },
  supplier: {
    type: String, required: [true, "Supplier is required"],
    trim: true, minlength: 2, maxlength: 100
  }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual("stockValue").get(function () {
  return this.price * this.quantity;
});

module.exports = mongoose.model("Product", productSchema);

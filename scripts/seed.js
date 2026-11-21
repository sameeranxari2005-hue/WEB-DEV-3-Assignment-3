require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../src/models/Product");

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error("Set MONGODB_URI in .env first");
  await mongoose.connect(process.env.MONGODB_URI);
  const products = JSON.parse(fs.readFileSync(path.join(__dirname, "../sample-data/products.json"), "utf8"));
  for (const item of products) {
    await Product.updateOne({ sku: item.sku }, { $set: item }, { upsert: true, runValidators: true });
  }
  console.log(`Seeded ${products.length} sample products (existing sample SKUs updated).`);
  await mongoose.disconnect();
}
seed().catch(async error => {
  console.error(error.message);
  await mongoose.disconnect();
  process.exit(1);
});

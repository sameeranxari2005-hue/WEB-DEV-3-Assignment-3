const test = require("node:test");
const assert = require("node:assert/strict");
const Product = require("../src/models/Product");

test("product schema requires all required fields", async () => {
  const product = new Product({});
  await assert.rejects(product.validate(), error => {
    assert.equal(error.name, "ValidationError");
    for (const field of ["name", "sku", "category", "price", "quantity", "reorderLevel", "supplier"])
      assert.ok(error.errors[field], `Expected ${field} validation error`);
    return true;
  });
});

test("product schema rejects negative quantity and invalid SKU", async () => {
  const product = new Product({
    name: "Test Item", sku: "bad sku!", category: "Test",
    price: 10, quantity: -1, reorderLevel: 2, supplier: "Supplier"
  });
  await assert.rejects(product.validate(), error => {
    assert.ok(error.errors.sku);
    assert.ok(error.errors.quantity);
    return true;
  });
});

test("product schema accepts valid inventory record and calculates stock value", async () => {
  const product = new Product({
    name: "Test Item", sku: "TEST-001", category: "Test",
    price: 12.5, quantity: 4, reorderLevel: 2, supplier: "Supplier"
  });
  await product.validate();
  assert.equal(product.stockValue, 50);
});

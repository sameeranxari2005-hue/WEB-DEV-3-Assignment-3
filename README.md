# Inventory and Data Management System

## Student Details

| Detail | Information |
|---|---|
| Name | Sameer |
| Roll Number | 2501010107 |
| University | K.R. Mangalam University (KRMU) |
| Course | B.Tech CSE Core |
| Subject | Web Development III |
| Assignment | Assignment 3 (Unit 3) |

---

## 1. Project Overview

The Inventory and Data Management System is a backend REST API developed to manage product information, inventory quantities, stock updates, and category-wise inventory reports.

The project is built using:

- Node.js
- Express.js
- MongoDB
- Mongoose
- dotenv

**Note:** This assignment implements backend functionality only. It does not include a frontend or admin panel.

## 2. Project Features

- Create new products.
- Retrieve all products.
- Retrieve a product using its ID.
- Update existing product details.
- Delete products.
- Search products by name, SKU, or supplier.
- Filter products by category and price.
- Sort and paginate product records.
- Identify low-stock products.
- Generate category-wise inventory summaries.
- Increase or decrease product stock.
- Validate product information.
- Prevent duplicate product SKUs.
- Prevent stock quantities from becoming negative.

## 3. Requirements

Before running the project, install:

- Node.js 18 or later
- npm
- MongoDB Atlas account or MongoDB Community Server
- Visual Studio Code

## 4. Installation and Setup

### Step 1: Open the project

Extract the project ZIP file and open the project folder in Visual Studio Code.

### Step 2: Install dependencies

Open the VS Code terminal and execute:

```bash
npm install
```

### Step 3: Configure environment variables

Create a `.env` file by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and configure your MongoDB connection:

```env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
NODE_ENV=development
```

Replace `your_mongodb_connection_string` with your own MongoDB connection string.

**Important:** Never upload your `.env` file or MongoDB password to GitHub.

### Step 4: Start the application

Run:

```bash
npm start
```

The server will run at:

```text
http://localhost:5001
```

API base URL:

```text
http://localhost:5001/api/products
```

## 5. Seed Sample Products

To insert the sample product records provided with the project, open another terminal and execute:

```bash
npm run seed
```

This script inserts or updates sample products using their SKU.

## 6. Product Fields and Validation

| Field | Description |
|---|---|
| name | Required product name |
| sku | Required unique product SKU |
| category | Product category |
| price | Product price; minimum 0 |
| quantity | Available stock; non-negative integer |
| reorderLevel | Minimum stock threshold |
| supplier | Supplier name |
| description | Optional product description |

The application validates product information and uses a unique MongoDB index to prevent duplicate SKUs.

Stock adjustments use a conditional database update to prevent inventory quantities from becoming negative.

## 7. API Endpoints

All endpoints use JSON responses.

Base URL:

```text
http://localhost:5001/api/products
```

### 7.1 Create Product

**Method:** POST

**Endpoint:**

```text
/api/products
```

Example request body:

```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```

Expected status: `201 Created`

### 7.2 Get All Products

**Method:** GET

**Endpoint:**

```text
/api/products
```

Returns all products with pagination information.

### 7.3 Search, Filter, Sort and Pagination

**Method:** GET

Example:

```text
/api/products?category=Stationery&minPrice=50&maxPrice=500&search=pen&page=1&limit=5&sortBy=price&order=asc
```

Supported query parameters:

- `category` – Filter by category.
- `minPrice` – Minimum product price.
- `maxPrice` – Maximum product price.
- `search` – Search by product name, SKU, or supplier.
- `lowStock=true` – Filter low-stock products.
- `page` – Page number.
- `limit` – Number of products per page.
- `sortBy` – Sorting field.
- `order` – Ascending or descending order.

### 7.4 Get Product by ID

**Method:** GET

```text
/api/products/:id
```

Returns a single product using its MongoDB ID.

### 7.5 Update Product

**Method:** PUT

```text
/api/products/:id
```

Example request body:

```json
{
  "price": 140,
  "quantity": 60
}
```

Updates the specified product fields.

### 7.6 Delete Product

**Method:** DELETE

```text
/api/products/:id
```

Deletes the selected product.

### 7.7 Low-Stock Report

**Method:** GET

```text
/api/products/low-stock
```

Returns products whose quantity is less than or equal to their reorder level.

### 7.8 Category-Wise Inventory Summary

**Method:** GET

```text
/api/products/summary
```

Provides category-wise inventory information, including:

- Total number of products.
- Total quantity.
- Total stock value.
- Average product price.

This functionality uses MongoDB aggregation operations such as `$group`, `$sum`, `$avg`, `$multiply`, `$round`, and `$project`.

### 7.9 Adjust Product Stock

**Method:** PATCH

```text
/api/products/:id/stock
```

**Increase stock:**

```json
{
  "change": 10
}
```

**Decrease stock:**

```json
{
  "change": -3
}
```

A positive value increases stock, while a negative value decreases stock.

Zero or non-integer changes are rejected. The application also prevents stock from becoming negative.

## 8. Postman API Testing

The API can be tested using Postman.

1. Create a collection named `Inventory Management API`.
2. Set the base URL to `http://localhost:5001`.
3. Create requests using the HTTP methods mentioned above.
4. For POST, PUT, and PATCH requests, select Body → raw → JSON.
5. Create a product and copy its generated MongoDB ID.
6. Use the ID for GET, PUT, DELETE, and PATCH requests.
7. Test search, filtering, pagination, low-stock reports, and category summaries.
8. Test invalid product information and duplicate SKUs.

## 9. HTTP Status Codes

| Status Code | Description |
|---|---|
| 200 | Successful request |
| 201 | Product created successfully |
| 400 | Invalid input or validation error |
| 404 | Product or route not found |
| 409 | Duplicate SKU conflict |
| 500 | Internal server error |

## 10. Project Structure

```text
inventory-data-management-system/
│
├── server.js
├── package.json
├── package-lock.json
├── .env.example
├── .gitignore
├── README.md
│
├── sample-data/
│   └── products.json
│
├── scripts/
│   └── seed.js
│
├── test/
│   └── schema.test.js
│
└── src/
    ├── app.js
    │
    ├── config/
    │   └── db.js
    │
    ├── controllers/
    │   └── productController.js
    │
    ├── middleware/
    │   ├── asyncHandler.js
    │   └── errorMiddleware.js
    │
    ├── models/
    │   └── Product.js
    │
    └── routes/
        └── productRoutes.js
```

## 11. Running Tests

To run the project's schema validation tests, execute:

```bash
npm test
```

The API also requires a running MongoDB instance or a valid MongoDB Atlas connection string.

## 12. Security and Configuration

- Environment variables are stored in `.env`.
- `.env` is excluded from Git using `.gitignore`.
- `node_modules/` is excluded from GitHub.
- MongoDB credentials should remain private.
- Input validation is performed before database operations.

## 13. Conclusion

The Inventory and Data Management System demonstrates the implementation of a backend REST API using Node.js, Express.js, MongoDB, and Mongoose.

It provides essential inventory management functionality, including CRUD operations, stock adjustment, product searching, filtering, pagination, low-stock reporting, and category-wise aggregation.

The project demonstrates practical knowledge of backend development, REST API design, database integration, data validation, and inventory management.

---

**Submitted by:** Sameer  
**Roll Number:** 2501010107  
**K.R. Mangalam University**
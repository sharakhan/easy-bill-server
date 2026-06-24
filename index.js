require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Import Error Handlers
const {
  errorHandler,
  notFoundHandler,
} = require("./src/config/middlewares/errorHandler");



const app = express();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://easy-bills-clients.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Server is running fine!");
});

// MongoDB Setup
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Global DB Cache
let db;
let billCollection;
let paidBills;

async function connectDB() {
  if (!db) {
    await client.connect();

    db = client.db("easyBill");

    billCollection = db.collection("bill");
    paidBills = db.collection("paidBills");

    console.log("✅ MongoDB Connected");
  }

  return db;
}

// ================= ROUTES =================

// GET ALL BILLS
app.get("/bill", async (req, res, next) => {
  try {
    await connectDB();

    const result = await billCollection.find({}).toArray();

    res.send(result);
  } catch (error) {
    next(error);
  }
});

// GET BILL BY ID
app.get("/bill/:id", async (req, res, next) => {
  try {
    await connectDB();

    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      const error = new Error("Invalid Bill ID");
      error.statusCode = 400;
      throw error;
    }

    const bill = await billCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!bill) {
      const error = new Error("Bill not found");
      error.statusCode = 404;
      throw error;
    }

    res.send(bill);
  } catch (error) {
    next(error);
  }
});

// POST PAYMENT
app.post("/newPay", async (req, res, next) => {
  try {
    await connectDB();

    const payment = req.body;

    if (!payment || Object.keys(payment).length === 0) {
      const error = new Error("Payment data is required");
      error.statusCode = 400;
      throw error;
    }

    const result = await paidBills.insertOne(payment);

    res.status(201).send(result);
  } catch (error) {
    next(error);
  }
});

// ================= ERROR HANDLERS =================

// 404 Route Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// ================= SERVER =================

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
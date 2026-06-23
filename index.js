require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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

// Test route
app.get("/", (req, res) => {
  res.send("Server is running fine!");
});

// MongoDB setup
const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// 🔥 GLOBAL CACHE (IMPORTANT FIX)
let db;
let billCollection;
let paidBills;

// 🔥 SAFE DB CONNECT FUNCTION
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db("easyBill");

    billCollection = db.collection("bill");
    paidBills = db.collection("paidBills");

    console.log("MongoDB Connected");
  }
  return db;
}

// ================== ROUTES ==================

// GET ALL BILLS
app.get("/bill", async (req, res) => {
  try {
    await connectDB();

    const result = await billCollection.find({}).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to fetch bills" });
  }
});

// GET BILL BY ID
app.get("/bill/:id", async (req, res) => {
  try {
    await connectDB();

    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).send({ error: "Invalid ID" });
    }

    const bill = await billCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!bill) {
      return res.status(404).send({ error: "Bill not found" });
    }

    res.send(bill);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});

// POST PAYMENT
app.post("/newPay", async (req, res) => {
  try {
    await connectDB();

    const payment = req.body;

    if (!payment) {
      return res.status(400).send({ error: "No payment data provided" });
    }

    const result = await paidBills.insertOne(payment);

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Payment failed" });
  }
});

// ❌ REMOVE app.listen FOR VERCEL (IMPORTANT)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
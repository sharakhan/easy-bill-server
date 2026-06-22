require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

// Middleware
app.use(cors());
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

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected");

    const db = client.db("easyBill");
    const billCollection = db.collection("bill");
    const paidBills = db.collection("paidBills");

    // GET ALL BILLS
    app.get("/bill", async (req, res) => {
      try {
        const result = await billCollection.find({}).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch bills" });
      }
    });

    // GET BILL BY ID
    app.get("/bill/:id", async (req, res) => {
      try {
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
        res.status(500).send({ error: "Server error" });
      }
    });

    // POST PAYMENT
    app.post("/newPay", async (req, res) => {
      try {
        const payment = req.body;

        if (!payment) {
          return res.status(400).send({ error: "No payment data provided" });
        }

        const result = await paidBills.insertOne(payment);
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Payment failed" });
      }
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
}

run().catch(console.error);

// Server start (IMPORTANT FIX)
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export app (for Vercel or testing)
module.exports = app;
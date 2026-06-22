require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is running fine!");
});

// MongoDB setup
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function run() {
  await client.connect();

  const db = client.db("easyBill");
  const billCollection = db.collection("bill");
  const paidBills = db.collection("paidBills");

  // GET ALL BILLS
  app.get("/bill", async (req, res) => {
    const result = await billCollection.find({}).toArray();
    res.send(result);
  });

  // GET BILL BY ID
  app.get("/bill/:id", async (req, res) => {
    const bill = await billCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(bill);
  });

  // POST PAYMENT
  app.post("/newPay", async (req, res) => {
    const result = await paidBills.insertOne(req.body);
    res.send(result);
  });

  console.log("MongoDB connected");
}

run().catch(console.error);

module.exports = app;
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
].filter(Boolean);



app.get("/", (req, res) => {
  res.send("Server is running fine!");
});


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
    const db = client.db("easyBill");
    const billCollection = db.collection("bill");
    const paidBills = db.collection("paidBills");

    
    //  GET ALL BILLS + Category Filter
    
    app.get("/bill", async (req, res) => {
      try {
        const { category } = req.query;

        let filter = {};

        // If category exists → make search case-insensitive
        if (category) {
          filter.category = { $regex: new RegExp(category, "i") };
        }

        const result = await billCollection.find(filter).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch bills" });
      }
    });

    
    //  GET Single Bill by ID
   
    app.get("/bill/:id", async (req, res) => {
      try {
        const bill = await billCollection.findOne({
          _id: new ObjectId(req.params.id),
        });
        if (!bill) return res.status(404).json({ error: "Bill not found" });
        res.json(bill);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch bill" });
      }
    });

    
    // POST New Pay Bill
   
    app.post("/newPay", async (req, res) => {
      try {
        const billData = req.body;
        const result = await paidBills.insertOne(billData);
        res.send(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch bill" });
      }
    });

  
    // GET Paid Bills
    
    app.get("/paidBills", async (req, res) => {
      try {
        const { email } = req.query;
        const query = { email };
        const result = await paidBills.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch bill" });
      }
    });

   
    // UPDATE Paid Bill
  
    app.put("/updatePaidBill/:id", async (req, res) => {
      try {
        const { email } = req.query;
        // console.log(email);
        const { id } = req.params;
        const updatedBill = { $set: req.body };
        const query = { _id: new ObjectId(id) };
        const result = await paidBills.updateOne(query, updatedBill);
        res.send(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch bill" });
      }
    });

   
    // DELETE Paid Bill
    
    app.delete("/deletePaidBill/:id", async (req, res) => {
      try {
        const { email } = req.query;
        // console.log(email);
        const { id } = req.params;
        const query = { _id: new ObjectId(id) };
        const result = await paidBills.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch bill" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } finally {
  }
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Easy bill listening on port ${port}`);

});
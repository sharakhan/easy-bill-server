const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is running fine!');
});

const uri = "mongodb+srv://easybill-db:stYvwzYEv6Wib1PN@cluster0.yrscmdj.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const db = client.db('easyBill');
    const billCollection = db.collection('bill');

    // ================================
    // 📌 GET ALL BILLS + Category Filter
    // ================================
    app.get('/bill', async (req, res) => {
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
        res.status(500).json({ error: 'Failed to fetch bills' });
      }
    });

    // ================================
    // 📌 GET Single Bill by ID
    // ================================
    app.get('/bill/:id', async (req, res) => {
      try {
        const bill = await billCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (!bill) return res.status(404).json({ error: 'Bill not found' });
        res.json(bill);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bill' });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Connected to MongoDB!");
  } finally {}
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Easy bill listening on port ${port}`);
});

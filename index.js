const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@certificate-system.ybbeebh.mongodb.net/?appName=certificate-system`;

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
    const db = client.db("creawin");
    const userCollections = db.collection("users");

    // users
    app.post("/add-user", async (req, res) => {
      try {
        const userData = req.body;
        userData.role = "user";
        userData.createdAt = new Date();
        const existingUser = await userCollections.findOne({
          email: userData.email,
        });
        
        if (existingUser) {
          return res.send({
            message: "User already exists",
            inserted: false,
          });
        }

        const result = await userCollections.insertOne(userData);

        res.send({
          inserted: true,
          result,
        });

      } catch (error) {
        res.status(500).send(error);
      }
    });
    
    await client.db("creawin").command({ ping: 1 });
    console.log("MongoDB connected");
  } finally {

  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("CW server running...");
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
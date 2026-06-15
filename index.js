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
        const { uid, name, email, photo } = req.body;
        if (!uid || !name || !email) {
            return res.status(200).send({
              message: "Required fields are missing",
            });
        }
        const existingUser = await userCollections.findOne({ $or: [{ email }, { uid }] });
        if (existingUser) {
          return res.status(200).send({
            inserted: false,
            message: "User already exists",
          });
        }
        const newUser = {
          uid,
          name,
          email,
          photo,
          role: "user",
          bio: "",
          address: "",
          createdAt: new Date(),
          lastLogin: new Date(),
        };
        const result = await userCollections.insertOne(newUser);
        res.status(200).send({
          inserted: true,
          insertedId: result.insertedId,
          message: "User created successfully",
        });
      } catch (error) {
        res.status(500).send({
          message: "Internal Server Error",
        });
      }
    });

    // get_user_role
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      try {
        const user = await userCollections.findOne({ email });
        if (!user) {
          return res.status(404).send({
            found: false,
            message: "User not found!",
            data: {} 
          });
        }
        return res.status(200).send({
          found: true,
          data: user
        });
      
      } catch (error) {
        return res.status(500).send({
          found: false,
          message: error.message,
          data: {}
        });
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
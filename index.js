const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const ObjectId = require("mongodb").ObjectId;

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// database connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9tg9f.mongodb.net/${process.env.DB_HOST}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// console.log(uri);

async function run() {
  try {
    await client.connect();
    console.log("Database connection successful!");

    const database = client.db("motoMaze");
    const bikeCollection = database.collection("bikes");

    // get all bikes
    app.get("/bikes", async (req, res) => {
      const bikes = await bikeCollection.find({}).toArray();
      res.send(bikes);
    });

    // get specific bike
    app.get("/bikes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await bikeCollection.findOne(query);
      console.log(result);

      res.json(result);
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to the Server Side!");
});

app.listen(port, () => {
  console.log("Listening to port: ", port);
});

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
    const usersCollection = database.collection("users");
    const ordersCollection = database.collection("orders");

    // get all bikes
    app.get("/bikes", async (req, res) => {
      const bikes = await bikeCollection.find({}).toArray();
      res.send(bikes);
    });

    // get all orders
    app.get("/orders", async (req, res) => {
      const orders = await ordersCollection.find({}).toArray();
      res.send(orders);
    });

    // get specific bike
    app.get("/bikes/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await bikeCollection.findOne(query);
      console.log(result);

      res.json(result);
    });

    // get an user api
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };

      const user = await usersCollection.findOne(query);

      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }

      res.json({ admin: isAdmin });
    });

    // api for placing order
    app.post("/placeorder", async (req, res) => {
      const order = req.body;

      const result = await ordersCollection.insertOne(order);

      console.log(result);
      res.json(result);
    });

    // api for storing user to database
    app.post("/adduser", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    // api for storing user to database google sign in
    app.put("/adduser", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };

      const options = { upsert: true };

      const updateDoc = { $set: user };

      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log(result);
      res.json(result);
    });

    // make admin
    app.put("/adduser/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };

      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // update order status
    app.put("/updateorderStatus", async (req, res) => {
      const order = req.body;
      const filter = { _id: ObjectId(order.id) };

      const updateDoc = { $set: { status: true } };

      const result = await ordersCollection.updateOne(filter, updateDoc);
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

require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

const cors = require("cors");

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mizbauddintareq.oozrpsa.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    const db = client.db("pc-builder");
    const productsCollection = db.collection("products");

    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const product = await cursor.toArray();

      res.send({ status: 200, message: "success", data: product });
    });

    // get single product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;

      const result = await productsCollection.findOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    app.get("/catagories", async (req, res) => {
      const cursor = productsCollection.find({});
      const catagories = await cursor.toArray();

      res.send({ status: 200, message: "success", data: catagories });
    });

    app.get("/allcategories", async (req, res) => {
      try {
        const cursor = productsCollection.aggregate([
          {
            $group: {
              _id: "$category",
            },
          },
          {
            $project: {
              _id: 0,
              category: "$_id",
            },
          },
        ]);

        const categories = await cursor.toArray();

        res.send({ status: 200, message: "success", data: categories });
      } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).send({ status: 500, message: "Internal Server Error" });
      }
    });

    // get single catagories
    app.get("/catagories/:category", async (req, res) => {
      const category = req.params.category;

      const cursor = await productsCollection.find({});
      const result = await cursor.toArray();
      const filterCategory = await result.filter(
        (product) => product.category === category
      );

      res.send(filterCategory);
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

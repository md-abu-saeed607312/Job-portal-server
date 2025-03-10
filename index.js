const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Job is fallig from the sky");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dblis.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const database = client.db("jobProtal").collection("jobs");
    const jobapplicationConection=client.db("jobProtal").collection("job_applications")

    app.get("/jobs", async (req, res) => {
      const cursor = database.find();
      const reuslt = await cursor.toArray();
      res.send(reuslt);
    });

    //_id: "67c067a5e1f00bc39405ecea"এটা হলে শুধু(id) হবে।
    // _id: objectid("67c067a5e1f00bc39405ecea") এমন হলে  new objectid হবে ।

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const reuslt = await database.findOne(query);
      res.send(reuslt);
    });


 

    app.post("/jobapplication",async(req,res)=>{
      const application=req.body ;
      const reuslt=await jobapplicationConection.insertOne(application)
     res.send(reuslt)
    })

    app.get("/jobapplication", async(req,res)=>{
      const email=req.query.email
      const query={application_email:email}
      const reuslt= await jobapplicationConection.find(query).toArray()
      res.send(reuslt)

    })


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run()

app.listen(port, () => {
  console.log(`Job is waiting at:${port}`);
});

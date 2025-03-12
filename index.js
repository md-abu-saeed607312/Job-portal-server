const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require('jsonwebtoken');
const coolieparser=require("cookie-parser")
require("dotenv").config();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(cors());
app.use(express.json());
app.use(coolieparser())

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



    // Auth Related Apis 

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' }); // ✅ Correct token generation
  
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: false, // Change to `true` in production with HTTPS
        })
        .send({ success: true });
  });



  

    app.get("/jobs", async (req, res) => {

      const email=req.query.email;
      let query={}
      if(email){
        query={hr_email:email}
      }


      const cursor = database.find(query);
      const reuslt = await cursor.toArray();
      res.send(reuslt);
    });

    app.post("/jobs",async(req,res)=>{
      const jobpost=req.body
      const result= await database.insertOne(jobpost)
      res.send(result)
    })


    // jobDetails এর জন্য

    //_id: "67c067a5e1f00bc39405ecea"এটা হলে শুধু(id) হবে।
    // _id: objectid("67c067a5e1f00bc39405ecea") এমন হলে  new objectid হবে ।

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await database.findOne(query);
      res.send(result);
    });


   
  //  Job Apply জব আবেদন 
    app.post("/jobapplication",async(req,res)=>{
      const application=req.body ;
      const result=await jobapplicationConection.insertOne(application)
     res.send(result)
    })

    app.get("/jobapplication", async(req,res)=>{
      const email=req.query.email
      const query={application_email:email}
      const result= await jobapplicationConection.find(query).toArray()
      res.send(result)

    })

    // একটা Job এ কতোজন Apply করছে এটা দেখতে 
    app.get("/jobapplication/jobs/:job_id",async(req,res)=>{
      const jobId=req.params.job_id
      const query={job_id:jobId }
      const result=await jobapplicationConection.find(query).toArray()
      res.send(result)
    })



    app.patch('/jobapplication/:id',async(req,res)=>{
      const data=req.body
      const id=req.params.id;
      const filter={_id:new ObjectId(id)}
      const updatedDoc={
        $set:{
           status: data.status,
        },
      }
      const result=await jobapplicationConection.updateOne(filter,updatedDoc)
      res.send(result)
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

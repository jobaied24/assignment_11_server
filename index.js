require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const port = process.env.PORT || 3000;

// midleware
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true
}));


app.use(express.json());
app.use(cookieParser());


 app.get('/',(req,res)=>{
    res.send('assignment 11 server is running');
 });

    // const verifyToken = (req,res,next)=>{
    //   const token = req?.cookies?.token;
    //   console.log('This is cookie',token);

    //   if(!token){
    //     return res.status(401).send({message:'Unauthorized Access'});
    //   }

    //   jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
    //     if(err){
    //       return res.status(401).send({message:'Unauthorized Access'});
    //     };
    //     req.decoded = decoded;
    //     next();
    //   })
      
    // }

    // verify token
    const verifyToken =(req,res,next)=>{
       const userToken = req.cookies.token;
      console.log()
       if(!userToken){
        return res.status(401).send({message:'Unauthorized access'});
       };

       jwt.verify(userToken,process.env.JWT_SECRET,(err,decoded)=>{
        if(err){
          return res.status(401).send({message:'Unauthorized access'});
        };
        req.decoded = decoded;
        next();
       })

       
    }

 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hota77b.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // connect to the Collection
    const itemsCollection = client.db('lostAndFound').collection('lostAndFoundItems');
    const recoveredCollection = client.db('lostAndFound').collection('recovered');

    // getting all items
    app.get('/items',async(req,res)=>{
      
      const email = req.query.email;
      const title = req.query.title;
      const location = req.query.location;

      const limit = parseInt(req.query.limit);
      const query = {};
      // console.log(email);
      if(title){
        query.title =title;
      }   

      if(location){
        query.location = location;
      }

      if(email){
        query.email =email;
      }
      
      const cursor = itemsCollection.find(query)
      .sort({date:-1})

      if(limit){
        cursor.limit(limit);
      };
     const result = await cursor.toArray();
      res.send(result);
    });


    // // logged-in user's items
    // app.get('/myItems',async(req,res)=>{
    //   const query = req.body
    // })


    app.get('/items/:id',async(req,res)=>{
      const id = req.params.id;
 
      const query = {_id : new ObjectId(id)};
 
      const result = await itemsCollection.findOne(query);
      res.send(result);
    })


    // recovered item
    app.get('/allRecovered',verifyToken,async(req,res)=>{
      const email = req.query.email;

      const query = {
        email: email
      }


      const result = await recoveredCollection.find(query).toArray();
      res.send(result);
    })
     
    
    // post items
    app.post('/addItems',verifyToken,async(req,res)=>{
      const data = req.body;

       data.status = "active";

      const result = await itemsCollection.insertOne(data);
      res.send(result);
    });


//   // jwt token
//  app.post('/jwt',async(req,res)=>{
//   const {email} = req.body;
//   const user = {email};
//   const token = jwt.sign(user,process.env.JWT_SECRET,{expiresIn:'1h'});
//   console.log(token);
  
//   // set token at cookie
//   res.cookie('token',token,{
//     httpOnly:true,
//     secure:false
//   })
//   res.send({token});
 
//  })


// jwt token
app.post('/jwt',async(req,res)=>{
  const {email} = req.body;
  const userData = {email};
  console.log(userData);
  const token = jwt.sign(userData,process.env.JWT_SECRET,{expiresIn:'1h'});
  
  // token set to the cookie
  res.cookie('token',token,{
    httpOnly:true,
    secure:false
  })

  res.send({token});
})


    // post recovered item
    app.post('/recovered',verifyToken,async(req,res)=>{
      const data = req.body; 

      const result = await recoveredCollection.insertOne(data);
      
      const updateDoc = {
        $set:{
          status:"recovered"
        }
      };

      const id = data.itemId;
      const filter = ({_id:new ObjectId(id)});

      const updateStatus=await itemsCollection.updateOne(filter,updateDoc);
        res.send({
          result,
          updateStatus
        }
        );
    });

    

        // update item
        app.put('/updateItem/:id',verifyToken,async(req,res)=>{
          const id = req.params.id;
          const filter = ({_id : new ObjectId(id)});
          const updateItem = req.body;
          console.log(updateItem);

          const updateDoc = {
            $set:updateItem
          };
          const result = await itemsCollection.updateOne(filter,updateDoc);
          res.send(result);
        });


        // delete item
        app.delete('/deleteItem/:id',verifyToken,async(req,res)=>{
          const id = req.params.id;
          const query =({_id: new ObjectId(id)});

          const result = await itemsCollection.deleteOne(query);
          res.send(result);
        })
  

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

 app.listen(port,()=>{
    console.log('surver is running on port', port)
 });

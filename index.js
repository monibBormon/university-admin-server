const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())


// database 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dejzn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri)

async function run() {
    try {
        await client.connect()
        const universityCollection = client.db('universitydb').collection('courses')
        const usersCollection = client.db('universitydb').collection('users')

        // get all products from db
        app.get('/products', async (req, res) => {
            const result = await carCollection.find().toArray()
            res.json(result)
        })
        //add a new product to db
        app.post('/products', async (req, res) => {
            const result = await carCollection.insertOne(req.body)
            res.json(result)
        })
        // delete product from db
        app.delete('/delete/:id', async (req, res) => {
            const result = await carCollection.deleteOne({ _id: ObjectId(req.params.id) })
            res.json(result)
        })

        // add user to db
        app.post('/users', async (req, res) => {
            const result = await usersCollection.insertOne(req.body)
            res.json(result)
        })
        // make admin role 
        app.put('/users/admin', async (req, res) => {
            const user = req.body
            const filter = { email: user.email }
            const updateDoc = { $set: { role: 'admin' } }
            const result = await usersCollection.updateOne(filter, updateDoc)
            res.json(result)
        })
        //get admin user 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const user = await usersCollection.findOne(query)
            let isAdmin = false
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin })
        })

    } finally {
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
    res.send('University Admin running.')
})
app.listen(port, () => {
    console.log('Port running at', port)
})
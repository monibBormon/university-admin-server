const express = require('express')
const { MongoClient } = require('mongodb');
const cors = require('cors')
const ObjectId = require('mongodb').ObjectId
require('dotenv').config()
const fileUpload = require('express-fileupload')

const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())
app.use(fileUpload())

// database 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dejzn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri)

async function run() {
    try {
        await client.connect()
        const courseCollection = client.db('universitydb').collection('courses')
        const usersCollection = client.db('universitydb').collection('users')

        // get all courses from db
        app.get('/courses', async (req, res) => {
            const cursor = courseCollection.find({})
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let result;
            const count = await cursor.count()
            if (page) {
                result = await cursor.skip(page * size).limit(size).toArray()
            } else {
                result = await cursor.toArray()
            }
            res.send({
                count,
                result
            })
        })
        //add a new course to db
        app.post('/courses', async (req, res) => {
            const name = req.body.name;
            const title = req.body.title;
            const price = req.body.price;
            const des = req.body.body;
            const image = req.files.image;
            const imageData = image.data;
            const encodedImage = imageData.toString('base64')
            const imageBuffer = Buffer.from(encodedImage, 'base64')
            const course = {
                name,
                title,
                price,
                body: des,
                img: imageBuffer
            }
            const result = await courseCollection.insertOne(course)
            res.json(result)
        })
        // get single student details 
        app.get('/course-details/:id', async (req, res) => {
            const result = await courseCollection.findOne({ _id: ObjectId(req.params.id) })
            res.json(result)
        })
        // delete product from db
        app.delete('/delete/:id', async (req, res) => {
            const result = await courseCollection.deleteOne({ _id: ObjectId(req.params.id) })
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
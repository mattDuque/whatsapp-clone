import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbMessages.js'
import Pusher from 'pusher'
import Cors from 'cors'

//config
const app = express();
const port = process.env.PORT || 9000;
const dbURL = 'mongodb+srv://admin:qnjT40YlKOOi47Ml@cluster0.cdtbz.gcp.mongodb.net/whatsappdb?retryWrites=true&w=majority'

const pusher = new Pusher({
    appId: '1068707',
    key: '573f89356e84997e6366',
    secret: 'b442fa6dfa249757432b',
    cluster: 'us2',
    useTLS: true
});

mongoose.connect(dbURL, {
    userCreateIndex: true,
    useNewUrlParserParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection

db.once('open', () => {
    const msgCollection = db.collection('messagecontents')
    const changeStream = msgCollection.watch()

    changeStream.on('change', (change) => {

        if (change.operationType === 'insert') {
            pusher.trigger('messages', 'inserted', {
                name: change.fullDocument.name,
                message: change.fullDocument.message,
                recieved: change.fullDocument.recieved,
                timestamp: change.fullDocument.timestamp
            })
            console.log(change)
        } else {
            console.log('error with pusher')
        }
    })
})

//midleware
app.use(express.json())
app.use(Cors())

//routing
app.get('/', (req, res) => {
    res.status(200).send('hello world')
})

app.post('/messages/new', (req, res) => {
    const dbMessage = req.body

    Messages.create(dbMessage, (err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(201).send(data)
        }
    })
})

app.get('/messages/sync', (req, res) => {
    Messages.find((err, data) => {
        if (err) {
            res.status(500).send(err)
        } else {
            res.status(200).send(data)
        }
    })
})

app.listen(port, () => {
    console.log('App listening on localhost')
})
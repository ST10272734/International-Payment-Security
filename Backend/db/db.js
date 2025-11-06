import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'

dotenv.config()

const connstring = process.env.MONGODB_URI
const client = new MongoClient(connstring)

async function connect() {
    try{
        await client.connect()
        console.log('MongoDB connected.')
    }
    catch(err){
        console.error(err)
    }
}

export { connect, client }
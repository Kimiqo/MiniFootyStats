import { MongoClient } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    console.log('✅ Using cached database connection');
    return { client: cachedClient, db: cachedDb };
  }

  console.log('🔄 Connecting to MongoDB...');
  const client = await MongoClient.connect(process.env.MONGODB_URI);

  const db = client.db('thursday_football');

  cachedClient = client;
  cachedDb = db;

  console.log('✅ Successfully connected to MongoDB database: thursday_football');

  return { client, db };
}

export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

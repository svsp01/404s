import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error('❌ Please define the MONGODB_URI environment variable in .env.local');
}

console.log('✅ Loaded MONGODB_URI from env'); // This should print in your terminal

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    try {
      console.log('🔄 Connecting to MongoDB (dev)...');
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    } catch (err) {
      console.error('❌ MongoDB connection error (dev):', err);
    }
  }
  clientPromise = global._mongoClientPromise!;
} else {
  try {
    console.log('🔄 Connecting to MongoDB (prod)...');
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  } catch (err) {
    console.error('❌ MongoDB connection error (prod):', err);
    throw err;
  }
}

export default clientPromise;

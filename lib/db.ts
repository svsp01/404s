import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = 'mongodb+srv://sakthiVanta:Test1234@cluster0.mqvayle.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

if (!uri) {
  console.error('❌ MONGODB_URI is not defined in environment variables');
  throw new Error('Please define the MONGODB_URI environment variable in .env.local');
}

console.log('✅ Loaded MONGODB_URI:', uri.replace(/:.*@/, ':<hidden>@')); // Sanitize credentials for logging

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 120000, // Increased to 120s for Lambda cold starts
  serverSelectionTimeoutMS: 120000, // Increased to 120s for replica set selection
  socketTimeoutMS: 120000, // Increased to 120s to prevent socket hangs
  maxPoolSize: 10, // Limit connections for Lambda
  minPoolSize: 1, // Ensure at least one connection
  maxIdleTimeMS: 10000, // Close idle connections quickly
  retryWrites: true, // Enable retryable writes for Atlas
  w: 'majority', // Ensure writes are replicated to majority
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function connectWithRetry(uri: string, options: any, maxRetries: number = 3): Promise<MongoClient> {
  let retries = maxRetries;
  while (retries > 0) {
    try {
      console.log(`🔄 Connecting to MongoDB (attempt ${maxRetries - retries + 1}/${maxRetries})...`);
      const client = new MongoClient(uri, options);
      await client.connect();
      console.log('✅ MongoDB connection established');
      return client;
    } catch (err) {
      console.error(`❌ MongoDB connection attempt failed (retries left: ${retries - 1}):`, err);
      retries--;
      if (retries === 0) {
        console.error('❌ Max retries reached, connection failed');
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
    }
  }
  throw new Error('Unexpected end of retry loop');
}

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    try {
      console.log('🔄 Initiating MongoDB connection (dev)...');
      global._mongoClientPromise = connectWithRetry(uri, options);
      console.log('✅ MongoDB connection initiated (dev)');
    } catch (err) {
      console.error('❌ MongoDB connection error (dev):', err);
      throw err; // Throw to prevent undefined clientPromise
    }
  }
  clientPromise = global._mongoClientPromise;
  console.log('✅ Using cached MongoDB connection (dev)');
} else {
  console.log('🔄 Initiating MongoDB connection (prod)...');
  clientPromise = connectWithRetry(uri, options).then(client => {
    console.log('✅ MongoDB connection established (prod)');
    return client;
  }).catch(err => {
    console.error('❌ MongoDB connection error (prod):', err);
    throw err;
  });
}

export default clientPromise;
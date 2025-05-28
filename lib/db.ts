import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

// Optimized connection options for serverless environments
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Serverless-friendly options
  maxPoolSize: 1, // Limit connection pool for serverless
  serverSelectionTimeoutMS: 5000, // 5 second timeout
  socketTimeoutMS: 45000, // 45 second socket timeout
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
  // Note: bufferMaxEntries and bufferCommands are Mongoose options, not MongoDB driver options
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient>;

// Declare global type for development caching
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function createMongoConnection(): Promise<MongoClient> {
  try {
    console.log("🔄 Creating new MongoDB connection...");
    
    const mongoClient = new MongoClient(uri as string, options);
    await mongoClient.connect();
    
    // Test the connection
    await mongoClient.db("404forge").command({ ping: 1 });
    console.log("✅ MongoDB connected successfully");
    
    return mongoClient;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    throw error;
  }
}

// Connection logic optimized for serverless
if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve the connection
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = createMongoConnection();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production (Netlify), create a new connection for each cold start
  clientPromise = createMongoConnection().then(connectedClient => {
    client = connectedClient; // Store reference
    return connectedClient;
  });
}

// Helper function to get connected client with error handling
export async function getMongoClient(): Promise<MongoClient> {
  try {
    if (!clientPromise) {
      clientPromise = createMongoConnection();
    }
    
    const connectedClient = await clientPromise;
    
    // Verify connection is still alive
    await connectedClient.db("404forge").command({ ping: 1 });
    
    return connectedClient;
  } catch (error) {
    console.error("❌ Error getting MongoDB client:", error);
    // Reset the promise to allow retry
    clientPromise = createMongoConnection();
    return await clientPromise;
  }
}

// Helper function to safely close connection (useful for cleanup)
export async function closeMongoConnection(): Promise<void> {
  try {
    if (client) {
      await client.close();
      client = null; // Reset reference
      console.log("✅ MongoDB connection closed");
    }
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error);
  }
}

// Export the default promise for backward compatibility
export default clientPromise;
import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not defined");
}

// Aggressive timeout settings for Netlify's 10-second limit
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Ultra-fast connection settings for serverless
  maxPoolSize: 1, // Single connection for serverless
  minPoolSize: 0, // Don't maintain minimum connections
  maxIdleTimeMS: 30000, // 30 seconds idle timeout
  serverSelectionTimeoutMS: 3000, // Reduced to 3 seconds
  socketTimeoutMS: 8000, // 8 seconds socket timeout (under Netlify's 10s limit)
  connectTimeoutMS: 3000, // 3 seconds connection timeout
  heartbeatFrequencyMS: 10000, // 10 seconds heartbeat
  // Compression and performance
  compressors: ["snappy", "zlib"] as ("snappy" | "zlib")[],
  zlibCompressionLevel: 6 as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9,
  // Retry settings
  retryWrites: true,
  retryReads: true,
  maxConnecting: 1, // Limit concurrent connections
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 2;

// Declare global type for development caching
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  var _mongoClient: MongoClient | undefined;
  var _lastConnectionTime: number | undefined;
}

// Connection health check
async function isConnectionHealthy(mongoClient: MongoClient): Promise<boolean> {
  try {
    // Quick ping with timeout
    const pingPromise = mongoClient.db("404forge").command({ ping: 1 });
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Ping timeout")), 2000)
    );

    await Promise.race([pingPromise, timeoutPromise]);
    return true;
  } catch (error) {
    console.warn("⚠️ Connection health check failed:", error);
    return false;
  }
}

async function createMongoConnection(): Promise<MongoClient> {
  const startTime = Date.now();
  connectionAttempts++;

  try {
    console.log(
      `🔄 Creating MongoDB connection (attempt ${connectionAttempts})...`
    );

    const mongoClient = new MongoClient(uri as string, options);

    // Connect with timeout wrapper
    const connectPromise = mongoClient.connect();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout")), 4000)
    );

    await Promise.race([connectPromise, timeoutPromise]);

    // Quick health check
    const isHealthy = await isConnectionHealthy(mongoClient);
    if (!isHealthy) {
      await mongoClient.close();
      throw new Error("Connection health check failed");
    }

    const connectionTime = Date.now() - startTime;
    console.log(`✅ MongoDB connected successfully in ${connectionTime}ms`);

    connectionAttempts = 0; // Reset on success
    return mongoClient;
  } catch (error) {
    const connectionTime = Date.now() - startTime;
    console.error(
      `❌ MongoDB connection failed in ${connectionTime}ms:`,
      error
    );

    if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
      connectionAttempts = 0;
      throw new Error(
        `MongoDB connection failed after ${MAX_CONNECTION_ATTEMPTS} attempts: ${error}`
      );
    }

    throw error;
  }
}

// Enhanced connection management for serverless
if (process.env.NODE_ENV === "development") {
  // Development: Use global caching with connection reuse
  if (
    !global._mongoClient ||
    !global._lastConnectionTime ||
    Date.now() - global._lastConnectionTime > 300000
  ) {
    // 5 minutes

    if (global._mongoClient) {
      try {
        global._mongoClient.close();
      } catch (e) {
        console.warn("Failed to close old connection:", e);
      }
    }

    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createMongoConnection().then(
        (connectedClient) => {
          global._mongoClient = connectedClient;
          global._lastConnectionTime = Date.now();
          return connectedClient;
        }
      );
    }
  }
  clientPromise = global._mongoClientPromise!;
} else {
  // Production: Optimized for Netlify serverless
  clientPromise = createMongoConnection().then((connectedClient) => {
    client = connectedClient;
    return connectedClient;
  });
}

// Enhanced client getter with fast-fail approach
export async function getMongoClient(): Promise<MongoClient> {
  const startTime = Date.now();

  try {
    // Fast timeout for serverless environment
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Client acquisition timeout")), 5000)
    );

    if (!clientPromise) {
      console.log("🔄 No existing promise, creating new connection...");
      clientPromise = createMongoConnection();
    }

    const connectedClient = await Promise.race([clientPromise, timeoutPromise]);

    // Quick health check for existing connections
    if (process.env.NODE_ENV === "production") {
      const isHealthy = await Promise.race([
        isConnectionHealthy(connectedClient),
        new Promise<boolean>((resolve) =>
          setTimeout(() => resolve(false), 1500)
        ),
      ]);

      if (!isHealthy) {
        console.log("🔄 Connection unhealthy, creating new one...");
        // Reset and create new connection
        clientPromise = createMongoConnection();
        const newClient = await Promise.race([clientPromise, timeoutPromise]);
        client = newClient;
        return newClient;
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Client acquired in ${totalTime}ms`);

    return connectedClient;
  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Error getting MongoDB client in ${totalTime}ms:`, error);

    // Reset promise to allow retry
    clientPromise = null;

    // Throw simplified error for better debugging
    throw new Error(`MongoDB client error: ${error}`);
  }
}

// Database operation wrapper with timeout
export async function withMongoOperation<T>(
  operation: (client: MongoClient) => Promise<T>,
  timeoutMs: number = 6000
): Promise<T> {
  const mongoClient = await getMongoClient();

  const operationPromise = operation(mongoClient);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Database operation timeout")), timeoutMs)
  );

  return Promise.race([operationPromise, timeoutPromise]);
}

// Graceful cleanup for serverless
export async function closeMongoConnection(): Promise<void> {
  try {
    if (client) {
      await client.close();
      client = null;
      console.log("✅ MongoDB connection closed");
    }

    if (global._mongoClient) {
      await global._mongoClient.close();
      global._mongoClient = undefined;
      global._mongoClientPromise = undefined;
      global._lastConnectionTime = undefined;
    }

    clientPromise = null;
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error);
  }
}

// Health check endpoint helper
export async function checkMongoHealth(): Promise<{
  connected: boolean;
  responseTime: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    const mongoClient = await getMongoClient();
    await mongoClient.db("404forge").command({ ping: 1 });

    return {
      connected: true,
      responseTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      connected: false,
      responseTime: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// Export the promise for backward compatibility
export default clientPromise;

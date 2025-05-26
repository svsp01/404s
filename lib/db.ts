import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI is not defined in environment variables");
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

console.log("✅ Loaded MONGODB_URI:", uri.replace(/:.*@/, ":<hidden>@")); // Sanitize credentials for logging

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

async function connectWithRetry(maxRetries: number = 3): Promise<MongoClient> {
  let retries = maxRetries;
  while (retries > 0) {
    try {
      console.log(
        `🔄 Connecting to MongoDB (attempt ${
          maxRetries - retries + 1
        }/${maxRetries})...`
      );
      await client.connect();
      await client.db("404forge").command({ ping: 1 }); // Test connection
      console.log("✅ MongoDB connection established");
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );

      return client;
    } catch (err) {
      console.error(
        `❌ MongoDB connection attempt failed (retries left: ${retries - 1}):`,
        err
      );
      retries--;
      if (retries === 0) {
        console.error("❌ Max retries reached, connection failed");
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s before retry
    }finally {
      await client.close();
      console.log(`🔄 Retrying connection... (${retries} retries left)`);
    }
  }
  throw new Error("Unexpected end of retry loop");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    try {
      console.log("🔄 Initiating MongoDB connection (dev)...");
      global._mongoClientPromise = connectWithRetry();
      console.log("✅ MongoDB connection initiated (dev)");
    } catch (err) {
      console.error("❌ MongoDB connection error (dev):", err);
      throw err; // Throw to prevent undefined clientPromise
    }
    
  }
  clientPromise = global._mongoClientPromise;
  console.log("✅ Using cached MongoDB connection (dev)");
} else {
  console.log("🔄 Initiating MongoDB connection (prod)...");
  clientPromise = connectWithRetry()
    .then((client) => {
      console.log("✅ MongoDB connection established (prod)");
      return client;
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error (prod):", err);
      throw err;
    });
}

export default clientPromise;

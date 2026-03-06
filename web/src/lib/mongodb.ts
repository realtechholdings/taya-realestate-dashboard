import { MongoClient, Db, Collection } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.DATABASE_NAME!;

if (!uri) {
  throw new Error('Please add your MongoDB URI to .env');
}

if (!dbName) {
  throw new Error('Please add your DATABASE_NAME to .env');
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function connectDB(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export async function getCollection<T extends object = any>(name: string): Promise<Collection<T>> {
  const db = await connectDB();
  return db.collection<T>(name);
}

// Initialize database indexes
export async function initializeIndexes() {
  const db = await connectDB();
  
  // Properties collection indexes
  const properties = db.collection('properties');
  await properties.createIndex({ 'address.formatted': 1 }, { unique: true });
  await properties.createIndex({ lotPlan: 1 });
  await properties.createIndex({ ownerNames: 1 });
  await properties.createIndex({ 'segments.name': 1 });
  await properties.createIndex({ doNotContact: 1 });
  await properties.createIndex({ 'address.lat': 1, 'address.lng': 1 }, { sparse: true });
  
  // Geocode cache collection indexes
  const geocodeCache = db.collection('geocodeCache');
  await geocodeCache.createIndex({ formattedAddress: 1 }, { unique: true });
  
  // Import issues collection indexes
  const importIssues = db.collection('importIssues');
  await importIssues.createIndex({ importBatch: 1 });
  await importIssues.createIndex({ issueType: 1 });

  console.log('Database indexes initialized');
}

export default clientPromise;
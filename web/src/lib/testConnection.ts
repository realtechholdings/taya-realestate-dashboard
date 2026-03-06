// Test script to verify MongoDB connection and initialize database
import { connectDB, initializeIndexes } from './mongodb';

export async function testDatabaseConnection(): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Testing MongoDB connection...');
    
    // Test connection
    const db = await connectDB();
    console.log('✅ Connected to MongoDB successfully');
    
    // Test database name
    const dbName = db.databaseName;
    console.log(`✅ Database name: ${dbName}`);
    
    // Initialize indexes
    await initializeIndexes();
    console.log('✅ Database indexes initialized');
    
    // Test collections exist
    const collections = await db.listCollections().toArray();
    console.log('✅ Available collections:', collections.map(c => c.name));
    
    return { success: true };
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testDatabaseConnection()
    .then((result) => {
      if (result.success) {
        console.log('🎉 All database tests passed!');
        process.exit(0);
      } else {
        console.error('💥 Database tests failed:', result.error);
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}
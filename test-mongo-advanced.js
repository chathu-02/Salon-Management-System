const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB Connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found in .env' : 'NOT FOUND in .env');

// Test MongoDB connection with timeout
async function testMongoConnection() {
  const connectionTimeout = 10000; // 10 seconds timeout
  
  try {
    console.log('\n🔄 Attempting to connect to MongoDB...');
    console.log('⏱️  Timeout set to:', connectionTimeout / 1000, 'seconds');
    
    // Create connection with timeout
    const connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: connectionTimeout,
      connectTimeoutMS: connectionTimeout,
    });
    
    // Race between connection and timeout
    await Promise.race([
      connectionPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), connectionTimeout)
      )
    ]);
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Connection details:');
    console.log('- Database Name:', mongoose.connection.db.databaseName);
    console.log('- Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    console.log('- Host:', mongoose.connection.host);
    
    // Test a simple database operation
    console.log('\n🔍 Testing database operations...');
    
    // Test ping to ensure connection is active
    const pingResult = await mongoose.connection.db.admin().ping();
    console.log('🏓 Database ping successful:', pingResult.ok === 1 ? 'YES' : 'NO');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.length > 0 ? collections.map(col => col.name) : 'No collections found');
    
    console.log('\n✅ MongoDB connection test PASSED!');
    
  } catch (error) {
    console.log('\n❌ MongoDB connection test FAILED!');
    console.error('Error details:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔐 Authentication Error - Please check:');
      console.log('- Username: bawanthamadushan18_db_user');
      console.log('- Password: salonBawantha@123 (URL-encoded as salonBawantha%40123)');
      console.log('- Database access permissions in MongoDB Atlas');
      console.log('- User roles and privileges');
    } else if (error.message.includes('timeout') || error.message.includes('Connection timeout')) {
      console.log('\n⏱️ Connection Timeout - Please check:');
      console.log('- Internet connection stability');
      console.log('- MongoDB Atlas cluster status');
      console.log('- Network firewalls');
      console.log('- IP whitelist in MongoDB Atlas (try adding 0.0.0.0/0 for testing)');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.log('\n🌐 Network Error - Please check:');
      console.log('- Internet connection');
      console.log('- DNS resolution');
      console.log('- MongoDB Atlas cluster URL: salon.c2pdmxa.mongodb.net');
    } else if (error.message.includes('hostname') || error.message.includes('domain')) {
      console.log('\n🔧 URI Format Error - Please check:');
      console.log('- MongoDB URI format');
      console.log('- Cluster hostname');
      console.log('- Special characters in password (@ should be %40)');
    } else {
      console.log('\n🔧 Other Error - Please check:');
      console.log('- MongoDB Atlas cluster availability');
      console.log('- Account status');
    }
  } finally {
    // Close the connection
    try {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed.');
    } catch (closeError) {
      console.log('\n⚠️ Error closing connection:', closeError.message);
    }
    process.exit(0);
  }
}

// Display connection details for debugging
console.log('\n🔍 Connection Details:');
console.log('- Full URI (masked):', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@'));
console.log('- Host:', 'salon.c2pdmxa.mongodb.net');
console.log('- Database:', 'salonDB');
console.log('- Username:', 'bawanthamadushan18_db_user');

// Run the test
testMongoConnection();

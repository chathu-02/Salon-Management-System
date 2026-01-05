const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB Connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Found in .env' : 'NOT FOUND in .env');

// Test MongoDB connection
async function testMongoConnection() {
  try {
    console.log('\n🔄 Attempting to connect to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Connection details:');
    console.log('- Database Name:', mongoose.connection.db.databaseName);
    console.log('- Connection State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
    console.log('- Host:', mongoose.connection.host);
    
    // Test a simple database operation
    console.log('\n🔍 Testing database operations...');
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Available collections:', collections.length > 0 ? collections.map(col => col.name) : 'No collections found');
    
    // Test ping to ensure connection is active
    const pingResult = await mongoose.connection.db.admin().ping();
    console.log('🏓 Database ping successful:', pingResult.ok === 1 ? 'YES' : 'NO');
    
    console.log('\n✅ MongoDB connection test PASSED!');
    
  } catch (error) {
    console.log('\n❌ MongoDB connection test FAILED!');
    console.error('Error details:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔐 Authentication Error - Please check:');
      console.log('- Username: bawanthamadushan18_db_user');
      console.log('- Password: salonBawantha@123');
      console.log('- Database access permissions');
    } else if (error.message.includes('network')) {
      console.log('\n🌐 Network Error - Please check:');
      console.log('- Internet connection');
      console.log('- MongoDB Atlas cluster status');
      console.log('- IP whitelist in MongoDB Atlas');
    } else {
      console.log('\n🔧 Other Error - Please check:');
      console.log('- MongoDB URI format');
      console.log('- Cluster availability');
    }
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
    process.exit(0);
  }
}

// Run the test
testMongoConnection();

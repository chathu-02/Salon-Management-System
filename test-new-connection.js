// TEST YOUR NEW MONGODB CONNECTION STRING
// Run this after you get your connection string from Atlas

const mongoose = require('mongoose');
require('dotenv').config();

console.log('🧪 TESTING NEW MONGODB CONNECTION STRING\n');

// Instructions
console.log('📋 BEFORE RUNNING THIS TEST:');
console.log('1. Get your connection string from MongoDB Atlas');
console.log('2. Update MONGODB_URI in your .env file');
console.log('3. Make sure password has %40 instead of @');
console.log('4. Add /salonDB before the ? in the URL');
console.log('');

// Show current configuration
console.log('🔍 CURRENT CONFIGURATION:');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

if (process.env.MONGODB_URI) {
    // Mask the URI for security
    const maskedUri = process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    console.log('URI (masked):', maskedUri);
    
    // Check if it looks like a valid Atlas URI
    if (process.env.MONGODB_URI.includes('mongodb+srv://')) {
        console.log('✅ Uses mongodb+srv protocol (good for Atlas)');
    } else {
        console.log('⚠️ Not using mongodb+srv protocol (might be local MongoDB)');
    }
    
    if (process.env.MONGODB_URI.includes('%40')) {
        console.log('✅ Password appears to be URL-encoded');
    } else if (process.env.MONGODB_URI.includes('@') && process.env.MONGODB_URI.split('@').length > 2) {
        console.log('⚠️ Password might need URL encoding (@ should be %40)');
    }
    
    if (process.env.MONGODB_URI.includes('/salonDB')) {
        console.log('✅ Database name (salonDB) specified');
    } else {
        console.log('⚠️ Database name might be missing');
    }
} else {
    console.log('❌ MONGODB_URI not found in .env file');
    console.log('');
    console.log('Please add this line to your .env file:');
    console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/salonDB');
    process.exit(1);
}

console.log('');

// Test connection
async function testConnection() {
    try {
        console.log('🔄 Attempting connection...');
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
        
        console.log('✅ CONNECTION SUCCESSFUL!');
        console.log('');
        console.log('📊 Connection Details:');
        console.log('- Database:', mongoose.connection.db.databaseName);
        console.log('- Host:', mongoose.connection.host);
        console.log('- Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
        
        // Test database operations
        console.log('');
        console.log('🔍 Testing database operations...');
        await mongoose.connection.db.admin().ping();
        console.log('✅ Database ping successful');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Collections in database:', collections.length);
        if (collections.length > 0) {
            console.log('   Collection names:', collections.map(c => c.name).join(', '));
        }
        
        console.log('');
        console.log('🎉 YOUR MONGODB CONNECTION IS WORKING PERFECTLY!');
        console.log('');
        console.log('✅ You can now start your salon management system:');
        console.log('   Backend: npm start (in backend folder)');
        console.log('   Frontend: npm start (in frontend folder)');
        
    } catch (error) {
        console.log('❌ CONNECTION FAILED');
        console.log('');
        console.log('Error:', error.message);
        console.log('');
        
        if (error.message.includes('authentication failed')) {
            console.log('🔐 AUTHENTICATION ERROR:');
            console.log('- Check username in connection string');
            console.log('- Check password in connection string');
            console.log('- Make sure database user exists in Atlas');
            console.log('- Verify user has correct permissions');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('hostname')) {
            console.log('🌐 HOSTNAME ERROR:');
            console.log('- Double-check cluster hostname in Atlas');
            console.log('- Make sure cluster is running (not paused)');
            console.log('- Verify connection string is copied correctly');
        } else if (error.message.includes('timeout')) {
            console.log('⏱️ TIMEOUT ERROR:');
            console.log('- Check internet connection');
            console.log('- Verify IP is whitelisted in Atlas Network Access');
            console.log('- Make sure cluster is active');
        } else {
            console.log('🔧 OTHER ERROR:');
            console.log('- Double-check entire connection string');
            console.log('- Make sure @ in password is encoded as %40');
            console.log('- Verify all Atlas setup steps were completed');
        }
        
        console.log('');
        console.log('💡 NEED HELP?');
        console.log('- Review the HOW_TO_GET_MONGODB_URL.md file');
        console.log('- Check MongoDB Atlas dashboard');
        console.log('- Verify all setup steps were completed');
    } finally {
        await mongoose.connection.close();
        console.log('');
        console.log('🔌 Connection closed');
        process.exit(0);
    }
}

testConnection();

const mongoose = require('mongoose');
require('dotenv').config();

// Function to test different connection scenarios
async function diagnoseMongoDB() {
    console.log('🔍 MONGODB CONNECTION DIAGNOSIS\n');
    
    // Check environment variables
    console.log('1️⃣ ENVIRONMENT CHECK:');
    console.log('   NODE_ENV:', process.env.NODE_ENV || 'undefined');
    console.log('   MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.log('   URI (masked):', process.env.MONGODB_URI?.replace(/\/\/.*:.*@/, '//***:***@') || 'NOT SET');
    console.log('');

    // Parse the URI components
    console.log('2️⃣ URI ANALYSIS:');
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            console.log('   ❌ MONGODB_URI is not set in .env file');
            return;
        }

        // Extract components manually
        const matches = uri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/(.+)/);
        if (matches) {
            console.log('   Protocol: mongodb+srv://');
            console.log('   Username:', matches[1]);
            console.log('   Password: ****** (length:', matches[2].length, ')');
            console.log('   Hostname:', matches[3]);
            console.log('   Database:', matches[4]);
        } else {
            console.log('   ❌ URI format appears invalid');
        }
    } catch (error) {
        console.log('   ❌ Error parsing URI:', error.message);
    }
    console.log('');

    // Test basic network connectivity
    console.log('3️⃣ NETWORK CONNECTIVITY TEST:');
    const hostname = 'salon.c2pdmxa.mongodb.net';
    
    try {
        const dns = require('dns').promises;
        console.log('   Testing DNS resolution for:', hostname);
        const addresses = await dns.lookup(hostname);
        console.log('   ✅ DNS Resolution successful:', addresses.address);
    } catch (dnsError) {
        console.log('   ❌ DNS Resolution failed:', dnsError.message);
        console.log('   This means the hostname doesn\'t exist or is unreachable');
        return;
    }
    console.log('');

    // Test MongoDB connection with detailed error handling
    console.log('4️⃣ MONGODB CONNECTION TEST:');
    let connectionAttempt = 1;
    const maxAttempts = 3;

    while (connectionAttempt <= maxAttempts) {
        console.log(`   Attempt ${connectionAttempt}/${maxAttempts}:`);
        
        try {
            // Set shorter timeouts for faster diagnosis
            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 5000, // 5 second timeout
                connectTimeoutMS: 5000,
                socketTimeoutMS: 5000,
            };

            console.log('   🔄 Connecting...');
            await mongoose.connect(process.env.MONGODB_URI, options);
            
            console.log('   ✅ Connection successful!');
            console.log('   📊 Connection details:');
            console.log('      - State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
            console.log('      - Database:', mongoose.connection.db.databaseName);
            console.log('      - Host:', mongoose.connection.host);
            
            // Test database operations
            console.log('   🔍 Testing database operations...');
            await mongoose.connection.db.admin().ping();
            console.log('   ✅ Database ping successful');
            
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('   📁 Collections found:', collections.length);
            
            break; // Success, exit loop
            
        } catch (error) {
            console.log('   ❌ Connection failed:', error.message);
            
            // Detailed error analysis
            if (error.message.includes('authentication failed')) {
                console.log('   🔐 AUTHENTICATION ERROR:');
                console.log('      - Check username: bawanthamadushan18_db_user');
                console.log('      - Check password: salonBawantha@123');
                console.log('      - Verify user exists in MongoDB Atlas');
                console.log('      - Check database permissions');
            } else if (error.message.includes('timeout') || error.message.includes('ECONNREFUSED')) {
                console.log('   ⏱️ CONNECTION TIMEOUT:');
                console.log('      - Check internet connection');
                console.log('      - Verify cluster is running in MongoDB Atlas');
                console.log('      - Check IP whitelist (add 0.0.0.0/0 for testing)');
            } else if (error.message.includes('hostname') || error.message.includes('ENOTFOUND')) {
                console.log('   🌐 HOSTNAME ERROR:');
                console.log('      - Cluster hostname might be wrong');
                console.log('      - Check MongoDB Atlas dashboard for correct URL');
            } else {
                console.log('   🔧 OTHER ERROR:');
                console.log('      - Error type:', error.name);
                console.log('      - Full message:', error.message);
            }
            
            connectionAttempt++;
            if (connectionAttempt <= maxAttempts) {
                console.log(`   ⏳ Waiting 2 seconds before retry...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    // Clean up
    try {
        await mongoose.connection.close();
        console.log('\n🔌 Connection closed');
    } catch (e) {
        console.log('\n⚠️ Error closing connection:', e.message);
    }

    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('If connection failed, the most common issues are:');
    console.log('1. MongoDB Atlas cluster not created or paused');
    console.log('2. Incorrect connection string from Atlas');
    console.log('3. Database user not created or wrong credentials');
    console.log('4. IP not whitelisted in MongoDB Atlas');
    console.log('5. Network/firewall blocking connection');
}

// Run diagnosis
diagnoseMongoDB()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('\n💥 Diagnosis script error:', error);
        process.exit(1);
    });

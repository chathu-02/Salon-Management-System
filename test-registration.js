const axios = require('axios');

const testRegistration = async () => {
  try {
    const testData = {
      username: 'testuser123',
      email: 'test@example.com',
      password: 'password123'
    };

    console.log('Testing registration with data:', JSON.stringify(testData, null, 2));

    const response = await axios.post('http://localhost:5000/api/auth/register', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('Registration successful:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Registration failed:');
      console.log('Status:', error.response.status);
      console.log('Error data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('Request error:', error.message);
    }
  }
};

testRegistration();

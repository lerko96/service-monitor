require('dotenv').config();
const { checkAllServices } = require('./serviceChecker');

async function runTest() {
  console.log('Starting service check test...');
  
  try {
    const results = await checkAllServices();
    console.log('Check results:', JSON.stringify(results, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest(); 
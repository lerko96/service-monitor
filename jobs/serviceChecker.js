const axios = require('axios');
const { runQuery, getAll } = require('../database/db');

// Constants from environment variables or defaults
const REQUEST_TIMEOUT = process.env.REQUEST_TIMEOUT || 5000; // 5 seconds

/**
 * Record a check result in the database
 * @param {number} serviceId - ID of the service
 * @param {Object} result - Check result object
 */
async function recordCheckResult(serviceId, result) {
  try {
    await runQuery(
      `INSERT INTO service_checks (service_id, status_code, response_time, is_up)
       VALUES (?, ?, ?, ?)`,
      [serviceId, result.statusCode, result.responseTime, result.isUp ? 1 : 0]
    );
  } catch (error) {
    console.error(`Error recording check result for service ${serviceId}:`, error);
    throw error; // Re-throw to handle in the calling function
  }
}

/**
 * Check a single service and record its status
 * @param {Object} service - Service object with id, name, and url
 * @returns {Promise<Object>} Check result
 */
async function checkService(service) {
  console.log(`Checking service: ${service.name} (${service.url})`);
  const startTime = Date.now();
  let statusCode = null;
  let isUp = false;
  let responseTime = null;

  try {
    const response = await axios.get(service.url, {
      timeout: REQUEST_TIMEOUT,
      validateStatus: null // Don't throw on any status code
    });

    responseTime = Date.now() - startTime;
    statusCode = response.status;
    
    // Determine service status
    // - Response time > 5000ms: status = "slow"
    // - Status code 200-299: status = "up"
    // - All other cases: status = "down"
    isUp = responseTime <= 5000 && response.status >= 200 && response.status < 300;

    console.log(`Service ${service.name} check result: status=${statusCode}, time=${responseTime}ms, up=${isUp}`);

    // Record check result
    await recordCheckResult(service.id, {
      statusCode,
      responseTime,
      isUp
    });

    return {
      serviceId: service.id,
      statusCode,
      responseTime,
      isUp,
      error: null
    };
  } catch (error) {
    responseTime = Date.now() - startTime;
    
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      statusCode = 0;
      console.log(`Service ${service.name} timed out after ${responseTime}ms`);
    } else if (error.response) {
      statusCode = error.response.status;
      console.log(`Service ${service.name} returned error status ${statusCode}`);
    } else {
      statusCode = 0;
      console.log(`Service ${service.name} check failed: ${error.message}`);
    }

    isUp = false;

    // Record check result even for failures
    await recordCheckResult(service.id, {
      statusCode,
      responseTime,
      isUp
    });

    return {
      serviceId: service.id,
      statusCode,
      responseTime,
      isUp,
      error: error.message
    };
  }
}

/**
 * Check all services in the database
 * @returns {Promise<Array>} Array of check results
 */
async function checkAllServices() {
  try {
    // Get all services
    const services = await getAll('SELECT * FROM services');
    console.log(`Starting checks for ${services.length} services...`);

    // Check all services in parallel
    const checkPromises = services.map(service => checkService(service));
    const results = await Promise.allSettled(checkPromises);

    // Process results
    const successfulChecks = results.filter(r => r.status === 'fulfilled').length;
    const failedChecks = results.filter(r => r.status === 'rejected').length;

    console.log(`Check complete: ${successfulChecks} successful, ${failedChecks} failed`);
    
    return results.map(r => r.status === 'fulfilled' ? r.value : { error: r.reason });
  } catch (error) {
    console.error('Error checking all services:', error);
    throw error; // Re-throw to handle in the scheduler
  }
}

module.exports = {
  checkService,
  checkAllServices
}; 
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
      `INSERT INTO service_checks (service_id, status_code, response_time, is_up, state)
       VALUES (?, ?, ?, ?, ?)`,
      [serviceId, result.statusCode, result.responseTime, result.isUp ? 1 : 0, result.state]
    );
  } catch (error) {
    console.error(`Error recording check result for service ${serviceId}:`, error);
    throw error; // Re-throw to handle in the calling function
  }
}

/**
 * Determine service status based on response
 * @param {number} statusCode - HTTP status code
 * @param {number} responseTime - Response time in milliseconds
 * @returns {Object} Status object with isUp and state properties
 */
function determineServiceStatus(statusCode, responseTime) {
  if (responseTime > REQUEST_TIMEOUT) {
    return { isUp: false, state: 'SLOW' };
  }
  
  if (statusCode >= 200 && statusCode < 300) {
    return { isUp: true, state: 'UP' };
  }
  
  if (statusCode >= 400 && statusCode < 500) {
    return { isUp: false, state: 'RESTRICTED' };
  }
  
  return { isUp: false, state: 'DOWN' };
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
  let responseTime = null;
  let state = 'DOWN';

  try {
    const response = await axios.get(service.url, {
      timeout: REQUEST_TIMEOUT,
      validateStatus: null // Don't throw on any status code
    });

    responseTime = Date.now() - startTime;
    statusCode = response.status;
    
    // Determine service status
    const status = determineServiceStatus(statusCode, responseTime);
    state = status.state;

    console.log(`Service ${service.name} check result: status=${statusCode}, time=${responseTime}ms, state=${state}`);

    // Record check result
    await recordCheckResult(service.id, {
      statusCode,
      responseTime,
      isUp: status.isUp,
      state
    });

    return {
      serviceId: service.id,
      statusCode,
      responseTime,
      isUp: status.isUp,
      state,
      error: null
    };
  } catch (error) {
    responseTime = Date.now() - startTime;
    
    // Handle different types of errors
    if (error.code === 'ECONNABORTED') {
      statusCode = 0;
      state = 'TIMEOUT';
      console.log(`Service ${service.name} timed out after ${responseTime}ms`);
    } else if (error.response) {
      statusCode = error.response.status;
      const status = determineServiceStatus(statusCode, responseTime);
      state = status.state;
      console.log(`Service ${service.name} returned error status ${statusCode}`);
    } else {
      statusCode = 0;
      state = 'DOWN';
      console.log(`Service ${service.name} check failed: ${error.message}`);
    }

    // Record check result even for failures
    await recordCheckResult(service.id, {
      statusCode,
      responseTime,
      isUp: false,
      state
    });

    return {
      serviceId: service.id,
      statusCode,
      responseTime,
      isUp: false,
      state,
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
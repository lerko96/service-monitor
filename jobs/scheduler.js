const cron = require('node-cron');
const { checkAllServices } = require('./serviceChecker');

// Get check interval from environment variable or default to 30 seconds in development
const CHECK_INTERVAL_SECONDS = process.env.NODE_ENV === 'production' 
  ? (process.env.CHECK_INTERVAL_SECONDS || 300) // 5 minutes in production
  : 30; // 30 seconds in development

/**
 * Initialize the monitoring scheduler
 * This will run service checks every CHECK_INTERVAL_SECONDS seconds
 */
function initScheduler() {
  // Validate check interval
  if (CHECK_INTERVAL_SECONDS < 10) {
    console.error('CHECK_INTERVAL_SECONDS must be at least 10 seconds');
    process.exit(1);
  }

  // Create cron expression for the specified interval (in seconds)
  const cronExpression = `*/${Math.floor(CHECK_INTERVAL_SECONDS)} * * * * *`;

  // Validate cron expression
  if (!cron.validate(cronExpression)) {
    console.error('Invalid cron expression:', cronExpression);
    process.exit(1);
  }

  console.log(`Initializing service checker to run every ${CHECK_INTERVAL_SECONDS} second(s)`);
  console.log('Next check scheduled for:', getNextRunTime(CHECK_INTERVAL_SECONDS));

  // Schedule the service checks
  cron.schedule(cronExpression, async () => {
    console.log('\n=== Starting scheduled service check ===');
    console.log('Time:', new Date().toISOString());
    
    try {
      const results = await checkAllServices();
      console.log('\nCheck Results:');
      results.forEach(result => {
        if (result.error) {
          console.log(`❌ Service ${result.serviceId}: ${result.error}`);
        } else {
          console.log(
            `${result.isUp ? '✅' : '❌'} Service ${result.serviceId}: ` +
            `status=${result.statusCode}, time=${result.responseTime}ms`
          );
        }
      });
    } catch (error) {
      console.error('Error during scheduled check:', error);
    }

    console.log('\nNext check scheduled for:', getNextRunTime(CHECK_INTERVAL_SECONDS));
    console.log('==========================================\n');
  });

  // Run an initial check immediately
  console.log('\nRunning initial service check...');
  checkAllServices()
    .then(results => {
      console.log('Initial check complete');
      results.forEach(result => {
        if (result.error) {
          console.log(`❌ Service ${result.serviceId}: ${result.error}`);
        } else {
          console.log(
            `${result.isUp ? '✅' : '❌'} Service ${result.serviceId}: ` +
            `status=${result.statusCode}, time=${result.responseTime}ms`
          );
        }
      });
      console.log('Next check scheduled for:', getNextRunTime(CHECK_INTERVAL_SECONDS));
    })
    .catch(error => {
      console.error('Error during initial check:', error);
    });
}

/**
 * Calculate the next run time based on the interval
 * @param {number} intervalSeconds - Check interval in seconds
 * @returns {string} Formatted next run time
 */
function getNextRunTime(intervalSeconds) {
  const now = new Date();
  const next = new Date(now);
  next.setSeconds(Math.ceil(now.getSeconds() / intervalSeconds) * intervalSeconds);
  next.setMilliseconds(0);
  return next.toLocaleString();
}

module.exports = {
  initScheduler
}; 
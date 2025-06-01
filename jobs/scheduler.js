const cron = require('node-cron');
const { checkAllServices } = require('./serviceChecker');

// Get check interval from environment variable or default to 1 minute in development
const CHECK_INTERVAL = process.env.NODE_ENV === 'production' 
  ? (process.env.CHECK_INTERVAL || 5)
  : 1;

/**
 * Initialize the monitoring scheduler
 * This will run service checks every CHECK_INTERVAL minutes
 */
function initScheduler() {
  // Validate check interval
  if (CHECK_INTERVAL < 1) {
    console.error('CHECK_INTERVAL must be at least 1 minute');
    process.exit(1);
  }

  // Create cron expression for the specified interval
  const cronExpression = `*/${CHECK_INTERVAL} * * * *`;

  // Validate cron expression
  if (!cron.validate(cronExpression)) {
    console.error('Invalid cron expression:', cronExpression);
    process.exit(1);
  }

  console.log(`Initializing service checker to run every ${CHECK_INTERVAL} minute(s)`);
  console.log('Next check scheduled for:', getNextRunTime(CHECK_INTERVAL));

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

    console.log('\nNext check scheduled for:', getNextRunTime(CHECK_INTERVAL));
    console.log('==========================================\n');
  });

  // Run an initial check immediately
  console.log('\nRunning initial service check...');
  checkAllServices()
    .then(results => {
      console.log('Initial check complete');
      console.log('Next check scheduled for:', getNextRunTime(CHECK_INTERVAL));
    })
    .catch(error => {
      console.error('Error during initial check:', error);
    });
}

/**
 * Calculate the next run time based on the interval
 * @param {number} intervalMinutes - Check interval in minutes
 * @returns {string} Formatted next run time
 */
function getNextRunTime(intervalMinutes) {
  const now = new Date();
  const next = new Date(now);
  next.setMinutes(Math.ceil(now.getMinutes() / intervalMinutes) * intervalMinutes);
  next.setSeconds(0);
  next.setMilliseconds(0);
  return next.toLocaleString();
}

module.exports = {
  initScheduler
}; 
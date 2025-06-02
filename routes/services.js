const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { runQuery, getOne, getAll } = require('../database/db');
const { checkService } = require('../jobs/serviceChecker');

// URL validation helper
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// List user's services with latest status
router.get('/', authenticateToken, async (req, res) => {
  try {
    const services = await getAll(`
      SELECT 
        s.*,
        c.id as latest_check_id,
        c.status_code,
        c.response_time,
        c.is_up,
        c.state,
        c.checked_at
      FROM services s
      LEFT JOIN (
        SELECT 
          service_id,
          MAX(checked_at) as max_checked_at
        FROM service_checks
        GROUP BY service_id
      ) latest ON s.id = latest.service_id
      LEFT JOIN service_checks c ON c.service_id = s.id 
        AND c.checked_at = latest.max_checked_at
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `, [req.user.id]);

    // Format the response
    const formattedServices = services.map(service => ({
      id: service.id,
      user_id: service.user_id,
      name: service.name,
      url: service.url,
      created_at: service.created_at,
      latest_check: service.latest_check_id ? {
        id: service.latest_check_id,
        status_code: service.status_code,
        response_time: service.response_time,
        is_up: Boolean(service.is_up),
        state: service.state,
        checked_at: service.checked_at
      } : null
    }));

    res.json(formattedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Error fetching services' });
  }
});

// Add new service
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, url } = req.body;

    // Validate input
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Insert new service
    const result = await runQuery(
      'INSERT INTO services (user_id, name, url) VALUES (?, ?, ?)',
      [req.user.id, name, url]
    );

    const newService = await getOne(
      'SELECT * FROM services WHERE id = ?',
      [result.lastID]
    );

    // Perform immediate check
    try {
      const checkResult = await checkService(newService);
      newService.latest_check = {
        id: null, // We don't have this information from checkService
        status_code: checkResult.statusCode,
        response_time: checkResult.responseTime,
        is_up: checkResult.isUp,
        checked_at: new Date().toISOString()
      };
    } catch (checkError) {
      console.error('Error performing initial service check:', checkError);
      // Don't fail the request if the check fails
    }

    res.status(201).json(newService);
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({ error: 'Error adding service' });
  }
});

// Delete service
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if service exists and belongs to user
    const service = await getOne(
      'SELECT * FROM services WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Delete service (cascade will handle check results)
    await runQuery(
      'DELETE FROM services WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Error deleting service' });
  }
});

// Get service check history with pagination
router.get('/:id/checks', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Check if service exists and belongs to user
    const service = await getOne(
      'SELECT * FROM services WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Get total count
    const countResult = await getOne(
      'SELECT COUNT(*) as total FROM service_checks WHERE service_id = ?',
      [req.params.id]
    );

    // Get paginated check history
    const checks = await getAll(
      `SELECT * FROM service_checks 
       WHERE service_id = ? 
       ORDER BY checked_at DESC 
       LIMIT ? OFFSET ?`,
      [req.params.id, limit, offset]
    );

    // Get statistics
    const stats = await getOne(`
      SELECT 
        COUNT(*) as total_checks,
        SUM(CASE WHEN is_up = 1 THEN 1 ELSE 0 END) as successful_checks,
        AVG(response_time) as avg_response_time,
        MIN(response_time) as min_response_time,
        MAX(response_time) as max_response_time
      FROM service_checks
      WHERE service_id = ?
    `, [req.params.id]);

    res.json({
      service,
      checks,
      statistics: {
        uptime: stats.total_checks ? (stats.successful_checks / stats.total_checks * 100).toFixed(2) + '%' : 'N/A',
        avg_response_time: stats.avg_response_time ? Math.round(stats.avg_response_time) + 'ms' : 'N/A',
        min_response_time: stats.min_response_time ? stats.min_response_time + 'ms' : 'N/A',
        max_response_time: stats.max_response_time ? stats.max_response_time + 'ms' : 'N/A',
        total_checks: stats.total_checks
      },
      pagination: {
        total: countResult.total,
        page,
        limit,
        total_pages: Math.ceil(countResult.total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching check history:', error);
    res.status(500).json({ error: 'Error fetching check history' });
  }
});

module.exports = router; 
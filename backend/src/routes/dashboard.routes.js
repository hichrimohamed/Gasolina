const router     = require('express').Router();
const controller = require('../controllers/dashboard.controller');
const { validateDateRange } = require('../middleware/validate.middleware');

router.get('/kpis',  validateDateRange, controller.getKPIs);
router.get('/daily', validateDateRange, controller.getDaily);

module.exports = router;

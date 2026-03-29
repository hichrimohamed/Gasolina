const router     = require('express').Router();
const controller = require('../controllers/dashboard.controller');

router.get('/kpis',  controller.getKPIs);
router.get('/daily', controller.getDaily);

module.exports = router;

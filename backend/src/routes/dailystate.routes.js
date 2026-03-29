const router     = require('express').Router();
const controller = require('../controllers/dailystate.controller');
const { validateDateRange } = require('../middleware/validate.middleware');

router.get('/',         validateDateRange, controller.getDailyState);
router.get('/recettes', validateDateRange, controller.getRecettes);
router.get('/depenses', validateDateRange, controller.getDepenses);

module.exports = router;

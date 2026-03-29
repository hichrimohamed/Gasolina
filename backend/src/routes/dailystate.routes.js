const router     = require('express').Router();
const controller = require('../controllers/dailystate.controller');

router.get('/',         controller.getDailyState);
router.get('/recettes', controller.getRecettes);
router.get('/depenses', controller.getDepenses);

module.exports = router;

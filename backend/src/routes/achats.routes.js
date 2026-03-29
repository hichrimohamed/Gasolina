const router     = require('express').Router();
const controller = require('../controllers/achats.controller');

router.get('/carburants', controller.getCarburants);
router.get('/produits',   controller.getProduits);

module.exports = router;

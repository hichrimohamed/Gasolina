const router     = require('express').Router();
const controller = require('../controllers/workers.controller');
const { requireAdmin } = require('../middleware/auth.middleware');

router.get('/',      controller.getAll);
router.post('/',     requireAdmin, controller.create);
router.put('/:id',   requireAdmin, controller.update);
router.delete('/:id', requireAdmin, controller.deactivate);

module.exports = router;

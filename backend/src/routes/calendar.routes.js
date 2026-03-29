const router     = require('express').Router();
const controller = require('../controllers/calendar.controller');

router.get('/all',   controller.getAllEvents);
router.get('/',      controller.getEvents);
router.post('/',     controller.createEvent);
router.put('/:id',   controller.updateEvent);
router.delete('/:id', controller.deleteEvent);

module.exports = router;

const express = require('express');
const { addVehicle, getVehiclesForUser } = require('../controllers/vehicleController');

const router = express.Router();

router.post('/add', addVehicle);
router.get('/user/:userId', getVehiclesForUser);

module.exports = router;


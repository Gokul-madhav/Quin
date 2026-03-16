const Joi = require('joi');
const { getDb } = require('../services/firebaseService');

const addVehicleSchema = Joi.object({
  user_id: Joi.string().required(),
  vehicle_number: Joi.string().max(50).required(),
  owner_name: Joi.string().max(255).required(),
  model: Joi.string().max(255).allow('', null),
  color: Joi.string().max(255).allow('', null),
});

const addVehicle = async (req, res, next) => {
  try {
    const { value, error } = addVehicleSchema.validate(req.body || {});
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    const { user_id: userId, vehicle_number: vehicleNumber, owner_name: ownerName, model, color } =
      value;

    const db = getDb();
    const vehicleRef = db.ref('vehicles').push();
    const vehicleId = vehicleRef.key;

    const vehicleData = {
      vehicle_id: vehicleId,
      owner_id: userId,
      vehicle_number: vehicleNumber,
      owner_name: ownerName,
      model: model || null,
      color: color || null,
      created_at: new Date().toISOString(),
    };

    await vehicleRef.set(vehicleData);

    return res.status(201).json({
      message: 'Vehicle added',
      vehicle: vehicleData,
    });
  } catch (err) {
    return next(err);
  }
};

const getVehiclesForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const db = getDb();
    const snapshot = await db.ref('vehicles').orderByChild('owner_id').equalTo(userId).once('value');
    const data = snapshot.val() || {};
    const vehicles = Object.values(data);

    return res.json({ vehicles });
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  addVehicle,
  getVehiclesForUser,
};


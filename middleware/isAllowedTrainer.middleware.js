const Trainer = require("../models/Trainer.model")

exports.isAllowedTrainer = async (req, res, next) => {
  const { _id: trainerIdPayload } = req.payload
  const { trainerId: trainerIdParams } = req.params

  // check if ids from payload and params match
  if (trainerIdPayload !== trainerIdParams) {
    res.status(404)
      .json({ messsage: "Trainer credentials not valid"})
    return
  }

  // check if trainerId is in db
  const trainerId = trainerIdPayload
  const trainerInDB = await Trainer.findById(trainerId)
  if (!trainerInDB) {
    res.status(404).json({ message: "Trainer credentials not found in db" })
    return
  }

  next()
}
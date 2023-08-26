const Trainee = require("../models/Trainee.model")
const Trainer = require("../models/Trainer.model")

exports.isTraineeOrAllowedTrainer = async (req, res, next) => {
  try {
    const { _id } = req.payload
    
    const trainerInDB = await Trainer.findById(_id)
    if (trainerInDB) {
      const idPayload = _id
      const { trainerId: idParams } = req.params
      if (idPayload !== idParams) {
        res.status(401).json({ message: "Unauthorized access" })
        return
      }
    } else if (!trainerInDB) { 
      const traineeInDB = await Trainee.findById(_id)
      if (!traineeInDB) { 
        res.status(403).json({ message: "Forbidden access" })
        return
      }
    }

    next()
  } catch (error) {
    res.status(500).json({message: "Internal Server Error"})
  }
}

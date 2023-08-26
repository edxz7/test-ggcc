const Trainer = require('../models/Trainer.model')

exports.selfTraineeOrAllowedTrainer = async (req, res, next) => { 
  try {
    const { traineeId } = req.params
    const { _id: idPayload } = req.payload

    const trainerAccessing = await Trainer.findById(idPayload)
    const actualTrainer = await Trainer.findOne({ trainees: traineeId })

    // catches Trainee accessing to different Trainee info.
    if (traineeId !== idPayload && !trainerAccessing) {
      res.status(403).json({ message: "Trainee credentials don't match" })
      return
    }

    // Catches trainers to access trainee that doesn't have an asigned Trainer
    if (!actualTrainer && traineeId !== idPayload) {
      res
        .status(404)
        .json({ message: "Trainer not found in Trainee credentials" })
      return
    }

    // Catches if trainer accessing is asking for info of a Trainee that is not in list.
    if (
      actualTrainer && traineeId !== idPayload && 
      JSON.stringify(trainerAccessing._id) !== JSON.stringify(actualTrainer._id)
    ) {
      res
        .status(403)
        .json({ message: "Traineer credentials don't match with Trainee" })
      return
    }

    next()
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error (middleware)" })
  }
}
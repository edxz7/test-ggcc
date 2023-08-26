const Appointment = require("../models/Appointment.model")
const Trainee = require("../models/Trainee.model")
const Trainer = require("../models/Trainer.model")

exports.appointmentAvailable = async (req, res, next) => {
  try {
    const { appointmentId, trainerId } = req.params

    // verifies that the appointment is in DB
    const appointmentInDB = await Appointment.findById(appointmentId)
    if (!appointmentInDB) {
      res.status(404).json({ message: "Not found: Appointment not found in DB" })
      return
    }

    // Verifies that there's a trainer in db
    const trainerInDB = await Trainer.findById(trainerId)
    if (!trainerInDB) {
      res
        .status(404)
        .json({ message: "Not found: Trainer target not found in DB" })
      return
    }

    // Verifies that the appintment can be accessed to add a trainee
    const traineeInDB = await Trainee.findById(req.params.traineeId)

    if (traineeInDB &&  !appointmentInDB.isAvailable && JSON.stringify(traineeInDB._id) !== JSON.stringify(appointmentInDB.traineeId)) {
      res.status(423)
        .json({
          message:
            "Locked Appointment: It has a booking already for a different Trainee",
        })
      return
    }

    // Verifies that the appointment is inside the target Trainer
    const { schedule: trainerSchedule } = await Trainer.findById(trainerId)
    let appointmentInTrainerSchedule = false
    trainerSchedule.forEach((appointment) => {
      if (JSON.stringify(appointment) === JSON.stringify(appointmentInDB._id)) {
        appointmentInTrainerSchedule = true
      }
    })
    if (!appointmentInTrainerSchedule) {
      res
        .status(404)
        .json({ message: "Not found: Appointment not found in target Trainer" })
      return
    }

    // If traineeId, verifies that the trainee is inside the target Trainer
    let traineeInList = true
    if (req.params.traineeId) {
      const { traineeId } = req.params
      const traineeInTraineeList = await Trainer.findOne({
        trainees: traineeId,
      })
      if (!traineeInTraineeList) {
        traineeInList = false
      }
    }
    if (!traineeInList) {
      res
        .status(404)
        .json({ message: "Not found: Trainee not found in target Trainer" })
      return
    }

    next()
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" })
  }
}
const router = require("express").Router()

const {
  postCreateAppointment,
  getAllAppointmentsByTrainer,
  putAddTrainee,
  patchRemoveTrainee,
  deleteAppointment,
} = require("../controllers/appointment.controller")

// Verifies that is a Trainee is in DB
const { isTrainee } = require("../middleware/isTrainee.middleware")

// Verifies that Trainer payload data and params data match, and that Trainer is in Db
const { isAllowedTrainer } = require("../middleware/isAllowedTrainer.middleware")

// Verifies that Trainee payload data and params data match, and that Trainee is in Db
const { isAllowedTrainee } = require("../middleware/isAllowedTrainee.middleware")

// Verifies Appointment existance in DB,  if Appointment is avaible to edit, if trainer is in DB, if appointment is inside trainers schedule and if trainee is inside trainer list of trainees.
const { appointmentAvailable } = require("../middleware/appointmentAvailable.middleware")


// Create available Appointment and add it to Trainer (creation of appointments from 24 hours)
router.post("/trainer/:trainerId", isAllowedTrainer, postCreateAppointment)

// Get alla Appointments from Trainer
router.get('/trainer/:trainerId', isAllowedTrainer, getAllAppointmentsByTrainer)

// Updated Appointment from trainer's list to add a trainee (only before 48 hours)
router.put(
  "/:appointmentId/trainer/:trainerId/trainee/:traineeId",
  isAllowedTrainee,
  appointmentAvailable,
  putAddTrainee
)

// Remove appointment from Trainer list by trainee ( only before 48 hours)
router.patch(
  "/:appointmentId/trainer/:trainerId/trainee/:traineeId",
  isAllowedTrainee,
  appointmentAvailable,
  patchRemoveTrainee
)

// Delete Appointment from Trainer's appointment list (only if not booked already and before 24h)
router.delete(
  "/:appointmentId/trainer/:trainerId/",
  isAllowedTrainer,
  appointmentAvailable,
  deleteAppointment
)

module.exports = router

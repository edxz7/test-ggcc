const router = require("express").Router()
const {
  getAllTrainers,
  getTrainer,
  putUpdateTrainer,
  putAddTrainee,
} = require("../controllers/trainer.controller")
const {
  isAllowedTrainee,
} = require("../middleware/isAllowedTrainee.middleware")

const { isTrainee } = require("../middleware/isTrainee.middleware")

const {
  isTraineeOrAllowedTrainer,
} = require("../middleware/isTraineeOrAllowedTrainer")

const {
  isAllowedTrainer,
} = require("../middleware/isAllowedTrainer.middleware")

// only trainees can see trainers
router.get("/", isTrainee, getAllTrainers)

// only trainee can see trainer, and only allowed trainer (self) can see own details
router.get("/:trainerId", isTraineeOrAllowedTrainer, getTrainer)

// only allows trainer (self) can update own details
router.put("/:trainerId", isAllowedTrainer, putUpdateTrainer)

// allows trainee to add him into a trainer's trainees list
router.put("/:trainerId/trainee/:traineeId", isAllowedTrainee, putAddTrainee)

module.exports = router

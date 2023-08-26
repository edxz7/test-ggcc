const router = require("express").Router()

const {
  getTrainee,
  putUpdateTrainee,
  putAddExercisePlan,
} = require("../controllers/trainees.controller")
const { isAllowedTrainee } = require("../middleware/isAllowedTrainee.middleware")
const { selfTraineeOrAllowedTrainer } = require("../middleware/selfTraineeOrAllowedTrainer.middleware")

// Trainee 
router.get("/:traineeId", selfTraineeOrAllowedTrainer, getTrainee)

// Trainee update self info
router.put("/:traineeId", isAllowedTrainee, putUpdateTrainee)

// Add exercise plan to trainee
// router.put("/:traineeId/exercise-plan", selfTraineeOrAllowedTrainer, putAddExercisePlan)

module.exports = router

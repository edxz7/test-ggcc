const {
  getAllExercises,
  postCustomExerciseToTraineePlan,
  putUpdateCustomExercise,
  deleteCustomExerciseAndRemoveInTraineePlan,
} = require("../controllers/exercises.controller")
const { selfTraineeOrAllowedTrainer } = require('../middleware/selfTraineeOrAllowedTrainer.middleware')

const router = require('express').Router()

// can accept query parameters (type and muscle). Returns base exercises
router.get('/', getAllExercises)

// Creates custom exercise from exercise database and adds to exercise routine of Trainee
router.post(
  "/:exerciseId/trainee/:traineeId",
  selfTraineeOrAllowedTrainer,
  postCustomExerciseToTraineePlan
)

router.put(
  "/:customExerciseId/trainee/:traineeId",
  selfTraineeOrAllowedTrainer,
  putUpdateCustomExercise
)

// deletes existing custom exercise from db, and from exercise routine of Trainee
router.delete(
  "/:customExerciseId/trainee/:traineeId",
  selfTraineeOrAllowedTrainer,
  deleteCustomExerciseAndRemoveInTraineePlan
)

module.exports = router
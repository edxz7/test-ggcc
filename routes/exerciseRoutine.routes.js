const router = require('express').Router()

const {
  postNewExerciseRoutine,
  putUpdateExerciseRoutine,
  deleteExerciseRoutine,
} = require("../controllers/exerciseRoutine.controller")
const { selfTraineeOrAllowedTrainer } = require('../middleware/selfTraineeOrAllowedTrainer.middleware')

// Adds a new routine to trainee, can be done by trainee or trainer
router.post('/trainee/:traineeId', selfTraineeOrAllowedTrainer, postNewExerciseRoutine)

router.put("/:exerciseRoutineId/trainee/:traineeId", selfTraineeOrAllowedTrainer, putUpdateExerciseRoutine)

router.delete('/:exerciseRoutineId/trainee/:traineeId', selfTraineeOrAllowedTrainer, deleteExerciseRoutine)

module.exports = router
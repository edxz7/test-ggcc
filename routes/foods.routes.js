const { selfTraineeOrAllowedTrainer } = require("../middleware/selfTraineeOrAllowedTrainer.middleware")

const {
  getQueryFood,
  postFoodToTraineePortion,
  putUpdateFood,
  deleteFoodAndRemoveFromTraineePortion,
} = require("../controllers/foods.controller")

const router = require("express").Router()

// can only accept query parameters. Returns food from API 
// Must receive serving_size_g and name
router.get("/", getQueryFood)

// Creates food from food API and adds to portion in nutritionPlan of Trainee
router.post(
  "/trainee/:traineeId",
  selfTraineeOrAllowedTrainer,
  postFoodToTraineePortion
)

// Updates food data by a new food API query
router.put(
  "/:foodId/trainee/:traineeId",
  selfTraineeOrAllowedTrainer,
  putUpdateFood
)

// deletes existing food from db, and from portion of Trainee
router.delete(
  "/:foodId/trainee/:traineeId",
  selfTraineeOrAllowedTrainer,
  deleteFoodAndRemoveFromTraineePortion
)

module.exports = router

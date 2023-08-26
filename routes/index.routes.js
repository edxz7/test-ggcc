const router = require("express").Router()
const { isAuthenticated } = require("../middleware/jwt.middleware")
const trainerRoutes = require('../routes/trainer.routes')
const traineeRoutes = require('../routes/trainee.routes')
const appointmentsRoutes = require('../routes/appointment.routes')
const exercisesRoutes = require('../routes/exercises.routes')
const exerciseRoutineRoutes = require('../routes/exerciseRoutine.routes')

const portionsRoutes = require('../routes/portion.routes')
const foodsRoutes = require('../routes/foods.routes.js')

router.get("/", (req, res, next) => {
  res.status(200).json({ message: "Welcome to Gym-Guru-Connect API" })
})


router.use('/trainers', isAuthenticated, trainerRoutes)
router.use('/trainees', isAuthenticated, traineeRoutes)

router.use('/appointments', isAuthenticated, appointmentsRoutes)

router.use('/exercises', isAuthenticated, exercisesRoutes)
router.use("/exercise-routines", isAuthenticated, exerciseRoutineRoutes)

router.use('/portions', isAuthenticated, portionsRoutes)
router.use('/foods', isAuthenticated, foodsRoutes)

module.exports = router
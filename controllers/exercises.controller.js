const CustomExercise = require('../models/CustomExercise.model')
const Exercise = require('../models/Exercise.model')
const ExerciseRoutine = require('../models/ExerciseRoutine.model')
const Trainee = require('../models/Trainee.model')
const mongoose = require('mongoose')
const { populateExerciseDB } = require('../utils/populateExerciseDB')

const getAllExercises = async (req, res, next) => { 
  try {
    const { query } = req
    if (query) {
      const { type } = query
      const { muscle } = query
      const types = ['cardio', 'omympic_weightlifting', 'polymetrics', 'powerlifting', 'strength', 'stretching', 'strongman']
      const muscles = [
        "abdominals",
        "abductors",
        "adductors",
        "biceps",
        "calves",
        "chest",
        "forearms",
        "glutes",
        "hamstrings",
        "lats",
        "lower_back",
        "middle_back",
        "neck",
        "quadriceps",
        "traps",
        "triceps"
      ]

      if ( type && !types.includes(type) ) {
        res.status(400).json({ message: 'Invalid query parameter' })
        return
      } else if (muscle && !muscles.includes(muscle)) {
        res.status(400).json({ message: "Invalid query parameter" })
        return
      }
    }

    const allExercisesInDB = await Exercise.find()
    if (allExercisesInDB.length === 0) {
      await populateExerciseDB()
    }

    const allExercises = await Exercise.find(query)

    res.status(200).json({ allExercises })
  } catch (error) {
    res.status(500).json({message: "Internal Server Error"})
  }
}

const postCustomExerciseToTraineePlan = async (req, res, next) => {
  try {
    const { reps, intensity, exerciseRoutineId } = req.body
    const { exerciseId, traineeId } = req.params
    if (!reps || !intensity || !exerciseRoutineId) {
      res
        .status(400)
        .json({ message: "reps, intensity and day are required" })
      return
    }
    if (reps < 1 || (reps > 300 && reps % 1 !== 0)) {
      res
        .status(400)
        .json({ message: "reps must be a integer number between 1 and 300" })
      return
    }
    if (intensity < 0.3 || intensity > 1) {
      res.status(400).json({ message: "intensity must be between 0.3 and 1" })
      return
    }

    // verifies if the base exercise is in database
    const exerciseInDB = await Exercise.findById(exerciseId)
    if (!exerciseInDB) {
      res.status(404).json({ message: "exerciseId not found in DB" })
      return
    }

    // Verifies if the routine to update is in database
    const exerciseRoutineInDB = await ExerciseRoutine.findById(exerciseRoutineId)
    if (!exerciseRoutineInDB) {
      res.status(404).json({ message: "exerciseRoutineId not found in DB" })
      return
    }
    
    // Verifies if routine to update is in trainee
    const routineInTrainee = await Trainee.findOne({exercisePlan: exerciseRoutineInDB._id})
    if (!routineInTrainee) {
      res
        .status(404)
        .json({ message: "exerciseRoutineId not found in Trainee data" })
      return
    }

    // Creates a new custom exercise
    const newCustomExercise = await (await CustomExercise.create({
      reps,
      intensity,
      exerciseData: exerciseId
    })).populate('exerciseData')

    // adds the new custom exercise to the routine of the trainee
    const updatedExerciseRoutine = await ExerciseRoutine.findByIdAndUpdate(
      exerciseRoutineId,
      { $push: { exerciseList: newCustomExercise._id } },
      { new: true }
    )

    const updatedTrainee = await Trainee.findById(traineeId)
      .select("-password")
      .populate({
        path: "exercisePlan",
        populate: {
          path: "exerciseList",
          populate: {
            path: "exerciseData",
          },
        },
      })

    res.status(201).json({ /*newCustomExercise, updatedExerciseRoutine,*/ updatedTrainee })
    
  } catch (error) {
    res.status(500).json({ error })
  }
}

const putUpdateCustomExercise = async (req, res) => { 
  try {
    const { customExerciseId, traineeId } = req.params
    const { intensity: intensityBody, reps: repsBody, exerciseId: exerciseIdBody } = req.body

    if (Object.keys(req.body).length === 0) {
      res.status(400).json({ message: 'There must be at least one parameter to update: intensity, reps or base exerciseId(exerciseData)' })
      return
    }

    const customExerciseInDB = await CustomExercise.findById(customExerciseId)
    if (!customExerciseInDB) {
      res.status(404).json({ message: "Custom Exercise not found in DB" })
      return
    }

    const data = {
      intensity: intensityBody ? intensityBody : customExerciseInDB.intensity,
      reps: repsBody ? repsBody : customExerciseInDB.reps,
      exerciseData: exerciseIdBody
        ? exerciseIdBody
        : customExerciseInDB.exerciseData,
    }

    if (data.reps < 1 || data.reps > 300 || data.reps % 1 !== 0) {
      res.status(400).json({
        message: "reps must be a integer number between 1 and 300",
      })
      return
    }
    if (data.intensity < 0.3 || data.intensity > 1) {
      res.status(400).json({ message: "intensity must be between 0.3 and 1" })
      return
    }

    const validExercise = await Exercise.findById(data.exerciseData)
    if(!validExercise) {
      res.status(404).json({ message: 'Base exercise not found in DB' })
      return
    }

    const customExerciseInRoutine = await ExerciseRoutine.find({ exerciseList: customExerciseId })
    if (!customExerciseInRoutine) { 
      res.status(404).json({ message: 'Custom Exercise not found in any Exercise Routine in DB' })
      return
    }

    const routineInTrainee = await Trainee.find({ _id: traineeId, exercisePlan: customExerciseInRoutine._id })
    if (!routineInTrainee) { 
      res.status(404).json({ message: 'Custom Exercise not found in any Exercise Routine of Trainee' })
      return
    }

    const udpatedCustomExercise = await CustomExercise.findByIdAndUpdate(
      customExerciseId,
      { ...data },
      {new: true}
    )

    const updatedTrainee = await Trainee.findById(traineeId)
      .select("-password")
      .populate({
        path: "exercisePlan",
        populate: {
          path: "exerciseList",
          populate: {
            path: "exerciseData",
          },
        },
      })

    res.status(200).json({ /*udpatedCustomExercise, */ updatedTrainee })
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error })
    } else {
      res.status(500).json({ message: "Internal Server Error" })
    }
  }
}

const deleteCustomExerciseAndRemoveInTraineePlan = async (req, res, next) => { 
  try {
    const { customExerciseId, traineeId } = req.params
    const customExerciseInDB = await CustomExercise.findById(customExerciseId)
    if (!customExerciseInDB) {
      res.status(404).json({ message: "Custom Exercise not found in DB" })
      return
    }

    const customExerciseInRoutine = await ExerciseRoutine.findOne({
      exerciseList: customExerciseId,
    })
    if (!customExerciseInRoutine) {
      res
        .status(404)
        .json({ message: "Custom Exercise not found in Exercise Routine" })
      return
    }

    const customExerciseInTrainee = await Trainee.findOne({
      _id: traineeId,
      exercisePlan: customExerciseInRoutine._id
    })
    if (!customExerciseInTrainee) {
      res.status(404).json({ message: "Custom Exercise not found in Trainee" })
      return
    }

    const deletedCustomExercise = await CustomExercise.findByIdAndDelete(customExerciseId)
    const updatedExerciseRoutine = await ExerciseRoutine.findByIdAndUpdate(
      customExerciseInRoutine._id,
      { $pull: { exerciseList: deletedCustomExercise._id } },
      { new: true }
    )
    const udpatedTrainee = await Trainee.findById(traineeId)
      .select("-password")
      .populate({
        path: "exercisePlan",
        populate: {
          path: "exerciseList",
          populate: {
            path: "exerciseData",
          },
        },
      })

    res.status(200).json({udpatedTrainee})

    const customExerciseInTraineeData = await Trainee.find({
      _id: traineeId,
      exercisePlan: customExerciseInRoutine._id,
    })
    if (!customExerciseInTraineeData) {
      res
        .status(404)
        .json({ message: "Custom Exercise not found in Trainee data" })
      return
    }
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error })
    } else {
      res.status(500).json({ message: "Internal Server Error" })
    }
  }
}

module.exports = {
  getAllExercises,
  postCustomExerciseToTraineePlan,
  putUpdateCustomExercise,
  deleteCustomExerciseAndRemoveInTraineePlan,
}
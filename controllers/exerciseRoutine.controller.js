const ExerciseRoutine = require('../models/ExerciseRoutine.model')
const CustomExercise = require('../models/CustomExercise.model')
const Exercise = require('../models/Exercise.model')
const Trainee = require('../models/Trainee.model')
const Trainer = require('../models/Trainer.model')
const mongoose = require('mongoose')

const postNewExerciseRoutine = async (req, res, next) => { 
  try {
    const { traineeId } = req.params
    const { day } = req.body

    if (!day) {
      res.status(400).json({message: "day is a required field"})
      return
    }
    if (day < 1 || day > 6 || day % 1 !== 0) {
      res.status(400).json({ message: "day must be a integer between 1 and 6" })
      return
    }

    const traineeToUpdate = await Trainee.findById(traineeId).populate('exercisePlan')
    const { exercisePlan } = traineeToUpdate
    let dayTaken = false
    if (exercisePlan.length > 0) {
      exercisePlan.forEach(exerciseRoutine => {
        if (exerciseRoutine.day === day) {
          dayTaken = true
          return
        }
      })
    }
    if (dayTaken) {
      res.status(400).json({message: "An exercise routine for this day already exists"})
      return
    }
    
    const newExerciseRoutine = await ExerciseRoutine.create({ day })
    const updatedTrainee = await Trainee.findByIdAndUpdate(
      traineeId,
      { $push: { exercisePlan: newExerciseRoutine._id } },
      { new: true }
    ).select("-password")
      .populate({
        path: "exercisePlan",
        populate: {
          path: "exerciseList",
          populate: {
            path: "exerciseData",
          },
        },
      })
    
    const clonedUpdatedTrainee = JSON.parse(JSON.stringify(updatedTrainee))
    clonedUpdatedTrainee.exercisePlan.sort((a,b) => a.day - b.day)
    
    res.status(201).json({clonedUpdatedTrainee})
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({error})
    } else {
      res.status(500).json({message: "Internal Server Error"})
    }
  }
}

const putUpdateExerciseRoutine = async (req, res) => { 
  try {
    const { exerciseRoutineId, traineeId } = req.params
    const { day } = req.body
    if (!day) {
      res.status(400).json({ message: "day is a required field" })
      return
    }
    if (day < 1 || day > 6 || day % 1 !== 0) {
      res
        .status(400)
        .json({ message: "day must be a integer between 1 and 6" })
      return
    }

    const traineeToUpdate = await Trainee.findById(traineeId).populate(
      "exercisePlan"
    )
    const { exercisePlan } = traineeToUpdate
    let dayTaken = false
    if (exercisePlan.length > 0) {
      exercisePlan.forEach((exerciseRoutine) => {
        if (exerciseRoutine.day === day) {
          dayTaken = true
          return
        }
      })
    }
    if (dayTaken) {
      res
        .status(400)
        .json({ message: "An exercise routine for this day already exists" })
      return
    }

    const updatedExerciseRoutine = await ExerciseRoutine.findByIdAndUpdate(exerciseRoutineId, { day })
    if (!updatedExerciseRoutine) {
      res.status(501).json({ message: "Updates not implemented"})
    }
    
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
    
    res.status(200).json({ updatedTrainee })

  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error })
    } else {
      res.status(500).json({ message: "Internal Server Error" })
    }
  }
}

const deleteExerciseRoutine = async (req, res) => { 
  try {
    const { exerciseRoutineId, traineeId } = req.params

    const routineInDB = await ExerciseRoutine.findById(exerciseRoutineId)
    if (!routineInDB) { 
      res.status(404).json({ message: "Routine not found in Db" })
      return
    }

    const routineInTrainee = await Trainee.find({ _id: traineeId, exercisePlan: exerciseRoutineId })
    if (!routineInTrainee) {
      res.status(404).json({ message: "Routine not found in Db" })
      return
    }
    
    const deletedExerciseRoutine = await ExerciseRoutine.findByIdAndDelete(exerciseRoutineId)
    console.log('deletedExerciseRoutine: ', deletedExerciseRoutine._id)
    const { exerciseList } = deletedExerciseRoutine
    if (exerciseList.length > 0) {
      for (const customExercise of exerciseList) { 
        const deletedCustomExercise = await CustomExercise.findByIdAndDelete(customExercise)
        console.log("deletedCustomExercise: ", deletedCustomExercise._id)
      }
    }

    const updatedTrainee = await Trainee.findByIdAndUpdate(
      traineeId,
      { $pull: { exercisePlan: deletedExerciseRoutine._id } },
      { new: true }
    )
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
    
    res.status(200).json({ updatedTrainee })
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error })
    } else {
      res.status(500).json({ message: "Internal Server Error" })
    }
  }
}

module.exports = {
  postNewExerciseRoutine,
  putUpdateExerciseRoutine,
  deleteExerciseRoutine,
}
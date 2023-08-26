const Portion = require('../models/Portion.model')
const Trainee = require('../models/Trainee.model')
const mongoose = require('mongoose')
const { isValidObjectId } = require('../utils/bodyFieldsValidation')
const Food = require('../models/Food.model')

const postCreatePortion = async (req, res, next) => { 
  try {
    const { traineeId } = req.params
    const { portionNumber } = req.body

    if (!portionNumber) {
      res.status(400).json({ message: "portionNumber is a required parameter" })
      return
    }

    if (portionNumber < 1 || portionNumber > 6 || portionNumber % 1 !== 0) {
      res
        .status(400)
        .json({ message: "portionNumber must be a integer between 1 and 6" })
      return
    }

    const traineeToUpdate = await Trainee.findById(traineeId).populate(
      "nutritionPlan"
    )

    const { nutritionPlan } = traineeToUpdate
    let portionNumberTaken = false
    if (nutritionPlan.length > 0) {
      nutritionPlan.forEach((portion) => {
        if (portion.portionNumber === portionNumber) {
          portionNumberTaken = true
          return
        }
      })
    }
    if (portionNumberTaken) {
      res
        .status(400)
        .json({ message: "A portion with this portionNumber already exists" })
      return
    }

    const newPortion = await Portion.create({ portionNumber })

    const updatedTrainee = await Trainee.findByIdAndUpdate(
      traineeId,
      { $push: { nutritionPlan: newPortion._id } },
      { new: true }
    )
      .select("-password")
      .select('-exercisePlan')
      .populate({
        path: "nutritionPlan",
        populate: {
          path: "foodList"
        }
      })
    
    const clonedUpdatedTrainee = JSON.parse(JSON.stringify(updatedTrainee))
    clonedUpdatedTrainee.nutritionPlan.sort((a, b) => a.portionNumber - b.portionNumber)
    
    res.status(201).json({ clonedUpdatedTrainee })
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error })
    } else {
      res.status(500).json({ message: "Internal Server Error" })
    }
  }
}

const putUpdatePortion = async (req, res) => {
  try {
    const { portionId, traineeId } = req.params
    const { portionNumber } = req.body

    if (!portionNumber) {
      res.status(400).json({ message: "portionNumber is a required field" })
      return
    }
    if (portionNumber < 1 || portionNumber > 6 || portionNumber % 1 !== 0) {
      res
        .status(400)
        .json({ message: "portionNumber must be a integer between 1 and 6" })
      return
    }

    const traineeToUpdate = await Trainee.findById(traineeId).populate(
      "nutritionPlan"
    )
    const { nutritionPlan } = traineeToUpdate
    let portionNumberTaken = false
    if (nutritionPlan.length > 0) {
      nutritionPlan.forEach((portion) => {
        if (portion.portionNumber === portionNumber) {
          portionNumberTaken = true
          return
        }
      })
    }
    if (portionNumberTaken) {
      res
        .status(400)
        .json({ message: "A portion with this portionNumber already exists" })
      return
    }

    const updatedTrainee = await Trainee.findById(traineeId)
      .select("-password")
      .select("-exercisePlan")
      .populate({
        path: "nutritionPlan",
        populate: {
          path: "foodList",
        },
      })
    
    const clonedUpdatedTrainee = JSON.parse(JSON.stringify(updatedTrainee))
    clonedUpdatedTrainee.nutritionPlan.sort(
      (a, b) => a.portionNumber - b.portionNumber
    )

    res.status(200).json({ trainee: clonedUpdatedTrainee })

  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error })
    } else {
      res.status(500).json({ message: "Internal Server Error" })
    }
  }
}

const deletePortion = async (req, res) => {
  try {
    const { portionId, traineeId } = req.params

    if (!isValidObjectId(portionId)) {
      res.status(400).json({ message: "Invalid portionId" })
      return
    }

    const portionInDB = await Portion.findById(portionId)
    if (!portionInDB) { 
      res.status(404).json({ message: "portionId not found in database" })
      return
    }

    const portionInTrainee = await Trainee.findOne({
      _id: traineeId,
      nutritionPlan: portionInDB._id
    })
    if (!portionInTrainee) {
      res.status(404).json({ message: "portionId not found in Trainee target" })
      return
    }

    const deletedPortion = await Portion.findByIdAndDelete(portionId)
    const { foodList } = deletedPortion
    for (const foodId of foodList) { 
      await Food.findByIdAndDelete(foodId)
    }

    const updatedTrainee = await Trainee.findById(traineeId)
      .select("-password")
      .select("-exercisePlan")
      .populate({
        path: "nutritionPlan",
        populate: {
          path: "foodList"
        }
      })
    
    const clonedUpdatedTrainee = JSON.parse(JSON.stringify(updatedTrainee))
    clonedUpdatedTrainee.nutritionPlan.sort(
      (a, b) => a.portionNumber - b.portionNumber
    )

    res.status(200).json({trainee: clonedUpdatedTrain})
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error })
    } else {
      res.status(500).json({ message: "Internal Server Error" })
    }
  }
}

module.exports = { postCreatePortion, putUpdatePortion, deletePortion }
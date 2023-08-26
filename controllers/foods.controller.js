const Food = require('../models/Food.model')
const mongoose = require('mongoose')
const { NINJA_API_URL } = require('../utils/constants')
const axios = require('axios')
const { stringTypesOk, numberTypesOk, numberMinMaxOk, isValidObjectId } = require("../utils/bodyFieldsValidation")
const Portion = require('../models/Portion.model')
const Trainee = require('../models/Trainee.model')
const Trainer = require('../models/Trainer.model')

const getQueryFood = async (req, res, next) => {
  try {
    const { serving_size_g, name } = req.body

    if (!serving_size_g || !name) {
      res.status(400).json({ message: 'serving_size_g and name are required' })
      return
    }

    if (typeof serving_size_g !== 'number' || typeof name !== 'string') { 
      res.status(400).json({ message: "serving_size_g and name must be string type" })
      return
    }

    if (serving_size_g > 1000 || serving_size_g < 1 || serving_size_g % 1 !== 0) {
      res.status(400).json({ message: 'serving_size_g must be an integer between 1 and 1000' })
      return
    }
    
    const baseUrl = NINJA_API_URL
    const apiHeaders = {
      "X-Api-Key": process.env.NINJA_API_KEY,
    }
    
    const queryString = `${serving_size_g}g ${name}`
    
    const { data: foods } = await axios.get(
      `${baseUrl}/nutrition?query=${queryString}`,
      { headers: apiHeaders }
    )

    console.log(foods)
    res.status(200).json({ foods })
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" })
  }
}

const postFoodToTraineePortion = async (req, res) => { 
  try {
    const { traineeId } = req.params
    const {
      portionId,
      name,
      calories,
      serving_size_g,
      fat_total_g,
      fat_saturated_g,
      protein_g,
      sodium_mg,
      potassium_mg,
      cholesterol_mg,
      carbohydrates_total_g,
      fiber_g,
      sugar_g,
    } = req.body

    const stringFields = [name]

    const doubleFields = [
      calories,
      serving_size_g,
      fat_total_g,
      fat_saturated_g,
      protein_g,
      sodium_mg,
      potassium_mg,
      cholesterol_mg,
      carbohydrates_total_g,
      fiber_g,
      sugar_g,
    ]

    if (!portionId) {
      res.status(400).json({ message: "portionId is a required field" })
      return
    }

    if (Object.keys(req.body).length !== 13) {
      res.status(400).json({ message: "All fields required" })
      return
    }

    if (!stringTypesOk(stringFields)) { 
      res.status(400).json({ message: "Fields that must be Strings have another type" })
    }
    
    if (!numberTypesOk(doubleFields)) { 
      res.status(400).json({ message: "Fields that must be Number have another type" })
    }
    
    if (!numberMinMaxOk(doubleFields, 0, 2000)) { 
      res.status(400).json({ message: "Some double fields are surpassing the max and min limits of its value" })
      return
    }

    if (!isValidObjectId(portionId)) {
      res.status(404).json({ message: "portionId not valid" })
      return
    }

    const portionInDB = await Portion.findById(portionId)
    if (!portionInDB) { 
      res.status(404).json({ message: "portionId not found in DB" })
      return
    }

    const traineeWithPortion = await Trainee.findOne({ "nutritionPlan": portionInDB._id })
    if (!traineeWithPortion) { 
      res.status(404).json({ message: "Target Trainee doesn't contain portionId in nutritionPlan" })
      return
    }

    const newFood = await Food.create(req.body)
    const updatedPortion = await Portion.findByIdAndUpdate(
      portionId,
      { $push: { foodList: newFood._id } },
      { new: true }
    ).populate('foodList')

    res.status(201).json({newFood, updatedPortion})
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error })
    } else {
      res.status(500).json({ message: "Internal Server Error" })
    }
  }
}

const putUpdateFood = async (req, res) => {
  try {
    const { foodId, traineeId } = req.params
    const { serving_size_g } = req.body
    const numberFields = [serving_size_g]
    
    if (!isValidObjectId(foodId)) {
      res.status(400).json({ message: "Invalid foodId" })
      return
    }
    if (!serving_size_g) { 
      res.status(400).json({ message: "serving_size_g is required" })
      return
    }
    if (!numberTypesOk(numberFields) || !numberMinMaxOk(numberFields, 0, 1000)) {
      res.status(400).json({ message: "serving_size_g must be an integer between 0 and 1000" })
      return
    }

    const foodInDB = await Food.findById(foodId)
    if (!foodInDB) { 
      res.status(404).json({ message: "foodId not found in database" })
      return
    }
    const foodInPortion = await Portion.findOne({ foodList: foodInDB._id })
    if (!foodInPortion) { 
      res.status(404).json({ message: "foodId not found in any Portion in DB" })
      return
    }
    const foodInTrainee = await Trainee.findOne({_id: traineeId, nutritionPlan: foodInPortion._id})
    if (!foodInTrainee) { 
      res.status(404).json({ message: "foodId not found in nutritionPlan of Trainee target" })
      return
    }

    const updatedFood = await Food.findByIdAndUpdate(
      foodId,
      { serving_size_g },
      {new: true}
    )

    const updatedTrainee = await Trainee.findById(traineeId)
      .select("-password")
      .select("-exercisePlan")
      .populate({
        path: "nutritionPlan",
        populate: {
          path: "foodList",
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

const deleteFoodAndRemoveFromTraineePortion = async (req, res, next) => {
  try {
    const { foodId, traineeId } = req.params

    if (!isValidObjectId(foodId)) {
      res.status(400).json({ message: "invalid foodId" })
      return
    }

    const foodInDB = await Food.findById(foodId)
    if (!foodInDB) {
      res.status(404).json({ message: "foodId not found in database" })
      return
    }
    const foodInPortion = await Portion.findOne({ foodList: foodInDB._id })
    if (!foodInPortion) {
      res.status(404).json({ message: "foodId not found in any Portion in DB" })
      return
    }
    const foodInTrainee = await Trainee.findOne({
      _id: traineeId,
      nutritionPlan: foodInPortion._id,
    })
    if (!foodInTrainee) {
      res.status(404).json({
        message: "foodId not found in nutritionPlan of Trainee target",
      })
      return
    }

    const deletedFood = await Food.findByIdAndDelete(foodId)
    const updatedPortion = await Portion.findByIdAndUpdate(
      foodInPortion._id,
      { $pull: { foodList: deletedFood._id } },
      { new: true }
    )

    res.status(200).json({ message: "food deleted successfully", deletedFood, updatedPortion })
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ error })
    } else {
      res.status(500).json({ message: "Internal Server Error" })
    }
  }
}

module.exports = {
  getQueryFood,
  postFoodToTraineePortion,
  putUpdateFood,
  deleteFoodAndRemoveFromTraineePortion,
}
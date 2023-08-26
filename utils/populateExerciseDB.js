const Exercise = require('../models/Exercise.model')
const axios = require('axios')
const { NINJA_API_URL } = require("./constants")

const populateExerciseDB = async () => {
  const baseUrl = NINJA_API_URL
  const apiHeaders = {
    "X-Api-Key": process.env.NINJA_API_KEY,
  }

  const exercisesToSave = []
  for (let offset = 0; offset < 200; offset++) {
    const { data: exercisesFromApi } = await axios.get(
      `${baseUrl}/exercises?offset=${offset}`,
      { headers: apiHeaders }
    )
    console.log(offset)
    exercisesToSave.push(...exercisesFromApi)
  }

  for (exercise of exercisesToSave) {
    const { name, type, muscle, equipment, instructions } = exercise
    const isCreated = await Exercise.findOne({ name })
    if (!isCreated) {
      const createdExercise = await Exercise.create({
        name,
        type,
        muscle,
        equipment,
        instructions,
      })
      console.log(createdExercise._id)
    }
  }
}

module.exports = {populateExerciseDB}
const { Schema, model } = require('mongoose')


const exerciseSchema = new Schema(
  {
    name: {
      type: String,
    },
    type: {
      type: String,
    },
    muscle: {
      type: String,
    },
    equipment: {
      type: String,
    },
    instructions: {
      type: String,
    }
  },
  {
    timestamps: false,
  }
)

const Exercise = model("Exercise", exerciseSchema)
module.exports = Exercise
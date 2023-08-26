const { Schema, model } = require('mongoose')

const customExercise = new Schema(
  {
    intensity: {
      type: Number,
      required: [true, "intensity is a rqeuired property"],
    },
    reps: {
      type: Number, 
      required: [true, "reps is a required property"],
      default: 12,
    },
    exerciseData:{
      type: Schema.Types.ObjectId,
      ref: "Exercise",
    },
  },
  { timestamps: true }
)

const CustomExercise = model("CustomExercise", customExercise)
module.exports = CustomExercise
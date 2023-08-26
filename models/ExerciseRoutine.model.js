const { Schema, model } = require('mongoose')

const exerciseRoutineSchema = new Schema(
  {
    day: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6],
      required: [true, "Must be a whole number from 1 to 6"]
    },
    exerciseList: [{
      type: Schema.Types.ObjectId,
      ref: "CustomExercise"
    }]
  },
  {
    timestamps: true,
  }
)

const ExerciseRoutine = model("ExerciseRoutine", exerciseRoutineSchema)

module.exports = ExerciseRoutine
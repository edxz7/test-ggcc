const { Schema, model } = require("mongoose");

const traineeSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    name: {
      type: Object,
      required: [true, "Name and Last name are required."],
      default: {
        firstName: "",
        lastName: "",
      },
    },
    isTrainer: {
      type: Boolean,
      default: false
    },
    personalInfo: {
      type: Object,
      default: {
        age: 0,
        height: NaN,
        weight: NaN,
        fatPercent: NaN,
        goal: "",
        comments: "",
      },
    },
    exercisePlan: [{
      type: Schema.Types.ObjectId,
      ref: "ExerciseRoutine"
    }],
    nutritionPlan: [{
      type: Schema.Types.ObjectId,
      ref: "Portion"
    }]
  },
  {
    timestamps: true,
  }
)

const Trainee = model("Trainee", traineeSchema);

module.exports = Trainee

const { Schema, model } = require("mongoose");

const trainerSchema = new Schema(
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
      default: true,
    },
    personalInfo: {
      type: Object,
      default: {
        bio: "",
        expYears: 0,
        phone: NaN,
        address: "",
      },
    },
    schedule: [
      {
        type: Schema.Types.ObjectId,
        ref: "Appointment",
      },
    ],
    trainees: [
      {
        type: Schema.Types.ObjectId,
        ref: "Trainee",
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Trainer = model("Trainer", trainerSchema);

module.exports = Trainer;

const { Schema, model } = require("mongoose")

const appointmentSchema = new Schema(
  {
    dayInfo: {
      type: String,
    },
    hour: {
      type: Number,
    },
    traineeId: {
      type: Schema.Types.ObjectId,
      ref: "Trainee",
      default: null
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
  }
)

const Appointment = model("Appointment", appointmentSchema)
module.exports = Appointment
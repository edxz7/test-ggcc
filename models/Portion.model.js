const { Schema, model } = require('mongoose')

const portionSchema = new Schema(
  {
    portionNumber: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6],
      required: [true, "Must be a whole number from 1 to 6"]
    },
    foodList: [{
      type: Schema.Types.ObjectId,
      ref: "Food"
    }]
  },
  {
    timestamps: true,
  }
)

const Portion = model("Portion", portionSchema)

module.exports = Portion
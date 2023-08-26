const Trainee = require('../models/Trainee.model')

exports.isTrainee = async (req, res, next) => { 
  const { _id: traineeId } = req.payload
  
  const traineeInDB = await Trainee.findById(traineeId)
  if (!traineeInDB) { 
    res.status(403).json({ message: "Forbidden access: Credentials of Treinee account not found" })
    return
  }
  next()
}
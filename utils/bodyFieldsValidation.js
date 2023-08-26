const mongoose = require("mongoose")

const stringTypesOk = (stringFields) => {
  let result = true
  stringFields.forEach((field) => {
    if (typeof field !== "string") {
      result = false
      return
    }
  })
  return result
}

const numberTypesOk = (numberFields) => { 
  let result = true
  numberFields.forEach((field) => {
    if (typeof field !== "number") {
      result = false
      return
    }
  })
  return result
}

const numberMinMaxOk = (numberFields, min, max) => { 
  result = true
  numberFields.forEach((field) => { 
    if (field < min || field > max) {
    result = false
    return
    }
  })
  return result
}

const numberTypesAreInt = (numberFields) => { 
  result = true
  numberFields.forEach((field) => { 
    if (field % 1 !== 0) {
      result = false
      return
    }
  })
  return result
}

const isValidObjectId = (objectId) => {
  return mongoose.Types.ObjectId.isValid(objectId)
}

module.exports = {
  stringTypesOk,
  numberTypesOk,
  numberMinMaxOk,
  numberTypesAreInt,
  isValidObjectId,
}
const joi = require('joi')

const signUpValidator = joi.object({
  first_name: joi.string().required(),
  last_name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  about: joi.string().min(30),
  articles: joi.array().items(joi.string()),
})

const signInValidator = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
})
//user model validation middleware
const validateSignup = async (req, res, next) => {
  const userPayload = req.body
  try {
    await signUpValidator.validateAsync(userPayload)
    next()
  } catch (error) {
    console.log(error)
    return res.status(406).send(error.details[0].message)
  }
}

const validateSignin = async (req, res, next) => {
  const userPayload = req.body
  try {
    await signInValidator.validateAsync(userPayload)
    next()
  } catch (error) {
    console.log(error)
    return res.status(406).send(error.details[0].message)
  }
}

module.exports = { validateSignup, validateSignin }

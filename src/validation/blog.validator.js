const joi = require('joi')

const newBlogValidator = joi.object({
  title: joi.string().min(10).max(100).required(),
  description: joi.string().min(10).max(250).required(),
  body: joi.string().min(250).required(),
  tags: joi.array().items(joi.string().min(3)),
  author: joi.string().allow(''),
  state: joi.string().required().min(5),
  read_count: joi.number().required(),
  reading_time: joi.number().required(),
  createAt: joi.date().default(Date.now()),
})

const editedBlogValidator = joi.object({
  _id: joi.string().required(),
  title: joi.string().min(10).max(100).required(),
  description: joi.string().min(10).max(250).required(),
  body: joi.string().min(250).required(),
  tags: joi.array().items(joi.string().min(3)),
  author: joi.string().required().min(2),
  state: joi.string().required().min(5),
  read_count: joi.number().required(),
  reading_time: joi.number().required(),
  createdAt: joi.date().default(Date.now()),
  updatedAt: joi.date(),
  __v: joi.number(),
})

module.exports = { newBlogValidator, editedBlogValidator }

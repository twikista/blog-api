const blogValidator = require('../validation/blog.validator')

const validateNewBlog = async (req, res, next) => {
  const blogPayload = req.body
  try {
    await blogValidator.newBlogValidator.validateAsync(blogPayload)
    next()
  } catch (error) {
    console.log(error)
    return res.status(406).send(error.details[0].message)
  }
}

const validateUpdateBlog = async (req, res, next) => {
  const blogPayload = req.body
  try {
    await blogValidator.editedBlogValidator.validateAsync(blogPayload)
    next()
  } catch (error) {
    console.log(error)
    return res.status(406).send(error.details[0].message)
  }
}

module.exports = { validateNewBlog, validateUpdateBlog }

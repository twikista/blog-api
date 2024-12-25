const errorHandler = (error, req, res, next) => {
  if (error.name === 'CastError') {
    return res.status(400).json({ error: 'invalid id type' })
  }
  if (error.name === 'ValidationError') {
    // if(error.errors.)
    // console.log(error)
    return res
      .status(400)
      .json({ error: error.message.split(':')[2], type: error.name })
    // .json({error:error})
  }
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'missing or invalid token' })
  }
  console.log(error)
  next(error)
}

module.exports = { errorHandler }

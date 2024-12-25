require('dotenv').config()

const CONFIG = {
  PORT: process.env.PORT,
  MONGODB_URI:
    process.env.NODE_ENV === 'test'
      ? process.env.TEST_MONGODB_URI
      : process.env.MONGODB_URI,
  SECRET_KEY: process.env.SECRET_KEY,
}

module.exports = CONFIG

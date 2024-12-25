const mongoose = require('mongoose')
const CONFIG = require('../config/config')

const connectToDb = async () => {
  try {
    console.log('connecting to DB...')
    await mongoose.connect(CONFIG.MONGODB_URI)
    console.log('connected to database')
  } catch (error) {
    console.log(error)
  }
}

module.exports = connectToDb

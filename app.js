const express = require('express')
const cors = require('cors')
const connectToDB = require('./src/db/mongoDb')
const blogRouter = require('./src/routes/blog')
const authRouter = require('./src/routes/auth')

require('./src/middleware/auth')
const { errorHandler } = require('./src/middleware/error')
const logger = require('./src/logger/logger')
const httpLogger = require('./src/logger/httpLogger')

connectToDB()
const app = express()

app.use(httpLogger)

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//connect to Database

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/blogs', blogRouter)

app.use(errorHandler)

module.exports = app

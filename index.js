const app = require('./app')
const CONFIG = require('./src/config/config')

app.listen(process.env.PORT, () => {
  console.log(`server running on PORT ${CONFIG.PORT}`)
})

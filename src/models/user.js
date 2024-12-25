const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      require: true,
      trim: true,
    },
    last_name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      require: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      trim: true,
    },
    articles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
      },
    ],

    about: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
)

userSchema.plugin(uniqueValidator, {
  message: `provided {PATH} already exist `,
})

userSchema.pre('save', async function (next) {
  const user = this
  const hash = await bcrypt.hash(this.password, 10)
  this.password = hash
  next()
})

userSchema.methods.validatePassword = async function (password) {
  const user = this
  const compare = await bcrypt.compare(password, user.password)
  return compare
}

module.exports = mongoose.model('User', userSchema)

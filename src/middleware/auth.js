const passport = require('passport')
const LocalStrategy = require('passport-local')
const JWTstrategy = require('passport-jwt').Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt
const jsonwebtoken = require('jsonwebtoken')
const UserModel = require('../models/user')

const CONFIG = require('../config/config')
const userValidator = require('../validation/user.validator')
const logger = require('../logger/logger')

passport.use(
  new JWTstrategy(
    {
      secretOrKey: CONFIG.SECRET_KEY,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user)
      } catch (error) {
        done(error)
      }
    }
  )
)
//signup middleware
passport.use(
  'signup',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const first_name = req.body.first_name
        const last_name = req.body.last_name
        const articles = req.body.articles
        const about = req.body.about
        const user = await UserModel.create({
          email,
          password,
          first_name,
          last_name,
          articles,
          about,
        })
        return done(null, user)
      } catch (error) {
        logger.error(error)
        done(error)
      }
    }
  )
)

passport.use(
  'login',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await UserModel.findOne({ email: email })
        if (!user) {
          return done(null, false)
        }

        const validate = await user.validatePassword(password)

        if (!validate) {
          return done(null, false, { message: 'Wrong Password' })
        }

        return done(null, user, { message: 'Logged in Successfully' })
      } catch (error) {
        return done(error)
      }
    }
  )
)

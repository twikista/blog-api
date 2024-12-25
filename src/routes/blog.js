const express = require('express')
const passport = require('passport')
const blogRouter = express.Router()
const blogController = require('../controllers/blogController')
const blogValidator = require('../middleware/validateBlog.middleware')

//Get all published blog posts
blogRouter.get('/', blogController.getAllPublishedBlogs)

blogRouter.get('/search', blogController.getBlogBySearch)

//Get one published blog post by Id
blogRouter.get('/:id', blogController.getPublishedBlogById)

//Get all blog posts by author, fiterable by blog status
blogRouter.get(
  '/user/blogs',
  passport.authenticate('jwt', { session: false }),
  blogController.getBlogsByUser
)

//create new blog post
blogRouter.post(
  '/',
  blogValidator.validateNewBlog,
  passport.authenticate('jwt', { session: false }),
  blogController.createNewBlog
)

//update blog state from "draft" to "published"
blogRouter.put(
  '/:id/state',
  passport.authenticate('jwt', { session: false }),
  blogController.updateBlogStatus
)

//edit blog
blogRouter.put(
  '/:id',
  blogValidator.validateUpdateBlog,
  passport.authenticate('jwt', { session: false }),
  blogController.updateBlogById
)

blogRouter.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  blogController.deleteBlogById
)

module.exports = blogRouter

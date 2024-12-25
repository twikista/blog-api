const Blog = require('../models/blog')
const UserModel = require('../models/user')
const getArticleReadtime = require('../utils/blogReadTime')
const paginationAlgorithm = require('../utils/pagination')

const getAllPublishedBlogs = async (req, res) => {
  const query = req.query
  console.log('query', req.query)

  try {
    if (query.orderby) {
      const blogs = await Blog.find({ state: 'published' }).sort({
        [query.orderby]: -1,
      })
      const paginatedBlogs = paginationAlgorithm(blogs, query.page, query.size)
      return res.status(200).json(paginatedBlogs)
    }

    const blogs = await Blog.find({ state: 'published' })
    const paginatedBlogs = paginationAlgorithm(blogs, query.page, query.size)
    return res.status(200).json(paginatedBlogs)
  } catch (error) {
    console.log(error)
  }
}

const getPublishedBlogById = async (req, res) => {
  try {
    const id = req.params.id
    console.log(id)
    // const blog = await Blog.findById(id).populate('author')
    //increase read_count by whenever this route is visited
    await Blog.findByIdAndUpdate(
      { _id: id, state: 'published' },
      { $inc: { read_count: 1 } }
    )
    const blog = await Blog.findById(id).populate('author')
    return res.status(200).json(blog)
  } catch (error) {
    console.log(error)
    res.status(404).json({ message: 'Reguest blog not found' })
  }
}

const getBlogBySearch = async (req, res) => {
  console.log(req.query)
  try {
    const { criteria, query } = req.query
    console.log({ [criteria]: query })
    const blog = await Blog.find({
      [criteria]: { $regex: `${query}`, $options: 'i' },
      state: 'published',
    })
    if (!blog.length)
      return res
        .status(404)
        .json({ message: `Not Found. No blog has the ${criteria} of ${query}` })
    return res.status(200).json(blog)
  } catch (error) {
    console.log(error)
    res.status(404).json({ message: 'Reguest blog not found' })
  }
}

//get article by author
const getBlogsByUser = async (req, res) => {
  console.log('I ran')
  const query = req.query
  try {
    console.log(query.filter)
    if (query.filter) {
      const filteredBlogs = await Blog.find({
        author: req.user._id,
        state: query.filter,
      })
      const paginatedBlogs = paginationAlgorithm(
        filteredBlogs,
        query.page,
        query.size
      )
      return res.status(200).json(paginatedBlogs)
    }

    const blogsByUser = await Blog.find({ author: req.user._id })
    console.log('blogsByUser======>', blogsByUser)
    const paginatedBlogs = paginationAlgorithm(
      blogsByUser,
      query.page,
      query.size
    )
    console.log('paginatedBlogs======>', paginatedBlogs)
    return res.status(200).json(paginatedBlogs)
  } catch (error) {
    console.log(error)
    res.status(404).send(error)
  }
}

const createNewBlog = async (req, res) => {
  console.log('logged in user', req.user)
  try {
    const user = req.user
    const blog = req.body
    blog.author = user._id
    blog.reading_time = getArticleReadtime(blog.body)
    const newBlog = new Blog(blog)
    const savedBlog = await newBlog.save()
    if (savedBlog?._id) {
      const userObject = await UserModel.findById(user._id)
      userObject.articles = userObject.articles.concat(savedBlog._id)
      await userObject.save()
    }
    return res.status(201).json(savedBlog)
  } catch (error) {
    console.log(error)
    res.status(401).send('something went wrong')
  }
}

const updateBlogById = async (req, res) => {
  const id = req.params.id
  const user = req.user
  try {
    const blog = req.body
    blog.reading_time = getArticleReadtime(blog.body)
    const existingBlog = await Blog.findById(id)
    if (existingBlog.author.toString() !== user._id.toString())
      return res
        .status(401)
        .json({ message: 'you do not have permission to edit this blog' })
    const updatedBlog = await Blog.findByIdAndUpdate({ _id: id }, blog, {
      new: true,
    })
    return res.status(200).json(updatedBlog)
  } catch (error) {
    console.log(error)
    res.status(400).send('something went wrong')
  }
}

const deleteBlogById = async (req, res) => {
  const id = req.params.id
  try {
    const blogToDelete = await Blog.findById(id)
    if (blogToDelete.author.toString() === req.user._id.toString()) {
      const deletedBlog = await Blog.findByIdAndDelete({ _id: id })

      //remove deleted blog from array of articles written by user
      if (deletedBlog._id !== undefined) {
        await UserModel.updateOne(
          { _id: deletedBlog.author },
          { $pull: { articles: deletedBlog._id } }
        )
      }

      return res.status(200).json(deletedBlog)
    }
    return res
      .status(401)
      .json({ message: 'You do not have permission to delete' })
  } catch (error) {
    console.log(error)
    res.status(400).send('something went wrong')
  }
}

const updateBlogStatus = async (req, res) => {
  const id = req.params.id
  try {
    const existingBlog = await Blog.findById({ _id: id })
    if (existingBlog.author.toString() !== req.user._id.toString())
      return res
        .status(401)
        .json({ message: 'you do not have permission to publish this blog' })
    if (existingBlog?.state === 'draft') {
      const publishedBlog = await Blog.findByIdAndUpdate(
        { _id: id },
        { $set: { state: 'published' } },
        { new: true }
      )
      return res.status(200).json(publishedBlog)
    } else {
      return res.status(400).send('Blog already publihed')
    }
  } catch (error) {
    console.log(error)
    res.status(400).send('something went wrong')
  }
}

module.exports = {
  getAllPublishedBlogs,
  getPublishedBlogById,
  getBlogBySearch,
  getBlogsByUser,
  createNewBlog,
  updateBlogById,
  deleteBlogById,
  updateBlogStatus,
}

const BlogModel = require('../models/blog')
const UserModel = require('../models/user')

const initialBlogs = [
  {
    title: 'How To Code in JavaScript6',
    description:
      'This is a brief article about how to code with the JavaScript programming language',
    body: 'This is a brief article about how to code with the JavaScript programming language This is a brief article about how to code with the JavaScript programming language This is a brief article about how to code with the JavaScript programming language This is a brief article about how to code with the JavaScript programming language',
    tags: ['javascript', 'coding', 'web-development'],
    state: 'published',
    read_count: 8,
    reading_time: 4,
  },
  {
    title: 'building scalable web applications',
    description:
      'This is a brief article about how to code with the JavaScript programming language',
    body: 'This is a brief article about how to code with the JavaScript programming language This is a brief article about how to code with the JavaScript programming language This is a brief article about how to code with the JavaScript programming language This is a brief article about how to code with the JavaScript programming language',
    tags: ['programming', 'web-development'],
    state: 'draft',
    read_count: 3,
    reading_time: 5,
  },
]

const initialUser = {
  first_name: 'somebody',
  last_name: 'before',
  email: 'existingemail@gmail.com',
  password: '123456',
  articles: [],
  about: 'I am a random user',
}

const blogsInDB = async (state) => {
  const blogs = state ? await BlogModel.find({ state }) : await BlogModel.find()
  return blogs.map((i) => i.toJSON())
}

const getBlogId = (array, state) => array[state === 'published' ? 0 : 1]._id

const usersInDb = async () => {
  const users = await UserModel.find({})
  return users.map((user) => user.toJSON())
}

const addInitialUserToDb = async (user = initialUser) => {
  const newUser = new UserModel(user)
  await newUser.save()
}

const addInitialNotesToDb = async () => {
  const newBlogsArray = initialBlogs.map((blog) => new BlogModel(blog))
  const promiseArray = newBlogsArray.map((blog) => blog.save())
  const savedBlogs = await Promise.all(promiseArray)
  return savedBlogs
}

module.exports = {
  initialBlogs,
  initialUser,
  addInitialNotesToDb,
  addInitialUserToDb,
  getBlogId,
  blogsInDB,
  usersInDb,
}

const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../../app')

const UserModel = require('../models/user')
const BlogModel = require('../models/blog')
const helper = require('./helper')

mongoose.set('bufferTimeoutMS', 30000)

const api = supertest(app)

describe('user signup', () => {
  beforeEach(async () => {
    await UserModel.deleteMany()
  }, 500000)

  test('user should be able to sign up', async () => {
    const userSignupData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@gmail.com',
      password: '123456',
      articles: [],
      about: 'I am a software developer and i am from Nigeria',
    }
    const response = await api
      .post('/api/v1/auth/signup')
      .send(userSignupData)
      .expect(200)

    const userInDb = await helper.usersInDb()
    expect(userInDb.length).toBe(1)

    expect(response.body.message).toBe('Signup successful')
    expect(response.body.user.email).toBe(userSignupData.email)
  }, 10000)

  test('signups without required email field fails with apppropriate status code', async () => {
    const userSignupData = {
      first_name: 'John',
      last_name: 'Doe',
      // email: 'johndoe@gmail.com',
      password: '123456',
      articles: [],
      about: 'I am a software developer',
    }
    const response = await api
      .post('/api/v1/auth/signup')
      .send(userSignupData)
      .expect(406)
    console.log(response)
    expect(response.text).toBe('"email" is required')
    // assert.strictEqual(response.body[0].includes(userSignupData.email), false)
  }, 10000)

  test('email field must be unique', async () => {
    const userSignupData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'existingemail@gmail.com',
      password: '123456',
      articles: [],
      about: 'I am a software developer who loves to code web applications',
    }

    await helper.addInitialUserToDb()

    const response = await api
      .post('/api/v1/auth/signup')
      .send(userSignupData)
      .expect(400)
    // console.log(response)
    // expect(response.error).to.have.deep.property('message').to.contain('oops')

    expect(response._body.error).toBe(' provided email already exist ')
    expect(JSON.parse(response.text).type).toBe('ValidationError')
  }, 30000)
})

describe('user login', () => {
  beforeEach(async () => {
    await UserModel.deleteMany()
  }, 500000)

  test('registered users should be able to signin', async () => {
    await helper.addInitialUserToDb()

    const loginCredential = {
      email: helper.initialUser.email,
      password: helper.initialUser.password,
    }
    const response = await api
      .post('/api/v1/auth/login')
      .send(loginCredential)
      .expect(200)
    //   .expect('Content-Type', /application\/json/)

    // auth.token = response.body.token
    expect(response.body.token).toBeDefined()
    console.log(response.token)
  }, 30000)

  test('unregistered users cannot signin', async () => {
    await helper.addInitialUserToDb()

    const loginCredential = {
      email: 'meandyou@gmail.com',
      password: '123456',
    }
    const response = await api
      .post('/api/v1/auth/login')
      .send(loginCredential)
      .expect(404)
    //   .expect('Content-Type', /application\/json/)

    // auth.token = response.body.token
    expect(response.body.token).toBeUndefined()
    console.log(response)
  }, 30000)
})

describe('get published blogs', () => {
  let publishedBlogId = null
  let draftBlogId = null
  beforeEach(async () => {
    await BlogModel.deleteMany()
    const blogs = await helper.addInitialNotesToDb()
    publishedBlogId = helper.getBlogId(blogs, 'published')
    draftBlogId = helper.getBlogId(blogs, 'draft')
  }, 50000)

  test('list of blog that can be viewed by Logged in and not logged in users should be searchable', async () => {
    // await helper.addInitialNotesToDb()
    const blogsInDB = await helper.blogsInDB()
    console.log('blogsInDB=====>', blogsInDB)
    ///api/v1/blogs/search?criteria=title&query=Building Scaleable Web Applications
    const response = await api
      .get('/api/v1/blogs/search?criteria=tags&query=web-development')
      .expect(200)
    console.log(response.body)
    expect(response.body).toHaveLength(1)
    expect(response.body[0].tags.includes('web-development')).toBeTruthy()
  })

  test('Logged in and not logged in users should be able to get a list of published blogs', async () => {
    const response = await api.get('/api/v1/blogs').expect(200)
    // console.log(response.body)
    const arrayOfBlogState = response.body.blogs.map((blog) => blog.state)

    expect(response.body.blogs).toHaveLength(1)
    expect(arrayOfBlogState.includes('draft')).toBeFalsy()
  })

  test('Logged in and not logged in users should be able to to get a published blog', async () => {
    const response = await api
      .get(`/api/v1/blogs/${publishedBlogId}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(JSON.stringify(response.body._id)).toBe(
      JSON.stringify(publishedBlogId)
    )
    expect(response.body.state).toBe('published')
  })

  //test for pagaination functionality
  test('list of blog that can be viewed by Logged in and not logged in users should be paginated', async () => {
    await helper.addInitialNotesToDb()
    const response = await api.get('/api/v1/blogs?page=1&size=1').expect(200)

    expect(response.body.blogs).toHaveLength(1)
    expect(response.body.pageCount).toBe(2)
  })
  //test search functionality
})

describe('Logged in users can perform CREATE, READ, UPDATE and DELETE operation on blogs', () => {
  let auth = {}
  let publishedBlogId = null
  let draftBlogId = null
  const newBlog = {
    title: 'Learning javascript with AltSchool Africa',
    description:
      'This is a brief article about how to learn to code with the JavaScript at altschool africa',
    body: 'This is a brief article about how to code with the JavaScript programming language This is a brief article about how to code with the JavaScript programming language This is a brief article about how to code with the JavaScript programming language This is a brief article about how to code with the JavaScript programming language',
    tags: ['altschool', 'learning'],
    state: 'draft',
    read_count: 2,
    reading_time: 2,
  }

  beforeAll(async () => {
    await UserModel.deleteMany()
    const userToAddToDb = {
      first_name: 'john',
      last_name: 'doe',
      email: 'johndoe@gmail.com',
      password: '123456',
      articles: [],
      about: 'I am a Software developer in the who build exceptional ui',
    }
    await helper.addInitialUserToDb(userToAddToDb)
    const loginCredential = { email: 'johndoe@gmail.com', password: '123456' }
    const response = await api
      .post('/api/v1/auth/login')
      .send(loginCredential)
      .expect(200)
    auth.token = response.body.token
  }, 50000)

  beforeEach(async () => {
    await BlogModel.deleteMany()
    const blogs = await helper.addInitialNotesToDb()
    publishedBlogId = helper.getBlogId(blogs, 'published')
    draftBlogId = helper.getBlogId(blogs, 'draft')
  }, 50000)

  describe('create blog operation', () => {
    test('is successful if user is logged in', async () => {
      const response = await api
        .post('/api/v1/blogs')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(newBlog)
        .expect(201)

      const blogs = await helper.blogsInDB()

      expect(blogs).toHaveLength(helper.initialBlogs.length + 1)
      expect(response.body.state).toBe('draft')
      expect(response.body.title).toBe(newBlog.title)
    })

    test('fails with proper status code if user is not logged in', async () => {
      await api.post('/api/v1/blogs').send(newBlog).expect(401)

      const blogsAftercreateBlogCall = await helper.blogsInDB()
      expect(blogsAftercreateBlogCall).toHaveLength(helper.initialBlogs.length)
    })
  })

  describe('update operation', () => {
    test('blog state can be updated from DRAFT to PUBLISHED if logged in user is owner of the blog', async () => {
      //add new blog
      const blogCreatedByLoggedInuser = await api
        .post('/api/v1/blogs')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(newBlog)
        .expect(201)

      const blogToUpdate = blogCreatedByLoggedInuser.body
      const blog = { ...blogToUpdate, state: 'publihed' }

      const response = await api
        .put(`/api/v1/blogs/${blogToUpdate._id}/state`)
        .set('Authorization', `Bearer ${auth.token}`)
        .send(blog)
        .expect(200)

      const updatedBlog = response.body

      expect(updatedBlog.state).not.toBe(blogToUpdate.state)
      expect(updatedBlog.state).toBe('published')
    })

    test('blog can be updated if user is logged in and is owner of the blog', async () => {
      //add new blog
      const blogCreatedByLoggedInuser = await api
        .post('/api/v1/blogs')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(newBlog)
        .expect(201)

      const blogToUpdate = blogCreatedByLoggedInuser.body
      const blog = {
        ...blogToUpdate,
        title: 'learning product management with altschool africa',
        state: 'published',
      }

      const response = await api
        .put(`/api/v1/blogs/${blogToUpdate._id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .send(blog)
        .expect(200)

      const updatedBlog = response.body

      expect(updatedBlog.title).toBe(blog.title)
      expect(updatedBlog.state).toBe('published')
    })
  })

  describe('delete blog operation', () => {
    test('blog can be deleted in draft or published state if loggin in user is owner of the blogg', async () => {
      //add new blog
      const blogCreatedByLoggedInuser = await api
        .post('/api/v1/blogs')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(newBlog)
        .expect(201)

      const blogsInDbBeforeDelete = await helper.blogsInDB()

      const blogToDelete = blogCreatedByLoggedInuser.body
      const response = await api
        .delete(`/api/v1/blogs/${blogToDelete._id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .expect(200)

      const blogsInDbAfterDelete = await helper.blogsInDB()

      expect(blogsInDbAfterDelete.length).toBe(blogsInDbBeforeDelete.length - 1)
      expect(blogCreatedByLoggedInuser.body.title).toBe(response.body.title)
    })
  })

  describe('read blog operation', () => {
    test('The owner of the blog should be able to get a list of their blogs', async () => {
      //add new blog
      await api
        .post('/api/v1/blogs')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(newBlog)
        .expect(201)
      //add new blog
      await api
        .post('/api/v1/blogs')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ ...newBlog, title: 'another blog', state: 'published' })
        .expect(201)

      const response = await api
        .get(`/api/v1/blogs/user/blogs`)
        .set('Authorization', `Bearer ${auth.token}`)
        .expect(200)
      expect(response.body.blogs.length).toBe(2)
    })

    //test for pagination
    test('The endpoint to get owner blogs should be paginated', async () => {
      //add new blog
      await api
        .post('/api/v1/blogs')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(newBlog)
        .expect(201)
      //add new blog
      await api
        .post('/api/v1/blogs')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ ...newBlog, title: 'another blog', state: 'published' })
        .expect(201)

      const response = await api
        .get(`/api/v1/blogs/user/blogs?page=1&size=1`)
        .set('Authorization', `Bearer ${auth.token}`)
        .expect(200)
      console.log('here=====>', response.body)
      expect(response.body.blogs.length).toBe(1)
      expect(response.body.page).toBe(1)
      expect(response.body.pageCount).toBe(2)
    })

    //test for filter
    test('The owner of the blog should be able to get a filtered list of their blogs', async () => {
      //add new blog
      await api
        .post('/api/v1/blogs')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(newBlog)
        .expect(201)
      //add new blog
      await api
        .post('/api/v1/blogs')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ ...newBlog, title: 'another blog', state: 'published' })
        .expect(201)

      const response = await api
        .get(`/api/v1/blogs/user/blogs?filter=draft`)
        .set('Authorization', `Bearer ${auth.token}`)
        .expect(200)
      console.log('here=====>', response.body)
      expect(response.body.blogs.length).toBe(1)
      expect(response.body.blogs[0].state).toBe('draft')
    })
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})

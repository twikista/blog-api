# Blogging Api

The Blogging Api is REST API that expose different end-points that enable users to create account, create blogs, perform CRUD operations on blogs created by them, and also view blogs created by other users.

The API was built as capstone project for 3MTT Backend Enginerering internship Powered by the Federal Ministry of Communications, Innovation and Digital Economy in collaboration with ALT School Africa.

Web-Mart is a frontend implemntation of the [faskestore](https://fakestoreapi.com/) e-commerce REST Api. At the top level, the app utilizes the native fetch API to retrieve data from the server (backend) and then uses React.js to implement the user interface. The app features a home page, products page, product page, contact page, and cart page.

## Implemented Features

- User Sign up and authentication
- CRUD functionality for blogs
- API testing

## Main Technologies Used

- NODE.js
- Express
- MongoDB (Mongoose)
- Passport.js
- Jest and supertest

## Entity Relationship Diagram (ERD)

![ERD](./blog_api_erd.png)

## Setup

To run this application locally:

1. Clone this repo

```bash
$ git clone https://github.com/twikista/blog-api
```

2. Go the root of the cloned repo and install dependencies

```bash
$ cd blog-api && npm install
```

## Usage

To start the application, run ` npm run dev` to start the development server at http://localhost:4000/

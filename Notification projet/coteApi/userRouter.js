const express = require('express')
const userController = require('../controller/userController')

const userRouter = express.Router()

userRouter.post('/login', userController.login)
userRouter.get('/connected', userController.findConnectedUser)
userRouter.post('/', userController.create)
userRouter.post('/logout', userController.logOut)

module.exports = userRouter
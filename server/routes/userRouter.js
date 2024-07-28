const userController = require('../controllers/userController');

//import { Router } from "express";
const router = require('express').Router();

router.post('/register', userController.register)
router.post('/refresh_token', userController.refreshToken)
router.post('/login', userController.login)
router.get('/logout', userController.logout)

module.exports = router
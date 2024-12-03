const express = require('express');
const router = express.Router();
const {body} = require("express-validation");

router.post('/register',[
    body('fullname.firstname').notEmpty().withMessage('Fullname is required'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match')
],

userController.registerUser
)

module.exports = router;
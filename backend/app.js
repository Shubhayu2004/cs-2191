const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const connectTodb = require('./db/db');

connectTodb();

app.get('/' , (req,res) => {
    res.send('Hello world');
});

module.exports = app;